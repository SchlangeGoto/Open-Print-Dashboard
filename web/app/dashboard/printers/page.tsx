"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { EmptyState } from "@/components/ui/EmptyState";
import { stockColor } from "@/lib/utils";
import { Printer, Thermometer, RefreshCw } from "lucide-react";
import PrinterModal from "@/components/modals/PrinterModal";
import SpoolModal from "@/components/modals/SpoolModal";

export default function PrintersPage() {
  const [printers, setPrinters] = useState<any[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [activeSpool, setActiveSpool] = useState<any>(null);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [firmware, setFirmware] = useState<Record<string, any>>({});
  const [printerIp, setPrinterIp] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [selectedSpool, setSelectedSpool] = useState<any>(null);

  async function load() {
    try {
      const [devs, st, sp, fil, ipSetting] = await Promise.all([
        api.getPrinters().catch(() => []),
        api.getPrinterStatus().catch(() => null),
        api.getActiveSpool().catch(() => null),
        api.getFilaments().catch(() => []),
        api.getSetting("printer_ip").catch(() => null),
      ]);
      setPrinters(devs);
      setStatus(st);
      setActiveSpool(sp);
      setFilaments(fil);
      if (ipSetting?.value) setPrinterIp(ipSetting.value);

      const fwMap: Record<string, any> = {};
      await Promise.all(
        devs.map(async (d: any) => {
          const fw = await api.getFirmware(d.dev_id).catch(() => null);
          if (fw) fwMap[d.dev_id] = fw;
        })
      );
      setFirmware(fwMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, []);

  const activeFilament = activeSpool
    ? filaments.find((f) => f.id === activeSpool.filament_id)
    : null;
  const printing = status?.gcode_state === "RUNNING";
  const pct = activeSpool
    ? Math.round((activeSpool.remaining_g / activeSpool.total_weight_g) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 skeleton w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-64 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Printers</h1>
          <p className="text-xs text-muted mt-0.5">Monitor your printers</p>
        </div>
        <Button variant="secondary" size="sm" onClick={load}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {printers.length === 0 ? (
        <EmptyState
          icon={Printer}
          title="No printers found"
          description="Connect a Bambu Lab account to see your printers."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {printers.map((dev) => (
            <Card
              key={dev.dev_id}
              onClick={() => setSelectedPrinter(dev)}
              hoverable
              className="space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-accent/10 p-3">
                    <Printer size={20} className="text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{dev.name}</p>
                    <p className="text-xs text-muted">
                      {dev.dev_model_name ?? dev.dev_id}
                    </p>
                  </div>
                </div>
                <Badge variant={dev.online ? "success" : "default"}>
                  {dev.online ? "Online" : "Offline"}
                </Badge>
              </div>

              {/* Temps */}
              {status && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                      <Thermometer size={10} /> Nozzle
                    </div>
                    <p
                      className="text-base font-bold tabular-nums"
                      style={{ color: "#FF6D28" }}
                    >
                      {status?.nozzle_temper ?? "—"}°C
                    </p>
                    {status?.nozzle_target_temper && (
                      <p className="text-[10px] text-muted">
                        Target: {status.nozzle_target_temper}°C
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                      <Thermometer size={10} /> Bed
                    </div>
                    <p
                      className="text-base font-bold tabular-nums"
                      style={{ color: "#00D0B0" }}
                    >
                      {status?.bed_temper ?? "—"}°C
                    </p>
                    {status?.bed_target_temper && (
                      <p className="text-[10px] text-muted">
                        Target: {status.bed_target_temper}°C
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Current Print (small card) */}
              {printing && (
                <div
                  className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-3 cursor-pointer hover:border-blue-700/50 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <p className="text-xs text-blue-400 font-semibold mb-2">
                    Currently Printing
                  </p>
                  <p className="text-sm font-medium truncate">
                    {status?.subtask_name ?? "Unknown"}
                  </p>
                  <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
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

              {/* Active Spool (small card) */}
              {activeSpool && activeFilament ? (
                <div
                  className="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-3 cursor-pointer hover:border-zinc-600/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSpool(activeSpool);
                  }}
                >
                  <p className="text-xs text-muted font-semibold mb-2">
                    Loaded Spool
                  </p>
                  <div className="flex items-center gap-3">
                    <SpoolIndicator
                      remaining={activeSpool.remaining_g}
                      total={activeSpool.total_weight_g}
                      color={activeFilament.color_hex}
                      size={56}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activeFilament.color_name}
                      </p>
                      <p className="text-xs text-muted">{activeFilament.material}</p>
                      <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: stockColor(pct, activeFilament.color_hex),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800/30 bg-zinc-900/20 p-3 text-center">
                  <p className="text-xs text-zinc-600">No spool loaded</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {selectedPrinter && (
        <PrinterModal
          printer={selectedPrinter}
          status={status}
          activeSpool={activeSpool}
          filament={activeFilament}
          firmware={firmware[selectedPrinter.dev_id]}
          printerIp={printerIp}
          onClose={() => setSelectedPrinter(null)}
          onSpoolClick={() => setSelectedSpool(activeSpool)}
        />
      )}

      {selectedSpool && (
        <SpoolModal
          spool={selectedSpool}
          filament={activeFilament}
          onClose={() => setSelectedSpool(null)}
          onActivate={async () => {
            await api.activateSpool(selectedSpool.id);
            load();
          }}
        />
      )}
    </div>
  );
}