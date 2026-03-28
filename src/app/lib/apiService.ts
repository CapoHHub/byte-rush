const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("senso_token");
}

export function setToken(token: string): void {
  localStorage.setItem("senso_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("senso_token");
}

export function hasToken(): boolean {
  return !!getToken();
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || "HTTP " + res.status);
  }
  return res.json();
}

export type AuthRole = "user" | "company";

export interface AuthUser {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  role: AuthRole;
}

export interface CompanyUser {
  id: number;
  email: string;
  ragioneSociale: string;
  role: "company";
}

export type AnyUser = AuthUser | CompanyUser;

interface AuthResponse {
  token: string;
  user: AnyUser;
}

export interface DbProduct {
  id: number;
  nome: string;
  descrizione: string | null;
  prezzo: string;
  immagine: string | null;
  categoria: string | null;
  motivazione: string | null;
  taglie: string[] | null;
  attivo: boolean;
  companyId: number;
  company?: { ragioneSociale: string };
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; nome: string; cognome: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<{ user: AnyUser }>("/auth/me"),
  },
  company: {
    register: (data: { ragioneSociale: string; email: string; password: string; partitaIva?: string }) =>
      request<AuthResponse>("/company/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/company/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<{ user: CompanyUser }>("/company/me"),
    products: {
      list: () => request<{ products: DbProduct[] }>("/company/products"),
      create: (data: { nome: string; descrizione?: string; prezzo: number; immagine?: string; categoria?: string; motivazione?: string; taglie?: string[] }) =>
        request<{ product: DbProduct }>("/company/products", { method: "POST", body: JSON.stringify(data) }),
      update: (id: number, data: Partial<{ nome: string; descrizione: string; prezzo: number; immagine: string; categoria: string; motivazione: string; taglie: string[]; attivo: boolean }>) =>
        request<{ product: DbProduct }>(`/company/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
      remove: (id: number) =>
        request<{ ok: boolean }>(`/company/products/${id}`, { method: "DELETE" }),
    },
  },
  products: {
    list: (categoria?: string) => {
      const q = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
      return request<{ products: DbProduct[] }>("/products" + q);
    },
    get: (id: number) => request<{ product: DbProduct }>("/products/" + id),
  },
  cart: {
    get: () => request<{ cart: unknown }>("/cart"),
    add: (productId: number, quantity: number = 1) =>
      request<{ cart: unknown }>("/cart/add", { method: "POST", body: JSON.stringify({ productId, quantity }) }),
    removeItem: (itemId: number) =>
      request<{ cart: unknown }>("/cart/" + itemId, { method: "DELETE" }),
    clear: () => request<{ cart: unknown }>("/cart", { method: "DELETE" }),
  },
  user: {
    interests: {
      list: () => request<{ interests: { id: number; key: string; label: string; source: string; snippet: string | null; createdAt: string }[] }>("/user/interests"),
      bulkSet: (interests: { key: string; label: string; source: string }[]) =>
        request<{ ok: boolean }>("/user/interests", { method: "PUT", body: JSON.stringify({ interests }) }),
      add: (data: { key: string; label: string; source: string; snippet?: string }) =>
        request<{ interest: unknown }>("/user/interests", { method: "POST", body: JSON.stringify(data) }),
      remove: (id: number) => request<{ ok: boolean }>(`/user/interests/${id}`, { method: "DELETE" }),
    },
    purchases: {
      list: () => request<{ purchases: { id: number; productId: number | null; category: string; name: string; priceEUR: string; createdAt: string }[] }>("/user/purchases"),
      add: (data: { productId?: number; category: string; name: string; priceEUR: number }) =>
        request<{ purchase: unknown }>("/user/purchases", { method: "POST", body: JSON.stringify(data) }),
    },
    settings: {
      get: () => request<{ settings: Record<string, unknown> | null }>("/user/settings"),
      update: (settings: Record<string, unknown>) =>
        request<{ ok: boolean }>("/user/settings", { method: "PUT", body: JSON.stringify({ settings }) }),
    },
  },
};
