import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variants = {
  default: "bg-zinc-800/80 text-zinc-300 border-zinc-700/50",
  success: "bg-emerald-950/60 text-emerald-400 border-emerald-800/50",
  warning: "bg-amber-950/60 text-amber-400 border-amber-800/50",
  danger: "bg-red-950/60 text-red-400 border-red-800/50",
  info: "bg-blue-950/60 text-blue-400 border-blue-800/50",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}