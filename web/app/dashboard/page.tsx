"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { stockColor } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { CoverImage } from "@/components/ui/CoverImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { Thermometer, Printer as PrinterIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import PrintJobModal from "@/components/modals/PrintJobModal";
import SpoolModal from "@/components/modals/SpoolModal";
import PrinterModal from "@/components/modals/PrinterModal";

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null);
  const [prints, setPrints] = useState<any[]>([]);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [spools, setSpools] = useState<any[]>([]);
  const [activeSpool, setActiveSpool] = useState<any>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [firmware, setFirmware] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPrint, setSelectedPrint] = useState<any>(null);
  const [selectedSpool, setSelectedSpool] = useState<any>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [st, pr, fil, sp, act, devs] = await Promise.all([
          api.getPrinterStatus().catch(() => null),
          api.getPrintJobs().catch(() => []),
          api.getFilaments().catch(() => []),
          api.getSpools().catch(() => []),
          api.getActiveSpool().catch(() => null),
          api.getPrinters().catch(() => []),
        ]);
        setStatus(st);
        setPrints(pr);
        setFilaments(fil);
        setSpools(sp);
        setActiveSpool(act);
        setPrinters(devs);

        const fwMap: Record<string, any> = {};
        await Promise.all(
          devs.map(async (d: any) => {
            const fw = await api.getFirmware(d.dev_id).catch(() => null);
            if (fw) fwMap[d.dev_id] = fw;
          })
        );
        setFirmware(fwMap);
        setNow(new Date());
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const activePrints = prints.filter((p) => p.status === 4);
  const activeFilament = activeSpool
    ? filaments.find((f) => f.id === activeSpool.filament_id)
    : null;
  const spoolPct = activeSpool
    ? Math.round((activeSpool.remaining_g / activeSpool.total_weight_g) * 100)
    : 0;
  const printing = status?.gcode_state === "RUNNING";

  // Filament stock bar chart — remove empty spools, color-code by remaining %
  const filamentChartData = filaments
    .filter((f) => f.total_remaining_g > 0)
    .map((f) => {
      const totalSpoolG = spools
        .filter((s) => s.filament_id === f.id)
        .reduce((sum, s) => sum + s.total_weight_g, 0);
      const pct = totalSpoolG > 0 ? (f.total_remaining_g / totalSpoolG) * 100 : 0;
      return {
        name: f.color_name,
        remaining: Math.round(f.total_remaining_g),
        pct: Math.round(pct),
        color: f.color_hex,
      };
    });

  // Estimated end time from remaining minutes
  function estimatedEndTime(): string {
    const mins = status?.mc_remaining_time;
    if (!mins || !now) return "—";
    const end = new Date(now.getTime() + mins * 60 * 1000);
    return end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function estimatedEndTimeFromMinutes(mins?: number | null): string {
    if (!mins || !now) return "—";
    const end = new Date(now.getTime() + mins * 60 * 1000);
    return end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-48" />
        <div className="h-56 skeleton rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((i) => <div key={i} className="h-64 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-xs text-muted mt-0.5">Overview of your 3D printing activity</p>
      </div>

      {/* ── 1. FILAMENTS IN STOCK ─────────────────────────────────────── */}
      {filamentChartData.length > 0 && (
        <Card>
          <CardTitle className="mb-5">Filaments in Stock</CardTitle>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filamentChartData}
                barSize={36}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b6b76", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b6b76", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}g`}
                />
                <Tooltip
                  cursor={false}
                  contentStyle={{
                    background: "#0f0f12",
                    border: "1px solid #1c1c21",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e8e8ed" }}
                  itemStyle={{ color: "#e8e8ed" }}
                  formatter={(val: any, _name: any, props: any) => [
                    `${val}g (${props.payload.pct}%)`,
                    "Remaining",
                  ]}
                />
                <Bar dataKey="remaining" radius={[4, 4, 0, 0]} activeBar={{ stroke: "#fff", strokeWidth: 1.5 }}>
                  {filamentChartData.map((entry, i) => (
                    <Cell key={i} fill={stockColor(entry.pct, entry.color)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend with stock warnings */}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {filamentChartData.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: stockColor(f.pct, f.color) }}
                />
                <span className="text-muted">{f.name}</span>
                <span className="text-zinc-600">·</span>
                <span className="tabular-nums text-muted">{f.pct}%</span>
                {f.pct <= 10 && (
                  <span className="ml-0.5 font-semibold text-red-400">⚠ Buy now</span>
                )}
                {f.pct > 10 && f.pct <= 30 && (
                  <span className="ml-0.5 font-medium text-amber-400">Low</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── 2. CURRENT PRINTS ─────────────────────────────────────────── */}
      {activePrints.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
            Current Prints
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePrints.map((p) => {
              const printer = printers.find((d) => d.dev_id === p.device_id);
              const remaining = p.mc_remaining_time ?? null;
              const endTime = estimatedEndTimeFromMinutes(remaining);
              const pct = p.mc_percent ?? 0;

              return (
                <Card key={p.id} onClick={() => setSelectedPrint(p)} hoverable>
                  <div className="flex gap-3 mb-4">
                    <CoverImage
                      cover={p.cover}
                      alt={p.title}
                      className="w-16 h-16 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="font-semibold text-sm leading-tight truncate">{p.title}</p>
                      <p className="text-xs text-muted">
                        {printer?.name ?? p.device_id ?? "Unknown printer"}
                      </p>
                      <p className="text-xs text-muted">
                        Ends at <span className="text-zinc-300">{endTime}</span>
                      </p>
                    </div>
                  </div>
                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted">
                      <span>Progress</span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted">
                      {remaining ? `${remaining} min remaining` : "—"}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 3. PRINTERS ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
          Printers
        </p>
        {printers.length === 0 ? (
          <EmptyState
            icon={PrinterIcon}
            title="No printers found"
            description="Connect a Bambu Lab account to see your printers here."
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
                {/* Printer header — name, model, status */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-accent/10 p-2.5 shrink-0">
                      <PrinterIcon size={18} className="text-accent" />
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

                {/* Temperatures */}
                {status && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted mb-1">
                        <Thermometer size={10} /> Nozzle
                      </div>
                      <p
                        className="text-lg font-bold tabular-nums"
                        style={{ color: "#FF6D28" }}
                      >
                        {status.nozzle_temper ?? "—"}°C
                      </p>
                      {status.nozzle_target_temper ? (
                        <p className="text-[10px] text-muted">
                          Target: {status.nozzle_target_temper}°C
                        </p>
                      ) : null}
                    </div>
                    <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-3">
                      <div className="flex items-center gap-1 text-[10px] text-muted mb-1">
                        <Thermometer size={10} /> Bed
                      </div>
                      <p
                        className="text-lg font-bold tabular-nums"
                        style={{ color: "#00D0B0" }}
                      >
                        {status.bed_temper ?? "—"}°C
                      </p>
                      {status.bed_target_temper ? (
                        <p className="text-[10px] text-muted">
                          Target: {status.bed_target_temper}°C
                        </p>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* ── Small current print card (only when printing) ── */}
                {printing && (
                  <div
                    className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-3 cursor-pointer hover:border-blue-700/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentPrint = activePrints.find(
                        (p) => p.device_id === dev.dev_id
                      ) ?? activePrints[0];
                      if (currentPrint) setSelectedPrint(currentPrint);
                    }}
                  >
                    <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wide mb-1.5">
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

                {/* ── Current loaded spool card ── */}
                {activeSpool && activeFilament ? (
                  <div
                    className="rounded-xl border border-zinc-800/40 bg-zinc-900/40 p-3 cursor-pointer hover:border-zinc-600/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSpool(activeSpool);
                    }}
                  >
                    <p className="text-[10px] text-muted font-semibold uppercase tracking-wide mb-2">
                      Loaded Spool
                    </p>
                    <div className="flex items-center gap-3">
                      <SpoolIndicator
                        remaining={activeSpool.remaining_g}
                        total={activeSpool.total_weight_g}
                        color={activeFilament.color_hex}
                        size={52}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {activeFilament.color_name}
                        </p>
                        <p className="text-xs text-muted">{activeFilament.material}</p>
                        <div className="mt-1.5 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${spoolPct}%`,
                              backgroundColor: stockColor(spoolPct, activeFilament.color_hex),
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted mt-1">
                          {Math.round(activeSpool.remaining_g)}g remaining
                        </p>
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
      </div>

      {/* ── Modals ────────────────────────────────────────────────────── */}
      {selectedPrint && (
        <PrintJobModal
          print={selectedPrint}
          onClose={() => setSelectedPrint(null)}
        />
      )}
      {selectedSpool && (
        <SpoolModal
          spool={selectedSpool}
          filament={activeFilament}
          onClose={() => setSelectedSpool(null)}
          onActivate={async () => {
            await api.activateSpool(selectedSpool.id);
            setSelectedSpool(null);
          }}
        />
      )}
      {selectedPrinter && (
        <PrinterModal
          printer={selectedPrinter}
          status={status}
          activeSpool={activeSpool}
          filament={activeFilament}
          firmware={firmware[selectedPrinter.dev_id]}
          onClose={() => setSelectedPrinter(null)}
          onSpoolClick={() => setSelectedSpool(activeSpool)}
        />
      )}
    </div>
  );
}

