import {
  DEMO_FILAMENTS,
  DEMO_FIRMWARE,
  DEMO_PRINTS,
  DEMO_PRINTER_STATUS,
  DEMO_PRINTERS,
  DEMO_SETTINGS,
  DEMO_SPOOLS,
} from "@/lib/mockData";

// ─── DEMO MODE ───────────────────────────────────────────────────────────────
// Set to true to run the app with mock data — no backend required.
const DEMO_MODE = true;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("opd_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? "Request failed");
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// ─── Helper: fake async delay ────────────────────────────────────────────────
function fakeDelay<T>(data: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const api = {
  // ── Setup / auth ────────────────────────────────────────────────────────────
  getSetupStatus: () => {
    if (DEMO_MODE) {
      const done = typeof window !== "undefined" &&
        !!localStorage.getItem("demo_setup_complete");
      return fakeDelay({
        user_created: done,
        bambu_logged_in: done,
        printer_configured: done,
        setup_complete: done,
      });
    }
    return request<{
      user_created: boolean;
      bambu_logged_in: boolean;
      printer_configured: boolean;
      setup_complete: boolean;
    }>("/users/setup-status");
  },

  userExists: () => {
    if (DEMO_MODE) {
      const exists = typeof window !== "undefined" &&
        !!localStorage.getItem("demo_setup_complete");
      return fakeDelay({ exists });
    }
    return request<{ exists: boolean }>("/users/exists");
  },

  register: (username: string, _password: string) => {
    if (DEMO_MODE) return fakeDelay({ ok: true, username });
    return request<{ ok: boolean; username: string }>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, password: _password }),
    });
  },

  loginUser: async (username: string, _password: string) => {
    if (DEMO_MODE) {
      const token = "demo-token-" + Date.now();
      if (typeof window !== "undefined") {
        localStorage.setItem("opd_token", token);
      }
      return fakeDelay({ ok: true, username: username || "demo", token });
    }
    const body = new URLSearchParams({ username, password: _password });
    const res = await fetch(`${API_BASE}/users/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data.detail ?? "Login failed");
    }
    const data = await res.json();
    if (data.access_token) {
      localStorage.setItem("opd_token", data.access_token);
    }
    return { ok: true, username, token: data.access_token };
  },

  getMe: () => {
    if (DEMO_MODE) {
      const username = typeof window !== "undefined"
        ? localStorage.getItem("demo_username") ?? "demo"
        : "demo";
      return fakeDelay({ id: 1, username, disabled: false });
    }
    return request<{ id: number; username: string; disabled: boolean }>("/users/me");
  },

  // ── Bambu Cloud Auth ────────────────────────────────────────────────────────
  bambuLoginStart: (_email: string, _password: string) => {
    if (DEMO_MODE) return fakeDelay({ message: "Login successful" });
    return request<{ message?: string; requireCode?: boolean }>("/auth/login/start", {
      method: "POST",
      body: JSON.stringify({ email: _email, password: _password }),
    });
  },

  bambuLoginVerify: (_code: string) => {
    if (DEMO_MODE) return fakeDelay({ message: "Verified" });
    return request<{ message?: string; codeExpired?: boolean }>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({ code: _code }),
    });
  },

  // ── Settings ────────────────────────────────────────────────────────────────
  getSettings: () => {
    if (DEMO_MODE) return fakeDelay([...DEMO_SETTINGS]);
    return request<{ key: string; value: string }[]>("/settings/");
  },

  getSetting: (key: string) => {
    if (DEMO_MODE) {
      const s = DEMO_SETTINGS.find((x) => x.key === key);
      if (!s) return Promise.reject(new ApiError(404, "Not found"));
      return fakeDelay(s);
    }
    return request<{ key: string; value: string }>(`/settings/${key}`);
  },

  saveSetting: (key: string, value: string) => {
    if (DEMO_MODE) return fakeDelay({ key, value });
    return request<{ key: string; value: string }>("/settings/", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    });
  },

  // ── Printers ────────────────────────────────────────────────────────────────
  getPrinters: () => {
    if (DEMO_MODE) return fakeDelay([...DEMO_PRINTERS]);
    return request<any[]>("/printers/");
  },

  getPrinterStatus: () => {
    if (DEMO_MODE) return fakeDelay({ ...DEMO_PRINTER_STATUS });
    return request<any>("/printers/status");
  },

  getCloudStatus: () => {
    if (DEMO_MODE) return fakeDelay([]);
    return request<any[]>("/printers/cloud/status");
  },

  getTasks: (limit = 20) => {
    if (DEMO_MODE) return fakeDelay(DEMO_PRINTS.slice(0, limit));
    return request<any[]>(`/printers/tasks?limit=${limit}`);
  },

  getPrinterTasks: (_serial: string, limit = 20) => {
    if (DEMO_MODE) return fakeDelay(DEMO_PRINTS.slice(0, limit));
    return request<any[]>(`/printers/${_serial}/tasks?limit=${limit}`);
  },

  getFirmware: (_serial: string) => {
    if (DEMO_MODE) return fakeDelay({ ...DEMO_FIRMWARE });
    return request<any>(`/printers/${_serial}/firmware`);
  },

  getProjects: () => {
    if (DEMO_MODE) return fakeDelay([]);
    return request<any[]>("/printers/projects");
  },

  getMessages: () => {
    if (DEMO_MODE) return fakeDelay([]);
    return request<any[]>("/printers/messages");
  },

  getCoverUrl: (url: string) =>
    `${API_BASE}/printers/cover/${encodeURIComponent(url)}?token=${getToken()}`,

  // ── Users (Bambu profile) ───────────────────────────────────────────────────
  getBambuProfile: () => {
    if (DEMO_MODE) return fakeDelay({ uid: "demo_uid", name: "Demo User" });
    return request<any>("/users/");
  },

  // ── Print Jobs ──────────────────────────────────────────────────────────────
  getPrintJobs: () => {
    if (DEMO_MODE) return fakeDelay([...DEMO_PRINTS].sort((a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    ));
    return request<any[]>("/prints/");
  },

  getActivePrints: () => {
    if (DEMO_MODE) return fakeDelay(DEMO_PRINTS.filter((p) => p.status === 4));
    return request<any[]>("/prints/active");
  },

  getPrint: (id: number) => {
    if (DEMO_MODE) return fakeDelay(DEMO_PRINTS.find((p) => p.id === id));
    return request<any>(`/prints/${id}`);
  },

  deletePrint: (id: number) => {
    if (DEMO_MODE) return fakeDelay({ ok: true });
    return request<{ ok: boolean }>(`/prints/${id}`, { method: "DELETE" });
  },

  // ── Filaments ───────────────────────────────────────────────────────────────
  getFilaments: () => {
    if (DEMO_MODE) return fakeDelay([...DEMO_FILAMENTS]);
    return request<any[]>("/filaments/");
  },

  getFilament: (id: number) => {
    if (DEMO_MODE) return fakeDelay(DEMO_FILAMENTS.find((f) => f.id === id));
    return request<any>(`/filaments/${id}`);
  },

  createFilament: (data: any) => {
    if (DEMO_MODE) return fakeDelay({ ...data, id: Date.now() });
    return request<any>("/filaments/", { method: "POST", body: JSON.stringify(data) });
  },

  updateFilament: (id: number, data: any) => {
    if (DEMO_MODE) return fakeDelay({ ...data, id });
    return request<any>(`/filaments/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteFilament: (id: number) => {
    if (DEMO_MODE) return fakeDelay({ ok: true });
    return request<{ ok: boolean }>(`/filaments/${id}`, { method: "DELETE" });
  },

  getFilamentSpools: (id: number) => {
    if (DEMO_MODE) return fakeDelay(DEMO_SPOOLS.filter((s) => s.filament_id === id));
    return request<any[]>(`/filaments/${id}/spools`);
  },

  getFilamentStats: (id: number) => {
    if (DEMO_MODE) {
      const spools = DEMO_SPOOLS.filter((s) => s.filament_id === id);
      const prints = DEMO_PRINTS.filter((p) =>
        spools.some((s) => s.id === p.spool_id)
      );
      const remaining_g = spools.reduce((sum, s) => sum + s.remaining_g, 0);
      const total_g = spools.reduce((sum, s) => sum + s.total_weight_g, 0);
      const total_used_g = prints.reduce((sum, p) => sum + (p.weight ?? 0), 0);
      const total_cost = prints.reduce((sum, p) => sum + (p.estimated_cost ?? 0), 0);
      const prices = spools.filter((s) => s.price_per_kg).map((s) => s.price_per_kg);
      const avg_price = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
      return fakeDelay({
        remaining_g, total_g,
        used_percent: total_g > 0 ? Math.round((1 - remaining_g / total_g) * 100) : 0,
        spool_count: spools.length,
        print_count: prints.length,
        total_used_g, total_cost: Math.round(total_cost * 100) / 100,
        avg_price_per_kg: avg_price ? Math.round(avg_price * 100) / 100 : null,
      });
    }
    return request<any>(`/filaments/stats/${id}`);
  },

  // ── Spools ──────────────────────────────────────────────────────────────────
  getSpools: (filamentId?: number) => {
    if (DEMO_MODE) {
      const result = filamentId
        ? DEMO_SPOOLS.filter((s) => s.filament_id === filamentId)
        : [...DEMO_SPOOLS];
      return fakeDelay(result);
    }
    return request<any[]>(`/spools/${filamentId ? `?filament_id=${filamentId}` : ""}`);
  },

  getActiveSpool: () => {
    if (DEMO_MODE) {
      const active = DEMO_SPOOLS.find((s) => s.active);
      if (!active) return Promise.reject(new ApiError(404, "No active spool"));
      return fakeDelay(active);
    }
    return request<any>("/spools/active").catch(() => null);
  },

  getSpool: (id: number) => {
    if (DEMO_MODE) return fakeDelay(DEMO_SPOOLS.find((s) => s.id === id));
    return request<any>(`/spools/${id}`);
  },

  createSpool: (data: any) => {
    if (DEMO_MODE) return fakeDelay({ ...data, id: Date.now() });
    return request<any>("/spools/", { method: "POST", body: JSON.stringify(data) });
  },

  updateSpool: (id: number, data: any) => {
    if (DEMO_MODE) return fakeDelay({ ...data, id });
    return request<any>(`/spools/${id}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteSpool: (id: number) => {
    if (DEMO_MODE) return fakeDelay({ ok: true });
    return request<{ ok: boolean }>(`/spools/${id}`, { method: "DELETE" });
  },

  activateSpool: (id: number) => {
    if (DEMO_MODE) return fakeDelay(DEMO_SPOOLS.find((s) => s.id === id) ?? { id });
    return request<any>(`/spools/${id}/activate`, { method: "PUT" });
  },

  scanNfc: (uid: string) => {
    if (DEMO_MODE) return fakeDelay({ found: false, uid, unassigned_spools: [] });
    return request<any>("/spools/scan", { method: "POST", body: JSON.stringify({ uid }) });
  },

  assignNfc: (uid: string, spoolId: number) => {
    if (DEMO_MODE) return fakeDelay({ ok: true, spool: DEMO_SPOOLS.find((s) => s.id === spoolId) });
    return request<any>("/spools/scan/assign", {
      method: "POST",
      body: JSON.stringify({ uid, spool_id: spoolId }),
    });
  },

  // ── Health ───────────────────────────────────────────────────────────────────
  health: () => {
    if (DEMO_MODE) return fakeDelay({ status: "demo" });
    return request<{ status: string }>("/health");
  },
};