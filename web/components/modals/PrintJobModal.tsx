"use client";

import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { CoverImage } from "@/components/ui/CoverImage";
import { formatDuration, formatWeight, formatCurrency, formatDateTime, getStatusLabel, getStatusVariant } from "@/lib/utils";
import { Clock, Layers, DollarSign, Cpu, Play, CheckCircle } from "lucide-react";

interface Props {
  print: any;
  onClose: () => void;
}

export default function PrintJobModal({ print, onClose }: Props) {
  return (
    <Modal open={!!print} onClose={onClose} size="lg">
      <div className="space-y-5">
        {/* Cover */}
        {print.cover && (
          <div className="rounded-xl overflow-hidden bg-zinc-900 aspect-video w-full">
            <CoverImage cover={print.cover} alt={print.title} fit="contain" className="w-full h-full" />
          </div>
        )}

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{print.title}</h2>
            {print.device_id && (
              <p className="text-xs text-muted mt-1 font-mono">{print.device_id}</p>
            )}
          </div>
          <Badge variant={getStatusVariant(print.status)}>{getStatusLabel(print.status)}</Badge>
        </div>

        {/* Progress (if printing) */}
        {print.status === 4 && print.mc_percent != null && (
          <div>
            <div className="flex justify-between text-xs text-muted mb-1.5">
              <span>Progress</span>
              <span>{print.mc_percent}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${print.mc_percent}%`, transition: "width 0.5s ease" }}
              />
            </div>
            {print.mc_remaining_time && (
              <p className="text-xs text-muted mt-1">{print.mc_remaining_time} min remaining</p>
            )}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Layers, label: "Weight Used", value: formatWeight(print.weight) },
            { icon: Clock, label: "Duration", value: formatDuration(print.duration_seconds) },
            { icon: DollarSign, label: "Estimated Cost", value: formatCurrency(print.estimated_cost) },
            { icon: Play, label: "Started", value: formatDateTime(print.start_time) },
            { icon: CheckCircle, label: "Finished", value: formatDateTime(print.finished_at) },
            { icon: Cpu, label: "Printer", value: print.device_id || "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg bg-zinc-900/60 border border-zinc-800/50 p-3">
              <div className="flex items-center gap-1.5 text-[10px] text-muted mb-1">
                <Icon size={10} /> {label}
              </div>
              <p className="text-sm font-medium text-zinc-200 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
