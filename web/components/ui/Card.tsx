import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  const isClickable = !!onClick || hoverable;
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5",
        isClickable && "cursor-pointer hover:border-zinc-600/60 hover:bg-[var(--card-hover)] transition-all duration-200",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-sm font-semibold text-zinc-200 tracking-tight", className)}>{children}</h3>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted mt-0.5">{children}</p>;
}