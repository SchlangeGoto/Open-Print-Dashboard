"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { formatWeight, formatDate, formatCurrency, stockColor } from "@/lib/utils";
import { Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  spool: any;
  filament?: any;
  onClose: () => void;
  onActivate?: () => Promise<void>;
}

export default function SpoolModal({ spool, filament, onClose, onActivate }: Props) {
  const pct = spool ? Math.round((spool.remaining_g / spool.total_weight_g) * 100) : 0;

  async function handleActivate() {
    if (!onActivate) return;
    try {
      await onActivate();
      toast.success("Spool activated");
    } catch {
      toast.error("Failed to activate");
    }
  }

  return (
    <Modal open={!!spool} onClose={onClose} size="md">
      <div className="space-y-5">
        {/* Visual */}
        <div className="flex flex-col items-center gap-3 py-4 bg-zinc-900/40 rounded-xl border border-zinc-800/40">
          <SpoolIndicator
            remaining={spool?.remaining_g ?? 0}
            total={spool?.total_weight_g ?? 1000}
            color={filament?.color_hex ?? "#555"}
            size={140}
          />
          <div className="text-center">
            <p className="text-lg font-bold">{filament?.color_name ?? "Unknown Filament"}</p>
            <p className="text-sm text-muted">{filament?.brand} · {filament?.material}</p>
          </div>
          <div className="w-40">
            <div className="flex justify-between text-xs text-muted mb-1">
              <span>{Math.round(spool?.remaining_g ?? 0)}g</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: stockColor(pct, filament?.color_hex) }}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Status", value: spool?.active ? "Active" : "Stored" },
            { label: "Material", value: filament?.material ?? "—" },
            { label: "Total Weight", value: formatWeight(spool?.total_weight_g) },
            { label: "Remaining", value: formatWeight(spool?.remaining_g) },
            { label: "Price / kg", value: spool?.price_per_kg ? formatCurrency(spool.price_per_kg) : "—" },
            { label: "Last Used", value: formatDate(spool?.last_used_at) },
            { label: "Purchased", value: formatDate(spool?.purchased_at) },
            { label: "Added", value: formatDate(spool?.created_at) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <p className="text-[10px] text-muted mb-0.5">{label}</p>
              <p className="text-sm font-medium text-zinc-200">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          {!spool?.active && onActivate && (
            <Button className="flex-1" onClick={handleActivate}>
              <Zap size={14} /> Load Spool
            </Button>
          )}
          {spool?.active && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 flex-1 justify-center">
              <Check size={14} /> Currently loaded
            </div>
          )}
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
}
