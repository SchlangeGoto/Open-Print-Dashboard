"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { formatWeight } from "@/lib/utils";
import SpoolModal from "./SpoolModal";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  filament: any;
  spools?: any[];
  onClose: () => void;
  onRefresh?: () => void;
}

export default function FilamentModal({ filament, spools = [], onClose, onRefresh }: Props) {
  const [selectedSpool, setSelectedSpool] = useState<any>(null);

  async function handleActivate(spoolId: number) {
    try {
      await api.activateSpool(spoolId);
      toast.success("Spool activated");
      onRefresh?.();
      setSelectedSpool(null);
    } catch {
      toast.error("Failed to activate");
    }
  }

  const totalRemaining = spools.reduce((sum, s) => sum + s.remaining_g, 0);
  return (
    <>
      <Modal open={!!filament} onClose={onClose} size="lg">
        <div className="space-y-5">
          {/* Color swatch + title */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl border-2 border-zinc-700 shadow-lg shrink-0"
              style={{ backgroundColor: filament?.color_hex }} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{filament?.color_name}</h2>
                <Badge variant="default">{filament?.material}</Badge>
              </div>
              <p className="text-sm text-muted">{filament?.brand}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "In Stock", value: formatWeight(totalRemaining) },
              { label: "Spools", value: spools.length },
              { label: "Diameter", value: filament?.diameter ? `${filament.diameter}mm` : "1.75mm" },
              { label: "Nozzle Temp", value: filament?.nozzle_temp_min && filament?.nozzle_temp_max ? `${filament.nozzle_temp_min}–${filament.nozzle_temp_max}°C` : "—" },
              { label: "Bed Temp", value: filament?.bed_temp ? `${filament.bed_temp}°C` : "—" },
              { label: "Profile ID", value: filament?.bambu_info_idx ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
                <p className="text-[10px] text-muted mb-0.5">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Spools */}
          {spools.length > 0 && (
            <div>
              <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-3">Spools ({spools.length})</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {spools.map((spool) => {
                  const sp = Math.round((spool.remaining_g / spool.total_weight_g) * 100);
                  return (
                    <div key={spool.id}
                      className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-3 cursor-pointer hover:border-zinc-600/50 transition-colors flex flex-col items-center gap-2"
                      onClick={() => setSelectedSpool(spool)}
                    >
                      <SpoolIndicator remaining={spool.remaining_g} total={spool.total_weight_g} color={filament?.color_hex ?? "#555"} size={72} />
                      <div className="text-center">
                        <p className="text-xs font-medium">{formatWeight(spool.remaining_g)}</p>
                        <p className="text-[10px] text-muted">{sp}%</p>
                        {spool.active && <Badge variant="success" className="mt-1 text-[9px]">Active</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {selectedSpool && (
        <SpoolModal
          spool={selectedSpool}
          filament={filament}
          onClose={() => setSelectedSpool(null)}
          onActivate={() => handleActivate(selectedSpool.id)}
        />
      )}
    </>
  );
}
