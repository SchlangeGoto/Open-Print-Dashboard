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

export const api = {
  // Setup / auth
  getSetupStatus: () =>
    request<{
      user_created: boolean;
      bambu_logged_in: boolean;
      printer_configured: boolean;
      setup_complete: boolean;
    }>("/users/setup-status"),

  userExists: () => request<{ exists: boolean }>("/users/exists"),

  register: (username: string, password: string) =>
    request<{ ok: boolean; username: string }>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  // JWT login — uses form-encoded body as required by OAuth2PasswordRequestForm
  loginUser: async (username: string, password: string) => {
    const body = new URLSearchParams({ username, password });
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
    // store token
    if (data.access_token) {
      localStorage.setItem("opd_token", data.access_token);
    }
    return { ok: true, username, token: data.access_token };
  },

  getMe: () => request<{ id: number; username: string; disabled: boolean }>("/users/me"),

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
  getSettings: () => request<{ key: string; value: string }[]>("/settings/"),
  getSetting: (key: string) => request<{ key: string; value: string }>(`/settings/${key}`),
  saveSetting: (key: string, value: string) =>
    request<{ key: string; value: string }>("/settings/", {
      method: "POST",
      body: JSON.stringify({ key, value }),
    }),

  // Printers
  getPrinters: () => request<any[]>("/printers/"),
  getPrinterStatus: () => request<any>("/printers/status"),
  getCloudStatus: () => request<any[]>("/printers/cloud/status"),
  getTasks: (limit = 20) => request<any[]>(`/printers/tasks?limit=${limit}`),
  getPrinterTasks: (serial: string, limit = 20) =>
    request<any[]>(`/printers/${serial}/tasks?limit=${limit}`),
  getFirmware: (serial: string) => request<any>(`/printers/${serial}/firmware`),
  getProjects: () => request<any[]>("/printers/projects"),
  getMessages: () => request<any[]>("/printers/messages"),
  getCoverUrl: (url: string) =>
    `${API_BASE}/printers/cover/${encodeURIComponent(url)}?token=${getToken()}`,

  // Users (Bambu profile)
  getBambuProfile: () => request<any>("/users/"),

  // Print Jobs
  getPrintJobs: () => request<any[]>("/prints/"),
  getActivePrints: () => request<any[]>("/prints/active"),
  getPrint: (id: number) => request<any>(`/prints/${id}`),
  deletePrint: (id: number) =>
    request<{ ok: boolean }>(`/prints/${id}`, { method: "DELETE" }),

  // Filaments
  getFilaments: () => request<any[]>("/filaments/"),
  getFilament: (id: number) => request<any>(`/filaments/${id}`),
  createFilament: (data: any) =>
    request<any>("/filaments/", { method: "POST", body: JSON.stringify(data) }),
  updateFilament: (id: number, data: any) =>
    request<any>(`/filaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteFilament: (id: number) =>
    request<{ ok: boolean }>(`/filaments/${id}`, { method: "DELETE" }),
  getFilamentSpools: (id: number) => request<any[]>(`/filaments/${id}/spools`),
  getFilamentStats: (id: number) => request<any>(`/filaments/stats/${id}`),

  // Spools
  getSpools: (filamentId?: number) =>
    request<any[]>(`/spools/${filamentId ? `?filament_id=${filamentId}` : ""}`),
  getActiveSpool: () => request<any>("/spools/active").catch(() => null),
  getSpool: (id: number) => request<any>(`/spools/${id}`),
  createSpool: (data: any) =>
    request<any>("/spools/", { method: "POST", body: JSON.stringify(data) }),
  updateSpool: (id: number, data: any) =>
    request<any>(`/spools/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteSpool: (id: number) =>
    request<{ ok: boolean }>(`/spools/${id}`, { method: "DELETE" }),
  activateSpool: (id: number) =>
    request<any>(`/spools/${id}/activate`, { method: "PUT" }),
  scanNfc: (uid: string) =>
    request<any>("/spools/scan", { method: "POST", body: JSON.stringify({ uid }) }),
  assignNfc: (uid: string, spoolId: number) =>
    request<any>("/spools/scan/assign", {
      method: "POST",
      body: JSON.stringify({ uid, spool_id: spoolId }),
    }),

  // Health
  health: () => request<{ status: string }>("/health"),
};