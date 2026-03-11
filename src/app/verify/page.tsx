"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, Play, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

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
    <div className="min-h-screen w-full bg-[#141414] overflow-hidden flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.15),transparent_50%)]" />
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-3 py-4">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[260px] sm:max-w-xs"
            >
              <div className="text-center mb-4 sm:mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#e50914]/10 rounded-full mb-3">
                  <Logo size="md" className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
                  Ready to watch?
                </h1>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Verify to access {getContentTitle()}
                </p>
              </div>

              <button
                onClick={startVerify}
                className="w-full flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#f40612] text-white font-bold py-2.5 sm:py-3 px-4 rounded-md transition-all text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Verify & Watch</span>
              </button>

              <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-[10px] sm:text-xs text-center">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>One-time verification</span>
              </div>
            </motion.div>
          )}

          {step === "verifying" && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-[260px] sm:max-w-xs text-center"
            >
              <div className="flex items-center justify-center mb-4">
                <Logo size="lg" className="w-14 h-14 sm:w-16 sm:h-16 animate-pulse" />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Verifying...
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-3">
                Please complete the verification
              </p>

              <div className="flex items-center justify-center gap-2 text-gray-500 text-[10px] sm:text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Opening verification</span>
              </div>
            </motion.div>
          )}

          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-[260px] sm:max-w-xs text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-16 h-16 sm:w-18 sm:h-18 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 sm:w-9 sm:h-9 text-green-500" />
              </motion.div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                You're all set!
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm mb-4">
                Redirecting...
              </p>

              <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
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
    <div className="min-h-screen w-full bg-[#141414] overflow-hidden flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs sm:text-sm">Loading...</p>
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
