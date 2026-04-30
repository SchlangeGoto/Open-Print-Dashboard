import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 mb-4">
        <Icon size={28} className="text-zinc-600" />
      </div>
      <h3 className="text-base font-medium text-zinc-300">{title}</h3>
      <p className="mt-1.5 text-sm text-muted max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}