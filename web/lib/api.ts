import type {
  Filament,
  Spool,
  PrintJob,
  PrinterStatus,
  PrinterDevice,
  Setting,
  SetupStatus,
  FirmwareInfo,
  FilamentStats,
  NfcScanResult,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("opd_token");
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
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

// ─── Auth / Setup ─────────────────────────────────────────
export const api = {
  // Setup status
  getSetupStatus: () => request<SetupStatus>("/users/setup-status"),

  userExists: () => request<{ exists: boolean }>("/users/exists"),

  register: (username: string, password: string) =>
    request<{ ok: boolean; username: string }>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  /**
   * Authenticate with a local account using the OAuth2 password flow.
   * Returns an access token that is stored in localStorage for subsequent requests.
   */
  loginUser: async (username: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const body = new URLSearchParams({ grant_type: "password", username, password });
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
    if (typeof window !== "undefined") {
      localStorage.setItem("opd_token", data.access_token);
    }
    return data;
  },

  // Bambu Cloud Auth
  bambuLoginStart: (email: string, password: string) =>
    request<{ message?: string; requireCode?: boolean }>("/auth/login/start", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  bambuLoginVerify: (code: string) =>
    request<{ message?: string; codeExpired?: boolean }>("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  // Settings
  getSettings: () => request<Setting[]>("/settings/"),
  getSetting: (key: string) => request<Setting>(`/settings/${key}`),
  saveSetting: (key: string, value: string) =>
    request<Setting>("/settings/", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    }),

  // Printers
  getPrinters: () => request<PrinterDevice[]>("/printers/"),
  getPrinterStatus: () => request<PrinterStatus>("/printers/status"),
  getCloudStatus: () => request<PrinterDevice[]>("/printers/cloud/status"),
  getTasks: (limit = 20) => request<PrintJob[]>(`/printers/tasks?limit=${limit}`),
  getPrinterTasks: (serial: string, limit = 20) =>
    request<PrintJob[]>(`/printers/${serial}/tasks?limit=${limit}`),
  getFirmware: (serial: string) => request<FirmwareInfo>(`/printers/${serial}/firmware`),
  getProjects: () => request<Record<string, unknown>[]>("/printers/projects"),
  getMessages: () => request<Record<string, unknown>[]>("/printers/messages"),

  // Users (Bambu profile)
  getBambuProfile: () => request<Record<string, unknown>>("/users/"),

  // Print Jobs
  getPrintJobs: () => request<PrintJob[]>("/prints/"),
  getActivePrints: () => request<PrintJob[]>("/prints/active"),
  getPrint: (id: number) => request<PrintJob>(`/prints/${id}`),
  deletePrint: (id: number) =>
    request<{ ok: boolean }>(`/prints/${id}`, { method: "DELETE" }),

  // Filaments
  getFilaments: () => request<Filament[]>("/filaments/"),
  getFilament: (id: number) => request<Filament>(`/filaments/${id}`),
  createFilament: (data: Omit<Filament, "id">) =>
    request<Filament>("/filaments/", { method: "POST", body: JSON.stringify(data) }),
  updateFilament: (id: number, data: Omit<Filament, "id">) =>
    request<Filament>(`/filaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFilament: (id: number) =>
    request<{ ok: boolean }>(`/filaments/${id}`, { method: "DELETE" }),
  getFilamentSpools: (id: number) => request<Spool[]>(`/filaments/${id}/spools`),
  getFilamentStats: (id: number) => request<FilamentStats>(`/filaments/stats/${id}`),

  // Spools
  getSpools: (filamentId?: number) =>
    request<Spool[]>(`/spools/${filamentId ? `?filament_id=${filamentId}` : ""}`),
  getActiveSpool: () => request<Spool>("/spools/active").catch(() => null),
  getSpool: (id: number) => request<Spool>(`/spools/${id}`),
  createSpool: (data: Partial<Omit<Spool, "id" | "created_at">>) =>
    request<Spool>("/spools/", { method: "POST", body: JSON.stringify(data) }),
  updateSpool: (id: number, data: Partial<Spool>) =>
    request<Spool>(`/spools/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSpool: (id: number) =>
    request<{ ok: boolean }>(`/spools/${id}`, { method: "DELETE" }),
  activateSpool: (id: number) =>
    request<Spool>(`/spools/${id}/activate`, { method: "PUT" }),
  scanNfc: (uid: string) =>
    request<NfcScanResult>("/spools/scan", { method: "POST", body: JSON.stringify({ uid }) }),
  assignNfc: (uid: string, spoolId: number) =>
    request<NfcScanResult>("/spools/scan/assign", {
      method: "POST",
      body: JSON.stringify({ uid, spool_id: spoolId }),
    }),

  // Health
  health: () => request<{ status: string }>("/health"),
};