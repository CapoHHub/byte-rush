import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, setToken, clearToken, hasToken, ApiError, type AnyUser, type AuthRole } from "../lib/apiService";
import { clearSensoStorage } from "../lib/sensoStorage";

interface AuthState {
  user: AnyUser | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, cognome: string) => Promise<void>;
  companyLogin: (email: string, password: string) => Promise<void>;
  companyRegister: (ragioneSociale: string, email: string, password: string, partitaIva?: string) => Promise<void>;
  skipAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function storedRole(): AuthRole | null {
  return localStorage.getItem("senso_role") as AuthRole | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AnyUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasToken()) {
      setLoading(false);
      return;
    }
    const role = storedRole();
    const meCall = role === "company" ? api.company.me() : api.auth.me();
    meCall
      .then(({ user: u }) => setUser(u))
      .catch(() => {
        clearToken();
        localStorage.removeItem("senso_role");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { token, user: u } = await api.auth.login({ email, password });
      setToken(token);
      localStorage.setItem("senso_role", "user");
      setUser(u);
      setIsGuest(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Errore di connessione";
      setError(msg);
      throw err;
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, nome: string, cognome: string) => {
      setError(null);
      try {
        const { token, user: u } = await api.auth.register({ email, password, nome, cognome });
        clearSensoStorage();
        setToken(token);
        localStorage.setItem("senso_role", "user");
        setUser(u);
        setIsGuest(false);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Errore di connessione";
        setError(msg);
        throw err;
      }
    },
    [],
  );

  const companyLogin = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { token, user: u } = await api.company.login({ email, password });
      setToken(token);
      localStorage.setItem("senso_role", "company");
      setUser(u);
      setIsGuest(false);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Errore di connessione";
      setError(msg);
      throw err;
    }
  }, []);

  const companyRegister = useCallback(
    async (ragioneSociale: string, email: string, password: string, partitaIva?: string) => {
      setError(null);
      try {
        const { token, user: u } = await api.company.register({ ragioneSociale, email, password, partitaIva });
        setToken(token);
        localStorage.setItem("senso_role", "company");
        setUser(u);
        setIsGuest(false);
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Errore di connessione";
        setError(msg);
        throw err;
      }
    },
    [],
  );

  const skipAuth = useCallback(() => {
    setIsGuest(true);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("senso_role");
    setUser(null);
    setIsGuest(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, error, login, register, companyLogin, companyRegister, skipAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
