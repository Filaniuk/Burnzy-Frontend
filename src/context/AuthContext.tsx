"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import posthog from "posthog-js";
import { useRef } from "react";

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
  setPrimaryChannelId: (id: number) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const router = useRouter();
  const lastIdentifiedEmailRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;

    posthog.identify(user.email, {
      email: user.email,
      plan: user.plan,
      primary_channel_id: user.primary_channel_id ?? null,
    });
  }, [user?.email, user?.plan, user?.primary_channel_id]);


  // -------------------------------------------------------------
  // REFRESH USER SESSION (uses apiFetch)
  // -------------------------------------------------------------
  const refresh = async () => {
    setLoading(true);

    try {
      const res = await apiFetch<User>("/auth/me");

      const wasLoggedOut = !lastIdentifiedEmailRef.current;
      const isNowLoggedIn = Boolean(res?.email);

      setUser(res);
      setUnauthorized(false);

      if (isNowLoggedIn && wasLoggedOut) {
        posthog.capture("auth_login_success", {
          plan: res.plan,
        });
        lastIdentifiedEmailRef.current = res.email;
      }
    } catch (err: any) {
      if (err?.isApiError && err.status === 401) {
        setUnauthorized(true);
        setUser(null);

        lastIdentifiedEmailRef.current = null;
      } else {
        console.error("Unexpected auth refresh error:", err);
      }
    } finally {
      setLoading(false);
    }
  };


  const setPrimaryChannelId = (id: number) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, primary_channel_id: id };
    });
  };

  // -------------------------------------------------------------
  // LOGOUT (uses apiFetch)
  // -------------------------------------------------------------
  const logout = async () => {
    try {
      await apiFetch<any>("/auth/logout", {
        method: "POST",
      });
      posthog.capture("auth_logout");
      posthog.reset();
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        unauthorized,
        logout,
        refresh,
        setPrimaryChannelId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
