"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContextValue = { user: User | null; token: string | null; loading: boolean; login: (email: string, password: string) => Promise<User>; register: (name: string, email: string, password: string) => Promise<User>; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");
      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as User);
        } catch {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      }
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:unauthorized", logout);
    return () => window.removeEventListener("auth:unauthorized", logout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const data = await apiRequest<{ user: User; token: string }>("/api/auth/login", { method: "POST", body: { email, password } });
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await apiRequest<{ user: User; token: string }>("/api/auth/register", { method: "POST", body: { name, email, password } });
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const value = useMemo(() => ({ user, token, loading, login, register, logout }), [user, token, loading, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
