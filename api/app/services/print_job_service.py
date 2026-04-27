import logging
import time
from datetime import datetime, timezone

from sqlmodel import Session, select, desc

from app.db.database import engine
from app.db.models import PrintJob, Spool, Filament
from app.services.bambu_cloud import BambuCloudClient

logger = logging.getLogger("uvicorn.error")

_MAX_POLL_TRIES = 30


class PrintJobService:
    """Handles saving and updating print job records triggered by MQTT events."""

    def __init__(self, cloud_client: BambuCloudClient, serial: str) -> None:
        self._cloud = cloud_client
        self._serial = serial

    # ──────────────────────────────────────────────
    # Public entry points called from BambuClient
    # ──────────────────────────────────────────────

    def save_print_job_init(self, current_status: dict) -> None:
        """Called when a print starts — polls cloud until task reaches status 4 (RUNNING)."""
        try:
            task = self._cloud.get_latest_task_for_printer(self._serial)
            if not task:
                logger.warning("No cloud task found on print start")
                return

            task = self._poll_until(task, target_status=4)
            if task is None:
                return

            with Session(engine) as session:
                active_spool = session.exec(
                    select(Spool).where(Spool.active == True)
                ).first()

                job = PrintJob(
                    spool_id=active_spool.id if active_spool else None,
                    title=task.get("title", current_status.get("subtask_name", "Unknown")),
                    cover=task.get("cover"),
                    weight=task.get("weight"),
                    duration_seconds=task.get("costTime"),
                    start_time=task.get("startTime"),
                    status=task.get("status"),
                    bambu_task_id=str(task.get("id")),
                    device_id=self._serial,
                    ams_detail_mapping=str(task.get("amsDetailMapping", [])),
                )
                session.add(job)
                session.commit()
                logger.info(f"PrintJob saved: {job.title} — {task.get('weight')}g used")

        except Exception as e:
            logger.error(f"Failed to save print job init: {e}")

    def save_print_job(self) -> None:
        """Called when a print finishes — polls cloud until task leaves status 4, then persists."""
        try:
            task = self._cloud.get_latest_task_for_printer(self._serial)
            if not task:
                logger.warning("No cloud task found after print finished")
                return

            logger.info("Print finished — waiting for cloud to catch up...")
            task = self._poll_while(task, running_status=4)
            if task is None:
                return

            with Session(engine) as session:
                active_spool = session.exec(
                    select(Spool).where(Spool.active == True)
                ).first()

                estimated_cost = self._calculate_cost(session, active_spool, task)

                job = session.exec(
                    select(PrintJob).where(PrintJob.bambu_task_id == str(task.get("id")))
                ).first()

                if not job:
                    job = PrintJob(
                        bambu_task_id=str(task.get("id")),
                        device_id=self._serial,
                    )
                    session.add(job)

                job.spool_id = active_spool.id if active_spool else None
                job.title = task.get("title")
                job.cover = task.get("cover")
                job.weight = task.get("weight")
                job.estimated_cost = estimated_cost
                job.duration_seconds = task.get("costTime")
                job.start_time = task.get("startTime")
                job.finished_at = task.get("endTime")
                job.status = task.get("status")
                job.bambu_task_id = str(task.get("id"))
                job.device_id = self._serial
                job.ams_detail_mapping = str(task.get("amsDetailMapping", []))

                session.add(job)
                self._deduct_filament_from_spools(session, task)
                session.commit()
                logger.info(f"PrintJob saved: {job.title} — {task.get('weight')}g used")

        except Exception as e:
            logger.error(f"Failed to save print job: {e}")

    # ──────────────────────────────────────────────
    # Private helpers
    # ──────────────────────────────────────────────

    def _poll_until(self, task: dict, target_status: int) -> dict | None:
        """Poll cloud until task reaches *target_status*, return None on timeout."""
        for _ in range(_MAX_POLL_TRIES):
            if task.get("status") == target_status:
                return task
            time.sleep(1)
            task = self._cloud.get_latest_task_for_printer(self._serial)
            if not task:
                break
        logger.error(f"Timed out waiting for task status {target_status}")
        return None

    def _poll_while(self, task: dict, running_status: int) -> dict | None:
        """Poll cloud while task is at *running_status*, return None on timeout."""
        for _ in range(_MAX_POLL_TRIES):
            if task.get("status") != running_status:
                return task
            time.sleep(1)
            task = self._cloud.get_latest_task_for_printer(self._serial)
            if not task:
                break
        logger.error(f"Timed out waiting for task to leave status {running_status}")
        return None

    def _calculate_cost(
        self, session: Session, active_spool: Spool | None, task: dict
    ) -> float | None:
        """Estimate print cost from average price of the last 5 spools of the same filament."""
        if not active_spool or not task.get("weight"):
            return None

        recent_spools = session.exec(
            select(Spool)
            .where(Spool.filament_id == active_spool.filament_id)
            .where(Spool.price_per_kg != None)
            .order_by(desc(Spool.created_at))
            .limit(5)
        ).all()

        if not recent_spools:
            return None

        avg_price = sum(s.price_per_kg for s in recent_spools) / len(recent_spools)
        cost = round((task["weight"] / 1000) * avg_price, 2)
        logger.info(f"Estimated cost: €{cost} (avg €{avg_price}/kg)")
        return cost

    def _deduct_filament_from_spools(self, session: Session, task: dict) -> None:
        """
        Deduct filament usage per colour slot from the correct spools.
        Falls back to deducting from the active spool when mapping is unavailable.
        """
        ams_mapping = task.get("amsDetailMapping", [])

        if not ams_mapping:
            active_spool = session.exec(
                select(Spool).where(Spool.active == True)
            ).first()
            if active_spool and task.get("weight"):
                active_spool.remaining_g = max(0, active_spool.remaining_g - task["weight"])
                active_spool.last_used_at = datetime.now(timezone.utc)
                logger.info(f"Deducted {task['weight']}g from active spool {active_spool.id}")
            return

        for slot in ams_mapping:
            used_g = slot.get("weight", 0)
            if not used_g:
                continue

            filament_id = slot.get("filamentId")
            filament_type = slot.get("filamentType")

            spool = session.exec(
                select(Spool)
                .join(Filament, Spool.filament_id == Filament.id)
                .where(Filament.bambu_info_idx == filament_id)
                .where(Spool.active == True)
            ).first()

            if not spool:
                spool = session.exec(
                    select(Spool).where(Spool.active == True)
                ).first()

            if spool:
                spool.remaining_g = max(0, spool.remaining_g - used_g)
                spool.last_used_at = datetime.now(timezone.utc)
                logger.info(f"Deducted {used_g}g ({filament_type}) from spool {spool.id}")
