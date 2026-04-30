"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { formatWeight, stockColor } from "@/lib/utils";

interface Props {
  printer: any;
  status?: any;
  activeSpool?: any;
  filament?: any;
  firmware?: any;
  onClose: () => void;
  onSpoolClick?: () => void;
}

export default function PrinterModal({ printer, status, activeSpool, filament, firmware, onClose, onSpoolClick }: Props) {
  const isConnected = status && status.status !== "no_data";
  const printing = status?.gcode_state === "RUNNING";
  const pct = activeSpool ? Math.round((activeSpool.remaining_g / activeSpool.total_weight_g) * 100) : 0;

  return (
    <Modal open={!!printer} onClose={onClose} title={printer?.name ?? "Printer"} size="lg">
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">{printer?.name}</p>
            <p className="text-sm text-muted">{printer?.dev_model_name ?? "Bambu Lab Printer"}</p>
            {printer?.dev_id && (
              <p className="text-xs text-zinc-600 font-mono mt-1">{printer.dev_id}</p>
            )}
          </div>
          <Badge variant={printer?.online ? "success" : "default"}>
            {printer?.online ? "Online" : "Offline"}
          </Badge>
        </div>

        {/* Live Stats */}
        {isConnected && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Nozzle", value: `${status?.nozzle_temper ?? "—"}°C`, sub: status?.nozzle_target_temper ? `→ ${status.nozzle_target_temper}°C` : "" },
              { label: "Bed", value: `${status?.bed_temper ?? "—"}°C`, sub: status?.bed_target_temper ? `→ ${status.bed_target_temper}°C` : "" },
              { label: "Speed Level", value: `Lvl ${status?.spd_lvl ?? "—"}`, sub: status?.spd_mag ? `${status.spd_mag}%` : "" },
              { label: "State", value: status?.gcode_state ?? "—", sub: "" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
                <p className="text-[10px] text-muted mb-1">{label}</p>
                <p className="text-base font-bold">{value}</p>
                {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Current Print */}
        {printing && (
          <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-4">
            <p className="text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wide">Printing</p>
            <p className="font-medium">{status?.subtask_name ?? "Unknown"}</p>
            <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${status?.mc_percent ?? 0}%` }} />
            </div>
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>{status?.mc_percent ?? 0}%</span>
              <span>{status?.mc_remaining_time ? `${status.mc_remaining_time}min left` : ""}</span>
            </div>
          </div>
        )}

        {/* Loaded Spool */}
        {activeSpool && filament && (
          <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 cursor-pointer hover:border-zinc-600/50 transition-colors" onClick={onSpoolClick}>
            <p className="text-xs text-muted font-semibold mb-3 uppercase tracking-wide">Loaded Spool</p>
            <div className="flex items-center gap-4">
              <SpoolIndicator remaining={activeSpool.remaining_g} total={activeSpool.total_weight_g} color={filament.color_hex} size={72} />
              <div className="flex-1">
                <p className="font-medium">{filament.color_name}</p>
                <p className="text-sm text-muted">{filament.brand} · {filament.material}</p>
                <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: stockColor(pct, filament.color_hex) }} />
                </div>
                <p className="text-xs text-muted mt-1">{formatWeight(activeSpool.remaining_g)} remaining</p>
              </div>
            </div>
          </div>
        )}

        {/* Firmware */}
        {firmware?.firmware && (
          <div>
            <p className="text-xs text-muted font-semibold mb-2 uppercase tracking-wide">Firmware</p>
            <div className="grid grid-cols-2 gap-2">
              {(firmware.firmware || []).map((fw: any) => (
                <div key={`${fw.name}-${fw.version}`} className="rounded-lg bg-zinc-900/40 border border-zinc-800/40 p-2.5">
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
