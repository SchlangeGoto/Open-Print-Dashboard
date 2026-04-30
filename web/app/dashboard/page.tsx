"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  formatDuration, formatWeight, formatCurrency, stockColor,
} from "@/lib/utils";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { CoverImage } from "@/components/ui/CoverImage";
import {
  Layers, Clock, Weight, CircleDollarSign, Thermometer,
  WifiOff, Printer,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import PrintJobModal from "@/components/modals/PrintJobModal";
import SpoolModal from "@/components/modals/SpoolModal";

export default function DashboardPage() {
  const [status, setStatus] = useState<any>(null);
  const [prints, setPrints] = useState<any[]>([]);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [spools, setSpools] = useState<any[]>([]);
  const [activeSpool, setActiveSpool] = useState<any>(null);
  const [printers, setPrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrint, setSelectedPrint] = useState<any>(null);
  const [selectedSpool, setSelectedSpool] = useState<any>(null);

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
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalPrints = prints.length;
  const totalWeightUsed = prints.reduce((sum, p) => sum + (p.weight || 0), 0);
  const totalPrintTime = prints.reduce((sum, p) => sum + (p.duration_seconds || 0), 0);
  const totalCost = prints.reduce((sum, p) => sum + (p.estimated_cost || 0), 0);
  const isConnected = status && status.status !== "no_data";
  const activePrints = prints.filter((p) => p.status === 4);

  // Filament stock chart data
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-xs text-muted mt-0.5">Overview of your 3D printing activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Prints" value={totalPrints} icon={Layers} iconColor="text-blue-400" iconBg="bg-blue-950/50" />
        <StatCard title="Filament Used" value={formatWeight(totalWeightUsed)} icon={Weight} iconColor="text-emerald-400" iconBg="bg-emerald-950/50" />
        <StatCard title="Print Time" value={formatDuration(totalPrintTime)} icon={Clock} iconColor="text-purple-400" iconBg="bg-purple-950/50" />
        <StatCard title="Est. Cost" value={formatCurrency(totalCost)} icon={CircleDollarSign} iconColor="text-amber-400" iconBg="bg-amber-950/50" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Printer Status */}
        <div className="xl:col-span-2 space-y-5">

          {/* Active Prints */}
          {activePrints.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Active Prints</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activePrints.map((p) => (
                  <Card key={p.id} onClick={() => setSelectedPrint(p)} hoverable>
                    <div className="flex gap-4">
                      <CoverImage cover={p.cover} alt={p.title} className="w-16 h-16 rounded-lg shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.title}</p>
                        <p className="text-xs text-muted mt-0.5">Printing</p>
                        <div className="mt-2.5 space-y-1.5">
                          <div className="flex justify-between text-xs text-muted">
                            <span>Progress</span>
                            <span>{p.mc_percent ?? "?"}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full transition-all"
                              style={{ width: `${p.mc_percent ?? 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Filament Stock Chart */}
          {filamentChartData.length > 0 && (
            <Card>
              <CardTitle className="mb-4">Filament Stock</CardTitle>
              <div style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filamentChartData} barSize={28} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
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
                      contentStyle={{ background: "#0f0f12", border: "1px solid #1c1c21", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#e8e8ed" }}
                      formatter={(val: any, _name: any, props: any) => [
                        `${val}g (${props.payload.pct}%)`,
                        "Remaining",
                      ]}
                    />
                    <Bar dataKey="remaining" radius={[4, 4, 0, 0]}>
                      {filamentChartData.map((entry, i) => (
                        <Cell key={i} fill={stockColor(entry.pct, entry.color)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {filamentChartData.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-muted">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: stockColor(f.pct, f.color) }} />
                    {f.name} · {f.pct}%
                    {f.pct <= 30 && (
                      <span className={`ml-0.5 font-medium ${f.pct <= 10 ? "text-red-400" : "text-amber-400"}`}>
                        {f.pct <= 10 ? "⚠ Buy now" : "Low"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Printer Status */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Printer</CardTitle>
              <div className="flex items-center gap-2">
                {isConnected
                  ? <><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-emerald-400">Connected</span></>
                  : <><div className="w-1.5 h-1.5 rounded-full bg-zinc-600" /><span className="text-xs text-muted">Offline</span></>
                }
              </div>
            </div>
            {isConnected ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                    <Thermometer size={10} /> Nozzle
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {status?.nozzle_temper ?? "—"}°
                    {status?.nozzle_target_temper
                      ? <span className="text-xs text-muted font-normal">/{status.nozzle_target_temper}°</span>
                      : null}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/60 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                    <Thermometer size={10} /> Bed
                  </div>
                  <p className="text-lg font-bold tabular-nums">
                    {status?.bed_temper ?? "—"}°
                    {status?.bed_target_temper
                      ? <span className="text-xs text-muted font-normal">/{status.bed_target_temper}°</span>
                      : null}
                  </p>
                </div>
                <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/60 p-3">
                  <p className="text-[10px] text-muted mb-1">State</p>
                  <p className="text-sm font-semibold">{status?.gcode_state ?? "—"}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/70 border border-zinc-800/60 p-3">
                  <p className="text-[10px] text-muted mb-1">Speed</p>
                  <p className="text-sm font-semibold">Lvl {status?.spd_lvl ?? "—"}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-zinc-600 py-2">
                <WifiOff size={18} />
                <span className="text-sm">No live data from printer</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Loaded Spool + Printers */}
        <div className="space-y-4">
          {/* Active Spool */}
          {activeSpool && (
            <Card onClick={() => setSelectedSpool(activeSpool)} hoverable>
              <div className="flex items-center justify-between mb-3">
                <CardTitle>Loaded Spool</CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
              {(() => {
                const fil = filaments.find((f) => f.id === activeSpool.filament_id);
                const pct = Math.round((activeSpool.remaining_g / activeSpool.total_weight_g) * 100);
                return (
                  <div className="flex items-center gap-4">
                    <SpoolIndicator
                      remaining={activeSpool.remaining_g}
                      total={activeSpool.total_weight_g}
                      color={fil?.color_hex ?? "#3b82f6"}
                      size={80}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{fil?.color_name ?? "Unknown"}</p>
                      <p className="text-xs text-muted">{fil?.brand} · {fil?.material}</p>
                      <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: stockColor(pct, fil?.color_hex) }}
                        />
                      </div>
                      <p className="text-xs text-muted mt-1">{Math.round(activeSpool.remaining_g)}g remaining</p>
                    </div>
                  </div>
                );
              })()}
            </Card>
          )}

          {/* Printers */}
          {printers.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Printers</p>
              <div className="space-y-3">
                {printers.map((dev) => (
                  <Card key={dev.dev_id}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-lg bg-zinc-800/80 p-2">
                          <Printer size={14} className="text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{dev.name}</p>
                          <p className="text-xs text-muted">{dev.dev_model_name || dev.dev_id}</p>
                        </div>
                      </div>
                      <Badge variant={dev.online ? "success" : "default"}>
                        {dev.online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inventory summary */}
          <Card>
            <CardTitle className="mb-3">Inventory</CardTitle>
            <div className="space-y-2">
              {[
                { label: "Filament types", value: filaments.length },
                { label: "Total spools", value: spools.length },
                { label: "Total remaining", value: formatWeight(spools.reduce((s, sp) => s + sp.remaining_g, 0)) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center text-sm py-1 border-b border-zinc-800/40 last:border-0">
                  <span className="text-muted text-xs">{row.label}</span>
                  <span className="font-medium text-xs">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {selectedPrint && (
        <PrintJobModal print={selectedPrint} onClose={() => setSelectedPrint(null)} />
      )}
      {selectedSpool && (
        <SpoolModal
          spool={selectedSpool}
          filament={filaments.find((f) => f.id === selectedSpool.filament_id)}
          onClose={() => setSelectedSpool(null)}
          onActivate={async () => { await api.activateSpool(selectedSpool.id); setSelectedSpool(null); }}
        />
      )}
    </div>
  );
}
