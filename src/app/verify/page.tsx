"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Loader2, Play, ArrowRight, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [step, setStep] = useState<"idle" | "verifying" | "done">("idle");
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  const startVerify = () => {
    setStep("verifying");
    
    const popup = window.open(SMARTLINK_URL, "_blank");
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = SMARTLINK_URL;
    }
    
    localStorage.setItem("watchdb_verified", "true");
  };

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

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
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    window.addEventListener("focus", handleVerification);
    
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && step === "verifying") {
        handleVerification();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    
    return () => {
      window.removeEventListener("focus", handleVerification);
      document.removeEventListener("visibilitychange", handleVisibility);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [step, searchParams, router]);

  const getContentTitle = () => {
    const contentId = searchParams.get("id");
    const contentType = searchParams.get("type");
    if (contentType === "series") return "TV Show";
    if (contentType === "movie") return "Movie";
    return "Content";
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.15),transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/5 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#e50914] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">W</span>
            </div>
            <span className="text-white font-semibold text-base sm:text-lg">WatchDB</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-56px)] px-3 sm:px-4">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-sm sm:max-w-md"
            >
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-[#e50914]/10 rounded-full mb-4 sm:mb-6">
                  <Shield className="w-7 h-7 sm:w-10 sm:h-10 text-[#e50914]" />
                </div>
                <h1 className="text-2xl sm:text-3xl sm:text-4xl font-bold text-white mb-2 sm:mb-3">
                  Ready to watch?
                </h1>
                <p className="text-gray-400 text-sm sm:text-lg">
                  Verify to access {getContentTitle()}
                </p>
              </div>

              <button
                onClick={startVerify}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-[#e50914] hover:bg-[#f40612] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                <span className="text-base sm:text-lg">Verify & Watch</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm text-center">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>One-time verification to keep content free</span>
              </div>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-sm sm:max-w-md text-center"
            >
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8">
                <div className="absolute inset-0 border-4 border-[#e50914]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#e50914] border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-bold text-white">{countdown}</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Verifying...
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Please complete the verification process
              </p>

              <div className="mt-6 sm:mt-8 flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                <span>Opening verification window</span>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm sm:max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-500" />
              </motion.div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                You're all set!
              </h2>
              <p className="text-gray-400 text-sm sm:text-base">
                Redirecting to your content...
              </p>

              <div className="mt-6 sm:mt-8">
                <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-green-500"
                  />
                </div>
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
    <div className="min-h-screen bg-[#141414]">
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]" />
      <div className="relative z-10 border-b border-white/5 bg-gradient-to-b from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#e50914] rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs sm:text-sm">W</span>
            </div>
            <span className="text-white font-semibold text-base sm:text-lg">WatchDB</span>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-56px)]">
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-[3px] border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
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
