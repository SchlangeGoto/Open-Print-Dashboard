"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { SpoolIndicator } from "@/components/ui/SpoolIndicator";
import { formatWeight, formatDate, stockColor } from "@/lib/utils";
import { Package, Plus, Pencil, Trash2, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";
import SpoolModal from "@/components/modals/SpoolModal";

export default function SpoolsPage() {
  const [spools, setSpools] = useState<any[]>([]);
  const [filaments, setFilaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedSpool, setSelectedSpool] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const [form, setForm] = useState({
    filament_id: "",
    total_weight_g: 1000,
    remaining_g: 1000,
    price_per_kg: "",
    purchased_at: "",
    nfc_uid: "",
    notes: "",
  });

  async function load() {
    try {
      const [sp, fil] = await Promise.all([api.getSpools(), api.getFilaments()]);
      setSpools(sp);
      setFilaments(fil);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function getFilament(id: number | null) {
    return filaments.find((f) => f.id === id);
  }

  function openCreate() {
    setForm({
      filament_id: filaments.length > 0 ? String(filaments[0].id) : "",
      total_weight_g: 1000,
      remaining_g: 1000,
      price_per_kg: "",
      purchased_at: "",
      nfc_uid: "",
      notes: "",
    });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(s: any, e: React.MouseEvent) {
    e.stopPropagation();
    setForm({
      filament_id: String(s.filament_id ?? ""),
      total_weight_g: s.total_weight_g,
      remaining_g: s.remaining_g,
      price_per_kg: s.price_per_kg ?? "",
      purchased_at: s.purchased_at ? s.purchased_at.split("T")[0] : "",
      nfc_uid: s.nfc_uid ?? "",
      notes: s.notes ?? "",
    });
    setEditingId(s.id);
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      filament_id: form.filament_id ? Number(form.filament_id) : null,
      price_per_kg: form.price_per_kg ? Number(form.price_per_kg) : null,
      purchased_at: form.purchased_at ? new Date(form.purchased_at).toISOString() : null,
      nfc_uid: form.nfc_uid || null,
      notes: form.notes || null,
    };
    try {
      if (editingId) {
        await api.updateSpool(editingId, payload);
        toast.success("Spool updated");
      } else {
        await api.createSpool(payload);
        toast.success("Spool created");
      }
      setFormOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  }

  async function handleActivate(id: number) {
    try {
      await api.activateSpool(id);
      toast.success("Spool activated");
      load();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteSpool(id);
      toast.success("Spool deleted");
      setConfirmDelete(null);
      load();
    } catch {
      toast.error("Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 skeleton w-24 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-56 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Spools</h1>
          <p className="text-xs text-muted mt-0.5">{spools.length} spools tracked</p>
        </div>
        <Button size="sm" onClick={openCreate} disabled={filaments.length === 0}>
          <Plus size={14} /> Add Spool
        </Button>
      </div>

      {filaments.length === 0 && (
        <div className="rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-sm text-amber-300">
          Create a filament type first before adding spools.
        </div>
      )}

      {spools.length === 0 ? (
        <EmptyState icon={Package} title="No spools" description="Add spools to track your filament usage per roll." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {spools.map((s) => {
            const fil = getFilament(s.filament_id);
            const pct = s.total_weight_g > 0 ? Math.round((s.remaining_g / s.total_weight_g) * 100) : 0;

            return (
              <Card key={s.id} onClick={() => setSelectedSpool(s)} hoverable className="relative group flex flex-col gap-3">
                {/* Active badge */}
                {s.active && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="success"><Check size={9} /> Active</Badge>
                  </div>
                )}

                {/* Edit/delete actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 transition-colors" onClick={(e) => openEdit(s, e)}>
                    <Pencil size={11} className="text-zinc-400" />
                  </button>
                  <button className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-red-900/60 transition-colors" onClick={(e) => { e.stopPropagation(); setConfirmDelete(s.id); }}>
                    <Trash2 size={11} className="text-red-400" />
                  </button>
                </div>

                {/* Spool visual */}
                <div className="flex justify-center pt-5">
                  <SpoolIndicator remaining={s.remaining_g} total={s.total_weight_g} color={fil?.color_hex ?? "#555"} size={100} />
                </div>

                {/* Filament info */}
                <div className="text-center">
                  <p className="font-semibold text-sm">{fil?.color_name ?? "Unknown"}</p>
                  <p className="text-xs text-muted">{fil ? `${fil.brand} · ${fil.material}` : "No filament"}</p>
                </div>

                {/* Weight bar */}
                <div>
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>{formatWeight(s.remaining_g)}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: stockColor(pct, fil?.color_hex) }}
                    />
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted">
                  <span>{s.price_per_kg ? `€${s.price_per_kg}/kg` : "No price"}</span>
                  <span className="text-right">{s.last_used_at ? formatDate(s.last_used_at) : "Never used"}</span>
                </div>

                {/* Load button */}
                {!s.active && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={(e) => { e.stopPropagation(); handleActivate(s.id); }}
                  >
                    <Zap size={12} /> Load Spool
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? "Edit Spool" : "Add Spool"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Filament</label>
            <select
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent"
              value={form.filament_id}
              onChange={(e) => setForm({ ...form, filament_id: e.target.value })}
              required
            >
              <option value="">Select filament…</option>
              {filaments.map((f) => (
                <option key={f.id} value={f.id}>{f.brand} — {f.color_name} ({f.material})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Weight (g)" type="number" value={form.total_weight_g} onChange={(e) => setForm({ ...form, total_weight_g: Number(e.target.value) })} required />
            <Input label="Remaining (g)" type="number" value={form.remaining_g} onChange={(e) => setForm({ ...form, remaining_g: Number(e.target.value) })} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price / kg (€)" type="number" step="0.01" placeholder="24.99" value={form.price_per_kg} onChange={(e) => setForm({ ...form, price_per_kg: e.target.value })} />
            <Input label="Purchased" type="date" value={form.purchased_at} onChange={(e) => setForm({ ...form, purchased_at: e.target.value })} />
          </div>

          <Input label="NFC UID (optional)" placeholder="04:A2:3F:…" value={form.nfc_uid} onChange={(e) => setForm({ ...form, nfc_uid: e.target.value })} />

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete Spool?" size="sm">
        <p className="text-sm text-muted mb-5">This will permanently delete this spool and its history.</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}>
            <Trash2 size={14} /> Delete
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
        </div>
      </Modal>

      {selectedSpool && (
        <SpoolModal
          spool={selectedSpool}
          filament={getFilament(selectedSpool.filament_id)}
          onClose={() => setSelectedSpool(null)}
          onActivate={async () => { await api.activateSpool(selectedSpool.id); setSelectedSpool(null); load(); }}
        />
      )}
    </div>
  );
}
