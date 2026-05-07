import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { fetchApi } from "../api";

type SessionUser = {
  id: number;
  name?: string;
  nom?: string;
  cognoms: string;
  email: string;
  telefon?: string;
  dni?: string;
  isAdmin?: boolean;
  userType?: "soci" | "admin";
  rol?: string;
};

type AuthResponse = {
  ok: boolean;
  message?: string;
};

type ProfileUpdate = {
  nom: string;
  cognoms: string;
  email: string;
  telefon: string;
  password?: string;
};

type AuthContextType = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (
    nom: string,
    cognoms: string,
    email: string,
    password: string,
    data_naixement: string,
    dni: string
  ) => Promise<AuthResponse>;
  updateProfile: (profile: ProfileUpdate) => Promise<AuthResponse>;
  logout: () => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<Response>;
};

const TOKEN_KEY = "gymmaster_token";
const AuthContext = createContext<AuthContextType | null>(null);

function normalizeUser(raw: Record<string, unknown>): SessionUser {
  const nom = (raw.nom as string | undefined) ?? (raw.name as string | undefined) ?? "";
  const name = (raw.name as string | undefined) ?? nom;
  const userType = (raw.userType as "soci" | "admin" | undefined) ?? ((raw.isAdmin as boolean) ? "admin" : "soci");
  const isAdmin = Boolean(raw.isAdmin) || userType === "admin" || raw.rol === "admin";

  return {
    ...(raw as SessionUser),
    nom,
    name,
    userType,
    isAdmin,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetchApi("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
          return;
        }

        const data = await response.json();
        if (data?.user) {
          setUser(normalizeUser(data.user));
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetchApi("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.error || "Error d'inici de sessió" };
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      setUser(normalizeUser(data.user));
      return { ok: true };
    } catch {
      return { ok: false, message: "Error de connexió" };
    }
  }, []);

  const register = useCallback(
    async (
      nom: string,
      cognoms: string,
      email: string,
      password: string,
      data_naixement: string,
      dni: string
    ): Promise<AuthResponse> => {
      try {
        const response = await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            nom,
            cognoms,
            email,
            password,
            data_naixement,
            dni,
          }),
        });
        const data = await response.json();

        if (!response.ok) {
          return { ok: false, message: data.error || "Error al registre" };
        }

        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(normalizeUser(data.user));
        return { ok: true };
      } catch {
        return { ok: false, message: "Error de connexió" };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const apiFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type") && options.method && options.method !== "GET") {
      headers.set("Content-Type", "application/json");
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetchApi(url, {
      ...options,
      headers,
    });
  }, []);

  const updateProfile = useCallback(
    async (profile: ProfileUpdate): Promise<AuthResponse> => {
      if (!user) {
        return { ok: false, message: "Cal iniciar sessio per actualitzar el perfil" };
      }

      try {
        const response = await apiFetch(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(profile),
        });
        const data = await response.json();

        if (!response.ok) {
          return { ok: false, message: data.error || "No s'ha pogut actualitzar el perfil" };
        }

        if (data?.user) {
          setUser(normalizeUser(data.user));
        }

        return { ok: true, message: data.message || "Perfil actualitzat correctament" };
      } catch {
        return { ok: false, message: "Error de connexio" };
      }
    },
    [apiFetch, user]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isAdmin: Boolean(user?.isAdmin),
      login,
      register,
      updateProfile,
      logout,
      apiFetch,
    }),
    [user, isLoading, login, register, updateProfile, logout, apiFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth s'ha d'utilitzar dins d'AuthProvider");
  }
  return ctx;
}
