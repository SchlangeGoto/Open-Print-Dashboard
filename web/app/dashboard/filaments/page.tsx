"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatWeight } from "@/lib/utils";
import { Palette, Plus, Pencil, Trash2, Thermometer } from "lucide-react";
import toast from "react-hot-toast";
import FilamentModal from "@/components/modals/FilamentModal";

const MATERIALS = ["PLA", "PETG", "ABS", "ASA", "TPU", "Nylon", "PC", "PVA", "Other"];

const emptyFilament = {
  brand: "",
  material: "PLA",
  color_name: "",
  color_hex: "#3b82f6",
  nozzle_temp_min: 190,
  nozzle_temp_max: 220,
  bed_temp: 60,
  bambu_info_idx: "",
  notes: "",
};

export default function FilamentsPage() {
  const [filaments, setFilaments] = useState<any[]>([]);
  const [spoolsByFilament, setSpoolsByFilament] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...emptyFilament });
  const [selectedFilament, setSelectedFilament] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function load() {
    try {
      const fils = await api.getFilaments();
      setFilaments(fils);
      const spoolMap: Record<number, any[]> = {};
      await Promise.all(
        fils.map(async (f: any) => {
          const sp = await api.getFilamentSpools(f.id).catch(() => []);
          spoolMap[f.id] = sp;
        })
      );
      setSpoolsByFilament(spoolMap);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setForm({ ...emptyFilament });
    setEditingId(null);
    setFormOpen(true);
  }

  function openEdit(f: any, e: React.MouseEvent) {
    e.stopPropagation();
    setForm({
      brand: f.brand,
      material: f.material,
      color_name: f.color_name,
      color_hex: f.color_hex,
      nozzle_temp_min: f.nozzle_temp_min ?? 190,
      nozzle_temp_max: f.nozzle_temp_max ?? 220,
      bed_temp: f.bed_temp ?? 60,
      bambu_info_idx: f.bambu_info_idx ?? "",
      notes: f.notes ?? "",
    });
    setEditingId(f.id);
    setFormOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateFilament(editingId, form);
        toast.success("Filament updated");
      } else {
        await api.createFilament(form);
        toast.success("Filament created");
      }
      setFormOpen(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteFilament(id);
      toast.success("Filament deleted");
      setConfirmDelete(null);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 skeleton w-32 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Filaments</h1>
          <p className="text-xs text-muted mt-0.5">{filaments.length} types in library</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={14} /> Add Filament
        </Button>
      </div>

      {filaments.length === 0 ? (
        <EmptyState icon={Palette} title="No filaments" description="Add your first filament type to start tracking inventory." action={<Button onClick={openCreate}><Plus size={14} />Add Filament</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filaments.map((f) => {
            const spools = spoolsByFilament[f.id] ?? [];
            const spoolCount = spools.length;
            const remaining = spools.reduce((s, sp) => s + sp.remaining_g, 0);

            return (
              <Card key={f.id} onClick={() => setSelectedFilament(f)} hoverable className="relative group">
                {/* Action buttons */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 transition-colors"
                    onClick={(e) => openEdit(f, e)}
                  >
                    <Pencil size={12} className="text-zinc-400" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-zinc-800/90 hover:bg-red-900/60 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(f.id); }}
                  >
                    <Trash2 size={12} className="text-red-400" />
                  </button>
                </div>

                {/* Color + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl border border-zinc-700/50 shadow-inner shrink-0"
                    style={{ backgroundColor: f.color_hex }}
                  />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{f.color_name}</p>
                    <p className="text-xs text-muted">{f.brand}</p>
                  </div>
                  <Badge variant="default" className="ml-auto">{f.material}</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-2.5">
                    <p className="text-muted">In Stock</p>
                    <p className="font-medium mt-0.5">{formatWeight(remaining)}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-2.5">
                    <p className="text-muted">Spools</p>
                    <p className="font-medium mt-0.5">{spoolCount}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-2.5">
                    <div className="flex items-center gap-1 text-muted"><Thermometer size={9} />Nozzle</div>
                    <p className="font-medium mt-0.5">
                      {f.nozzle_temp_min && f.nozzle_temp_max ? `${f.nozzle_temp_min}–${f.nozzle_temp_max}°C` : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-zinc-900/60 border border-zinc-800/40 p-2.5">
                    <div className="flex items-center gap-1 text-muted"><Thermometer size={9} />Bed</div>
                    <p className="font-medium mt-0.5">{f.bed_temp ? `${f.bed_temp}°C` : "—"}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? "Edit Filament" : "Add Filament"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Brand" placeholder="Bambu Lab" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Material</label>
              <select
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
              >
                {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Color Name" placeholder="Matte Black" value={form.color_name} onChange={(e) => setForm({ ...form, color_name: e.target.value })} required />
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wide">Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="w-9 h-9 rounded-lg border border-zinc-700 bg-transparent cursor-pointer" />
                <Input placeholder="#3b82f6" value={form.color_hex} onChange={(e) => setForm({ ...form, color_hex: e.target.value })} className="flex-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Nozzle Min °C" type="number" value={form.nozzle_temp_min ?? ""} onChange={(e) => setForm({ ...form, nozzle_temp_min: Number(e.target.value) })} />
            <Input label="Nozzle Max °C" type="number" value={form.nozzle_temp_max ?? ""} onChange={(e) => setForm({ ...form, nozzle_temp_max: Number(e.target.value) })} />
            <Input label="Bed °C" type="number" value={form.bed_temp ?? ""} onChange={(e) => setForm({ ...form, bed_temp: Number(e.target.value) })} />
          </div>

          <Input label="Bambu Info Index" placeholder="GFL99" value={form.bambu_info_idx} onChange={(e) => setForm({ ...form, bambu_info_idx: e.target.value })} />

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete Filament?" size="sm">
        <p className="text-sm text-muted mb-5">This will permanently delete the filament and all associated spools. This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="danger" className="flex-1" onClick={() => confirmDelete !== null && handleDelete(confirmDelete)}>
            <Trash2 size={14} /> Delete
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
        </div>
      </Modal>

      {/* Filament Detail Modal */}
      {selectedFilament && (
        <FilamentModal
          filament={selectedFilament}
          spools={spoolsByFilament[selectedFilament.id] ?? []}
          onClose={() => setSelectedFilament(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}
