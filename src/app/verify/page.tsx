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
    <div className="min-h-screen bg-[#141414] overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,9,20,0.15),transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-3 py-2 md:py-3 lg:py-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-white font-semibold text-sm md:text-base lg:text-lg">WatchDB</span>
        </div>
      </div>

      {/* Content - Centered */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-50px)] px-3 md:px-4 lg:px-6">
        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-[280px] md:max-w-sm lg:max-w-md"
            >
              <div className="text-center mb-5 md:mb-6 lg:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#e50914]/10 rounded-full mb-3 md:mb-4">
                  <Logo size="md" className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10" />
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
                  Ready to watch?
                </h1>
                <p className="text-gray-400 text-xs md:text-sm">
                  Verify to access {getContentTitle()}
                </p>
              </div>

              <button
                onClick={startVerify}
                className="w-full flex items-center justify-center gap-2 bg-[#e50914] hover:bg-[#f40612] text-white font-bold py-2.5 md:py-3 lg:py-3.5 px-4 md:px-6 rounded-md transition-all text-sm md:text-base"
              >
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                <span>Verify & Watch</span>
              </button>

              <div className="mt-3 md:mt-4 flex items-center justify-center gap-2 text-gray-500 text-[10px] md:text-xs text-center">
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
              className="w-full max-w-[280px] md:max-w-sm lg:max-w-md text-center"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 md:mb-5 lg:mb-6 flex items-center justify-center">
                <Logo size="lg" className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 animate-pulse" />
              </div>

              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1">
                Verifying...
              </h2>
              <p className="text-gray-400 text-xs md:text-sm">
                Please complete the verification
              </p>

              <div className="mt-4 md:mt-5 lg:mt-6 flex items-center justify-center gap-2 text-gray-500 text-[10px] md:text-xs">
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
              className="w-full max-w-[280px] md:max-w-sm lg:max-w-md text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5 lg:mb-6"
              >
                <CheckCircle className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-green-500" />
              </motion.div>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
                You're all set!
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mb-4 md:mb-5 lg:mb-6">
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
    <div className="min-h-screen bg-[#141414] overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-black via-[#141414] to-[#141414]" />
      <div className="relative z-10 px-3 py-2 md:py-3 lg:py-4">
        <div className="flex items-center gap-2">
          <Logo size="sm" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="text-white font-semibold text-sm md:text-base lg:text-lg">WatchDB</span>
        </div>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-50px)]">
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 border-2 md:border-[3px] border-[#e50914] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs md:text-sm">Loading...</p>
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
