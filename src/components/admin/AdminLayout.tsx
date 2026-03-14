"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldCheck, Sparkles } from "lucide-react";
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
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const dispatch = useAppDispatch();
  const { isAdminAuthenticated } = useAppSelector((state) => state.ui);

  useEffect(() => {
    const storedKey = sessionStorage.getItem("adminKey");

    if (!storedKey || isAdminAuthenticated) {
      setIsCheckingSession(false);
      return;
    }

    let isMounted = true;

    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: storedKey }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success) {
          dispatch(setAdminAuthenticated(true));
        } else {
          sessionStorage.removeItem("adminKey");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [dispatch, isAdminAuthenticated]);

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

  if (isCheckingSession && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="glass-pill flex items-center gap-3 rounded-full px-5 py-3 text-sm text-white">
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
            Checking admin session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(229,9,20,0.18),transparent_24%),radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.05),transparent_24%),linear-gradient(180deg,#050505_0%,#0d0d0d_45%,#141414_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.02)_25%,transparent_55%)]" />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface-strong grid w-full max-w-5xl overflow-hidden rounded-[32px] xl:grid-cols-[1fr_460px]"
          >
            <div className="hidden xl:flex flex-col justify-between border-r border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-10">
              <div>
                <div className="glass-surface mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
                  <Logo size="lg" className="h-8 w-8" />
                </div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-red-400">WatchDB Control Room</p>
                <h1 className="max-w-sm text-4xl font-bold text-white">Manage uploads, requests, reports, and live content in one place.</h1>
                <p className="mt-4 max-w-md text-sm leading-6 text-gray-400">
                  This admin surface is optimized for quick moderation and content operations across desktop and mobile devices.
                </p>
              </div>

              <div className="space-y-3">
                <div className="glass-surface flex items-start gap-3 rounded-2xl p-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Secure Access</p>
                    <p className="mt-1 text-sm text-gray-400">Session-based verification keeps access restricted to approved users.</p>
                  </div>
                </div>
                <div className="glass-surface flex items-start gap-3 rounded-2xl p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Responsive Workspace</p>
                    <p className="mt-1 text-sm text-gray-400">The admin dashboard adapts cleanly for phones, tablets, and wider screens.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-8 xl:p-10">
              <div className="mb-8 text-center xl:text-left">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="glass-surface mb-4 inline-flex items-center justify-center rounded-2xl p-3 xl:hidden"
                >
                  <Logo size="lg" className="h-8 w-8" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                <p className="mt-2 text-gray-400">Enter your admin key to continue</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                  <input
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Admin Key"
                    className="glass-surface w-full rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 transition-all focus:border-[#e50914] focus:bg-white/10 focus:outline-none"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-center text-red-400"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e50914] py-4 font-semibold text-white transition-colors hover:bg-[#f40612] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </motion.button>
              </form>

              <div className="glass-surface mt-6 rounded-2xl p-4">
                <p className="text-sm font-medium text-white">Restricted access</p>
                <p className="mt-1 text-sm text-gray-400">Authorized personnel only. Session remains stored in this browser until logout.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.14),_transparent_20%),radial-gradient(circle_at_16%_18%,_rgba(255,255,255,0.04),_transparent_24%),linear-gradient(180deg,_#0a0a0a_0%,_#121212_52%,_#141414_100%)]">
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
