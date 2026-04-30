"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Printer,
  History,
  Palette,
  Package,
  Settings,
  BarChart2,
  Disc3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/printers", label: "Printers", icon: Printer },
  { href: "/dashboard/prints", label: "Print Jobs", icon: History },
  { href: "/dashboard/filaments", label: "Filaments", icon: Palette },
  { href: "/dashboard/spools", label: "Spools", icon: Package },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-[var(--card-border)] bg-[var(--card)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--card-border)]">
        <div className="rounded-xl bg-accent/15 p-2.5 ring-1 ring-accent/20">
          <Disc3 size={18} className="text-accent" />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-100 tracking-tight">Open Print</p>
          <p className="text-[10px] text-muted mt-0.5 leading-none">Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50",
              )}
            >
              <item.icon size={16} className={isActive ? "text-accent" : ""} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--card-border)] px-5 py-4">
        <p className="text-[10px] text-muted/60 font-mono">v0.1.0</p>
      </div>
    </aside>
  );
}