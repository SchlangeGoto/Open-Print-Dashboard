import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatWeight(grams: number | null | undefined): string {
  if (grams == null) return "—";
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg`;
  return `${Math.round(grams)} g`;
}

export function formatDate(
  date: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `€${amount.toFixed(2)}`;
}

export function getStatusLabel(status: number | null | undefined): string {
  switch (status) {
    case 1: return "Unknown";
    case 2: return "Finished";
    case 3: return "Canceled";
    case 4: return "Running";
    default: return "Unknown";
  }
}

export function getStatusColor(status: number | null | undefined): string {
  switch (status) {
    case 2: return "text-green-400";
    case 3: return "text-red-400";
    case 4: return "text-blue-400";
    default: return "text-zinc-400";
  }
}