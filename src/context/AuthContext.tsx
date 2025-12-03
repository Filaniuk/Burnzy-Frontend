"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface User {
  email: string;
  plan: string;
  primary_channel_id?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  unauthorized: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();
  

  // -------------------------------------------------------------
  // REFRESH USER SESSION (uses apiFetch)
  // -------------------------------------------------------------
  const refresh = async () => {
  setLoading(true);

  try {
    const res = await apiFetch<User>("/auth/me");
    setUser(res);
    setUnauthorized(false);
  } catch (err: any) {
    if (err?.isApiError && err.status === 401) {
      setUnauthorized(true);
      setUser(null);
    } else {
      console.error("Unexpected auth refresh error:", err);
    }
  } finally {
    setLoading(false);
  }
};


  // -------------------------------------------------------------
  // LOGOUT (uses apiFetch)
  // -------------------------------------------------------------
  const logout = async () => {
    try {
      await apiFetch<any>("/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      console.error("Logout request failed:", e);
    }

    setUser(null);
    router.push("/login");
  };

  // -------------------------------------------------------------
  // INITIAL SESSION LOAD
  // -------------------------------------------------------------
  useEffect(() => {
    refresh();
  }, []);

  return (
<AuthContext.Provider value={{ user, loading, unauthorized, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
