import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor = "text-accent", iconBg = "bg-accent/10", trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 group">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("rounded-lg p-2.5", iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend && (
          <span className={cn("text-xs font-medium", trend.positive ? "text-emerald-400" : "text-red-400")}>
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <p className="text-xs text-muted uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-2xl font-bold text-zinc-100 tabular-nums">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
    </div>
  );
}