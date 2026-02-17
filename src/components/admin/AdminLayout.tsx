"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Film } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAdminAuthenticated } from "@/redux/slices/uiSlice";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { isAdminAuthenticated } = useAppSelector((state) => state.ui);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: adminKey }),
      });

      const data = await response.json();

      if (data.success) {
        dispatch(setAdminAuthenticated(true));
        sessionStorage.setItem("adminKey", adminKey);
      } else {
        setError("Invalid admin key");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Check session storage on mount
  if (typeof window !== "undefined") {
    const storedKey = sessionStorage.getItem("adminKey");
    if (storedKey && !isAdminAuthenticated) {
      fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: storedKey }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            dispatch(setAdminAuthenticated(true));
          } else {
            sessionStorage.removeItem("adminKey");
          }
        });
    }
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#1f1f1f] rounded-lg p-8 shadow-2xl">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-lg bg-red-600 flex items-center justify-center mx-auto mb-4">
                <Film className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-2">Enter admin key to continue</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="w-full pl-12 pr-4 py-3 rounded bg-[#2a2a2a] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Access Admin Panel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <main className="p-4 md:p-6 lg:p-8">{children}</main>
    </div>
  );
}
