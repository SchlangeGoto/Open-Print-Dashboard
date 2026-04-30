"use client";

import { Sidebar } from "./Sidebar";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { isLoading, username } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted">
          <div className="h-4 w-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!username) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 min-h-screen p-7 page-enter">{children}</main>
    </div>
  );
}