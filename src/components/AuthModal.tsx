"use client";

import { useState } from "react";
import { X, Loader2, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (!email.trim() || !password.trim() || (mode === "register" && !username.trim())) {
      setError("All fields are required");
      setSubmitting(false);
      return;
    }

    const result = mode === "login"
      ? await login(email.trim(), password)
      : await register(username.trim(), email.trim(), password);

    if (result.success) {
      onClose();
      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      setError(result.error || "Something went wrong");
    }
    setSubmitting(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {mode === "login" ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            {mode === "login" ? "Sign In" : "Create Account"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-[#141414] text-white px-3 py-2 rounded border border-white/10 focus:outline-none focus:border-red-600 text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm text-gray-500">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={switchMode} className="text-red-500 hover:underline">
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

export function UserMenu({ onOpen }: { onOpen: () => void }) {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <button
        onClick={onOpen}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
        <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
      </button>
      <div className="absolute right-0 top-full mt-1 w-48 bg-[#1a1a1a] rounded border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-white/10">
            {user.email}
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
