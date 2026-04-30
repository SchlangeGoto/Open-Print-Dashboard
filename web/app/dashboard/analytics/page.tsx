"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardTitle } from "@/components/ui/Card";
import { formatDuration, formatWeight, formatCurrency } from "@/lib/utils";
import {
  Layers, Clock, Weight, CircleDollarSign, CheckCircle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from "recharts";
import { format, subDays, subMonths, eachDayOfInterval, startOfDay } from "date-fns";

type Period = "weekly" | "monthly" | "yearly";

const MATERIAL_COLORS: Record<string, string> = {
  PLA: "#3b82f6",
  PETG: "#10b981",
  ABS: "#f59e0b",
  ASA: "#8b5cf6",
  TPU: "#ec4899",
  Nylon: "#f97316",
  PC: "#14b8a6",
  Other: "#6b7280",
};

export default function AnalyticsPage() {
  const [prints, setPrints] = useState<any[]>([]);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [spools, setSpools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("weekly");

  useEffect(() => {
    async function load() {
      try {
        const [pr, fil, sp] = await Promise.all([
          api.getPrintJobs().catch(() => []),
          api.getFilaments().catch(() => []),
          api.getSpools().catch(() => []),
        ]);
        setPrints(pr);
        setFilaments(fil);
        setSpools(sp);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalPrints = prints.length;
  const completedPrints = prints.filter((p) => p.status === 2).length;
  const canceledPrints = prints.filter((p) => p.status === 3).length;
  const successRate = completedPrints + canceledPrints > 0
    ? Math.round((completedPrints / (completedPrints + canceledPrints)) * 100)
    : 0;
  const totalTime = prints.reduce((s, p) => s + (p.duration_seconds || 0), 0);
  const totalWeight = prints.reduce((s, p) => s + (p.weight || 0), 0);
  const totalCost = prints.reduce((s, p) => s + (p.estimated_cost || 0), 0);

  // Activity data
  const activityData = useMemo(() => {
    const now = new Date();
    let intervals: Date[];
    let labelFormat: string;

    if (period === "weekly") {
      intervals = eachDayOfInterval({ start: subDays(now, 6), end: now });
      labelFormat = "EEE";
    } else if (period === "monthly") {
      intervals = eachDayOfInterval({ start: subDays(now, 29), end: now });
      labelFormat = "d";
    } else {
      intervals = Array.from({ length: 12 }, (_, i) => subMonths(now, 11 - i));
      labelFormat = "MMM";
    }

    return intervals.map((date) => {
      const start = startOfDay(date);
      const end = period === "yearly"
        ? new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
        : new Date(start.getTime() + 86400000 - 1);
      const count = prints.filter((p) => {
        const d = new Date(p.start_time || p.finished_at || 0);
        return d >= start && d <= end;
      }).length;
      return { label: format(date, labelFormat), count };
    });
  }, [prints, period]);

  // Filament usage by material
  const materialData = useMemo(() => {
    const map: Record<string, number> = {};
    prints.forEach((p) => {
      if (!p.weight || !p.spool_id) return;
      const spool = spools.find((s) => s.id === p.spool_id);
      if (!spool) return;
      const fil = filaments.find((f) => f.id === spool.filament_id);
      const material = fil?.material ?? "Other";
      map[material] = (map[material] || 0) + p.weight;
    });
    return Object.entries(map).map(([name, value]) => ({
      name,
      value: Math.round(value),
      color: MATERIAL_COLORS[name] ?? "#6b7280",
    }));
  }, [prints, spools, filaments]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 skeleton w-32 rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    contentStyle: { background: "#0f0f12", border: "1px solid #1c1c21", borderRadius: 8, fontSize: 12 },
    labelStyle: { color: "#e8e8ed" },
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-xl font-bold">Analytics</h1>
        <p className="text-xs text-muted mt-0.5">All-time statistics and trends</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Jobs" value={totalPrints} icon={Layers} iconColor="text-blue-400" iconBg="bg-blue-950/50" />
        <StatCard title="Success Rate" value={`${successRate}%`} icon={CheckCircle} iconColor="text-emerald-400" iconBg="bg-emerald-950/50" />
        <StatCard title="Print Time" value={formatDuration(totalTime)} icon={Clock} iconColor="text-purple-400" iconBg="bg-purple-950/50" />
        <StatCard title="Filament Used" value={formatWeight(totalWeight)} icon={Weight} iconColor="text-amber-400" iconBg="bg-amber-950/50" />
        <StatCard title="Money Spent" value={formatCurrency(totalCost)} icon={CircleDollarSign} iconColor="text-rose-400" iconBg="bg-rose-950/50" />
      </div>

      {/* Print Activity */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Print Activity</CardTitle>
          <div className="flex gap-1">
            {(["weekly", "monthly", "yearly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p ? "bg-accent/15 text-accent" : "text-muted hover:text-zinc-300"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} barSize={period === "monthly" ? 8 : 24} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "#6b6b76", fontSize: 10 }} axisLine={false} tickLine={false}
                interval={period === "monthly" ? 4 : 0} />
              <YAxis tick={{ fill: "#6b6b76", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <CartesianGrid vertical={false} stroke="#1c1c21" />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Prints" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Filament by material */}
        {materialData.length > 0 && (
          <Card>
            <CardTitle className="mb-5">Filament Usage by Material</CardTitle>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: "#6b6b76", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b6b76", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}g`} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [`${v}g`, "Used"]} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {materialData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Per-day prints */}
        <Card>
          <CardTitle className="mb-5">Summary</CardTitle>
          <div className="space-y-3">
            {[
              { label: "Total Prints", value: totalPrints },
              { label: "Completed", value: completedPrints, color: "text-emerald-400" },
              { label: "Canceled / Failed", value: canceledPrints, color: "text-red-400" },
              { label: "Success Rate", value: `${successRate}%` },
              { label: "Avg Weight / Print", value: formatWeight(totalPrints > 0 ? totalWeight / totalPrints : 0) },
              { label: "Avg Cost / Print", value: formatCurrency(totalPrints > 0 ? totalCost / totalPrints : 0) },
              { label: "Avg Duration", value: formatDuration(totalPrints > 0 ? Math.round(totalTime / totalPrints) : 0) },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-zinc-800/40 last:border-0">
                <span className="text-xs text-muted">{label}</span>
                <span className={`text-sm font-medium tabular-nums ${color ?? ""}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
