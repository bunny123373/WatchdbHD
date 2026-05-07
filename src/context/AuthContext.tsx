"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

interface UserPreferences {
  language?: string;
  autoPlay?: boolean;
  subtitleLanguage?: string;
  playbackSpeed?: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  preferences?: UserPreferences;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toUser(session: Record<string, unknown> | null): User | null {
  if (!session?.user) return null;
  const u = session.user as Record<string, unknown>;
  return {
    _id: (u.id as string) || "",
    username: (u.name as string) || "",
    email: (u.email as string) || "",
    avatar: (u.image as string) || undefined,
    isAdmin: (u.isAdmin as boolean) || false,
    preferences: u.preferences as UserPreferences | undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const user = toUser(session as Record<string, unknown> | null);

  const login = useCallback(async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      return { success: true };
    }
    return { success: false, error: result?.error || "Invalid email or password" };
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (data.success) {
        await signIn("credentials", { email, password, redirect: false });
        return { success: true };
      }
      return { success: false, error: data.error || "Registration failed" };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (data.success) {
        await fetch("/api/auth/session?update");
      }
    } catch (e) {
      console.error("Failed to update profile:", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token: null, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
