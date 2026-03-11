"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Play, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [step, setStep] = useState<"idle" | "verifying" | "done">("idle");
  const searchParams = useSearchParams();
  const router = useRouter();

  const startVerify = () => {
    setStep("verifying");
    localStorage.setItem("watchdb_verified", "true");
    
    const popup = window.open(SMARTLINK_URL, "_blank");
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = SMARTLINK_URL;
    }
  };

  useEffect(() => {
    const handleVerification = () => {
      if (step === "verifying") {
        setStep("done");
        
        setTimeout(() => {
          const contentId = searchParams.get("id");
          const contentType = searchParams.get("type") || "movie";
          const downloadUrl = searchParams.get("url");
          const season = searchParams.get("season");
          const episode = searchParams.get("episode");

          if (contentType === "download" && downloadUrl) {
            window.location.href = decodeURIComponent(downloadUrl);
          } else if (contentId) {
            let watchUrl = "";
            if (contentType === "series") {
              watchUrl = `/series/watch/${contentId}`;
              if (season && episode) {
                watchUrl += `?season=${season}&episode=${episode}`;
              }
            } else {
              watchUrl = `/watch/${contentId}`;
            }
            window.location.href = watchUrl;
          } else {
            window.location.href = "/";
          }
        }, 1500);
      }
    };

    if (step === "verifying") {
      const timer = setTimeout(() => {
        handleVerification();
      }, 3000);
      
      window.addEventListener("focus", handleVerification);
      const handleVisibility = () => {
        if (document.visibilityState === "visible" && step === "verifying") {
          handleVerification();
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("focus", handleVerification);
        document.removeEventListener("visibilitychange", handleVisibility);
      };
    }
  }, [step, searchParams, router]);

  const getContentTitle = () => {
    const contentType = searchParams.get("type");
    if (contentType === "series") return "TV Show";
    if (contentType === "movie") return "Movie";
    return "Content";
  };

  return (
    <div className="min-h-screen w-full bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black to-black" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <Logo size="md" className="w-8 h-8" />
        <span className="text-white/60 text-xs">Verification Required</span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mb-6"
              >
                <Logo size="lg" className="w-20 h-20 mx-auto" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                Ready to Watch?
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 text-sm mb-8"
              >
                Verify to access {getContentTitle()}
              </motion.p>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startVerify}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#f40612] text-white font-bold py-3 px-8 rounded-sm transition-all"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Verify Now</span>
              </motion.button>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-500 text-xs mt-4"
              >
                One-time verification • Keeps content free
              </motion.p>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm text-center"
            >
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
              </div>
              
              <h2 className="text-xl font-bold text-white mb-2">
                Verifying...
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Please complete the verification
              </p>
              <p className="text-gray-500 text-xs">
                Opening verification window
              </p>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-8 h-8 text-green-500" />
              </motion.div>

              <h2 className="text-xl font-bold text-white mb-2">
                Verified!
              </h2>
              <p className="text-gray-400 text-sm">
                Redirecting...
              </p>

              <div className="mt-6 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-green-500"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
      <div className="w-10 h-10 border-3 border-[#e50914] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyContent />
    </Suspense>
  );
}
