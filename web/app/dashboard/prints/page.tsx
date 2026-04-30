"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { CoverImage } from "@/components/ui/CoverImage";
import {
  formatDuration, formatWeight, formatCurrency, formatDateTime,
  getStatusLabel, getStatusVariant,
} from "@/lib/utils";
import { History, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import toast from "react-hot-toast";
import PrintJobModal from "@/components/modals/PrintJobModal";
import { Modal } from "@/components/ui/Modal";

type Filter = "all" | "printing" | "completed" | "failed";
type SortKey = "title" | "status" | "weight" | "duration_seconds" | "estimated_cost" | "start_time" | "finished_at";
type SortDir = "asc" | "desc";

const FILTERS: { key: Filter; label: string; status?: number }[] = [
  { key: "all", label: "All" },
  { key: "printing", label: "Printing", status: 4 },
  { key: "completed", label: "Completed", status: 2 },
  { key: "failed", label: "Failed", status: 3 },
];

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "weight", label: "Weight" },
  { key: "duration_seconds", label: "Duration" },
  { key: "estimated_cost", label: "Cost" },
  { key: "start_time", label: "Start" },
  { key: "finished_at", label: "Finish" },
];

export default function PrintsPage() {
  const [prints, setPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("finished_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedPrint, setSelectedPrint] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function load() {
    try {
      setPrints(await api.getPrintJobs());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const counts: Record<Filter, number> = useMemo(() => ({
    all: prints.length,
    printing: prints.filter((p) => p.status === 4).length,
    completed: prints.filter((p) => p.status === 2).length,
    failed: prints.filter((p) => p.status === 3).length,
  }), [prints]);

  const filtered = useMemo(() => {
    let list = [...prints];
    if (filter !== "all") {
      const s = FILTERS.find((f) => f.key === filter)?.status;
      list = list.filter((p) => p.status === s);
    }
    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    return list;
  }, [prints, filter, sortKey, sortDir]);

  async function handleDelete(id: number) {
    try {
      await api.deletePrint(id);
      toast.success("Print deleted");
      setConfirmDelete(null);
      load();
    } catch {
      toast.error("Failed to delete");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronsUpDown size={12} className="text-zinc-600" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-accent" />
      : <ChevronDown size={12} className="text-accent" />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 skeleton w-32 rounded" />
        <div className="h-96 skeleton rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-xl font-bold">Print Jobs</h1>
        <p className="text-xs text-muted mt-0.5">{prints.length} total jobs</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800/60 hover:text-zinc-200"
            }`}
          >
            {f.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 ${filter === f.key ? "bg-accent/20 text-accent" : "bg-zinc-800 text-zinc-500"}`}>
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title="No prints" description="No print jobs match this filter." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800/60">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="text-left p-4 first:pl-5 last:pr-5">
                      <button
                        className="flex items-center gap-1.5 text-xs text-muted font-medium uppercase tracking-wide hover:text-zinc-300 transition-colors"
                        onClick={() => toggleSort(col.key)}
                      >
                        {col.label} <SortIcon col={col.key} />
                      </button>
                    </th>
                  ))}
                  <th className="p-4 pr-5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-800/30 hover:bg-zinc-800/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedPrint(p)}
                  >
                    <td className="p-4 pl-5">
                      <div className="flex items-center gap-3">
                        <CoverImage cover={p.cover} alt={p.title} className="w-9 h-9 rounded-lg shrink-0" />
                        <span className="font-medium truncate max-w-[200px]">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(p.status)}>{getStatusLabel(p.status)}</Badge>
                    </td>
                    <td className="p-4 text-muted text-xs">{formatWeight(p.weight)}</td>
                    <td className="p-4 text-muted text-xs">{formatDuration(p.duration_seconds)}</td>
                    <td className="p-4 text-muted text-xs">{formatCurrency(p.estimated_cost)}</td>
                    <td className="p-4 text-muted text-xs">{formatDateTime(p.start_time)}</td>
                    <td className="p-4 text-muted text-xs">
                      {p.finished_at ? formatDateTime(p.finished_at) : p.status === 4 ? "In progress" : "—"}
                    </td>
                    <td className="p-4 pr-5" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-950/50 transition-colors"
                        onClick={() => setConfirmDelete(p.id)}
                      >
                        <Trash2 size={13} className="text-red-400/60 hover:text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete confirm */}
      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete Print Record?" size="sm">
        <p className="text-sm text-muted mb-5">This will permanently delete this print record.</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}>
            <Trash2 size={14} /> Delete
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
        </div>
      </Modal>

      {selectedPrint && (
        <PrintJobModal print={selectedPrint} onClose={() => setSelectedPrint(null)} />
      )}
    </div>
  );
}
