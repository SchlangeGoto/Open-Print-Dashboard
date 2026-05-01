"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { formatWeight, stockColor } from "@/lib/utils";
import { Settings, Zap } from "lucide-react";

interface Props {
  printer: any;
  status?: any;
  activeSpool?: any;
  filament?: any;
  firmware?: any;
  printerIp?: string;
  onClose: () => void;
  onSpoolClick?: () => void;
}

export default function PrinterModal({
  printer,
  status,
  activeSpool,
  filament,
  firmware,
  printerIp,
  onClose,
  onSpoolClick,
}: Props) {
  const router = useRouter();
  const isConnected = status && status.status !== "no_data";
  const printing = status?.gcode_state === "RUNNING";
  const pct = activeSpool
    ? Math.round((activeSpool.remaining_g / activeSpool.total_weight_g) * 100)
    : 0;

  // Firmware version — pick the OTA module if available
  const otaVersion =
    firmware?.firmware?.find((m: any) => m.name === "ota")?.version ??
    firmware?.firmware?.[0]?.version ??
    null;

  // Energy — Bambu MQTT may expose these fields
  const energyW =
    status?.mc_print_energy ??
    status?.power ??
    null;

  return (
    <Modal
      open={!!printer}
      onClose={onClose}
      title={printer?.name ?? "Printer"}
      size="lg"
    >
      <div className="space-y-5">

        {/* ── Header: name, model, IP, firmware, status ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-xl font-bold truncate">{printer?.name}</p>
            <p className="text-sm text-muted">
              {printer?.dev_model_name ?? "Bambu Lab Printer"}
            </p>
            {/* IP and firmware shown small, side by side */}
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
              {printerIp && (
                <p className="text-xs font-mono text-zinc-500">{printerIp}</p>
              )}
              {otaVersion && (
                <p className="text-xs font-mono text-zinc-500">
                  fw {otaVersion}
                </p>
              )}
              {printer?.dev_id && (
                <p className="text-xs font-mono text-zinc-600 truncate">
                  {printer.dev_id}
                </p>
              )}
            </div>
          </div>
          <Badge variant={printer?.online ? "success" : "default"} className="shrink-0">
            {printer?.online ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* ── Live stats: nozzle, bed, speed, state ── */}
        {isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <p className="text-[10px] text-muted mb-1">Nozzle</p>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: "#FF6D28" }}
              >
                {status?.nozzle_temper ?? "—"}°C
              </p>
              {status?.nozzle_target_temper && (
                <p className="text-[10px] text-muted">
                  → {status.nozzle_target_temper}°C
                </p>
              )}
            </div>
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <p className="text-[10px] text-muted mb-1">Bed</p>
              <p
                className="text-lg font-bold tabular-nums"
                style={{ color: "#00D0B0" }}
              >
                {status?.bed_temper ?? "—"}°C
              </p>
              {status?.bed_target_temper && (
                <p className="text-[10px] text-muted">
                  → {status.bed_target_temper}°C
                </p>
              )}
            </div>
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <p className="text-[10px] text-muted mb-1">Speed Level</p>
              <p className="text-lg font-bold">
                {status?.spd_lvl ?? "—"}
              </p>
              {status?.spd_mag != null && (
                <p className="text-[10px] text-muted">{status.spd_mag}%</p>
              )}
            </div>
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <p className="text-[10px] text-muted mb-1">State</p>
              <p className="text-sm font-bold mt-0.5">
                {status?.gcode_state ?? "—"}
              </p>
            </div>
          </div>
        )}

        {/* ── Energy consumption ── */}
        <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={13} className="text-amber-400" />
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">
              Energy
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted mb-0.5">Current Draw</p>
              <p className="text-sm font-medium">
                {energyW != null ? `${energyW} W` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted mb-0.5">Fan Speed</p>
              <p className="text-sm font-medium">
                {status?.cooling_fan_speed != null
                  ? `${Math.round((status.cooling_fan_speed / 15) * 100)}%`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Current Print ── */}
        {printing && (
          <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4">
            <p className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wide">
              Printing
            </p>
            <p className="font-medium">{status?.subtask_name ?? "Unknown"}</p>
            <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${status?.mc_percent ?? 0}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span className="tabular-nums">{status?.mc_percent ?? 0}%</span>
              <span>
                {status?.mc_remaining_time
                  ? `${status.mc_remaining_time} min left`
                  : ""}
              </span>
            </div>
          </div>
        )}

        {/* ── Loaded Spool ── */}
        {activeSpool && filament ? (
          <div
            className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 cursor-pointer hover:border-zinc-600/50 transition-colors"
            onClick={onSpoolClick}
          >
            <p className="text-xs text-muted font-semibold mb-3 uppercase tracking-wide">
              Loaded Spool
            </p>
            <div className="flex items-center gap-4">
              <SpoolIndicator
                remaining={activeSpool.remaining_g}
                total={activeSpool.total_weight_g}
                color={filament.color_hex}
                size={72}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{filament.color_name}</p>
                <p className="text-sm text-muted">
                  {filament.brand} · {filament.material}
                </p>
                <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: stockColor(pct, filament.color_hex),
                    }}
                  />
                </div>
                <p className="text-xs text-muted mt-1">
                  {formatWeight(activeSpool.remaining_g)} remaining
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800/30 bg-zinc-900/20 p-4 text-center">
            <p className="text-xs text-zinc-600">No spool loaded</p>
          </div>
        )}

        {/* ── Settings for printer ── */}
        <div className="rounded-xl border border-zinc-800/40 bg-zinc-900/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Printer Settings</p>
              <p className="text-xs text-muted mt-0.5">
                IP address, access code, serial number
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                router.push("/dashboard/settings");
              }}
            >
              <Settings size={13} /> Configure
            </Button>
          </div>
        </div>

        {/* ── Firmware detail (all modules, small) ── */}
        {firmware?.firmware && firmware.firmware.length > 0 && (
          <div>
            <p className="text-xs text-muted font-semibold mb-2 uppercase tracking-wide">
              Firmware Modules
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(firmware.firmware as any[]).map((fw) => (
                <div
                  key={`${fw.name}-${fw.version}`}
                  className="rounded-lg bg-zinc-900/40 border border-zinc-800/40 p-2.5"
                >
                  <p className="text-[10px] text-muted">{fw.name}</p>
                  <p className="text-xs font-mono mt-0.5">{fw.version}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}