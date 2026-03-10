"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setAdminAuthenticated } from "@/redux/slices/uiSlice";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

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
      <div className="min-h-screen bg-[#141414]">
        <div className="fixed inset-0 bg-gradient-to-b from-black via-[#0d0d0d] to-[#141414]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center mb-4"
              >
                <Logo size="lg" className="w-12 h-12" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white">
                Admin Panel
              </h1>
              <p className="text-gray-400 mt-2">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Admin Key"
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] focus:bg-white/10 transition-all"
                />
              </div>
              
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm text-center"
                >
                  {error}
                </motion.p>
              )}
              
              <motion.button 
                type="submit" 
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#e50914] hover:bg-[#f40612] text-white font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </motion.button>
            </form>

            <p className="text-gray-500 text-xs text-center mt-6">
              Restricted access. Authorized personnel only.
            </p>
          </motion.div>
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
