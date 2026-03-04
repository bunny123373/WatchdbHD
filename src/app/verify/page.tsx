"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Loader2, Play, Download, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [step, setStep] = useState("idle");
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

          if (contentType === "download" && downloadUrl) {
            window.location.href = decodeURIComponent(downloadUrl);
          } else if (contentId) {
            if (contentType === "series") {
              window.location.href = `/series/watch/${contentId}`;
            } else {
              window.location.href = `/watch/${contentId}`;
            }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "idle" && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/25">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Verification Required</h1>
            <p className="text-gray-400 mb-8">Please complete verification to access content</p>
            <button
              onClick={startVerify}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-5 h-5 fill-current" />
              Verify & Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === "verifying" && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
              <div className="w-full h-full bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
            <div className="text-5xl font-bold text-red-500 mb-3">{countdown}</div>
            <h2 className="text-xl font-semibold text-white mb-2">Verifying...</h2>
            <p className="text-gray-400">Please wait {countdown} seconds</p>
          </div>
        )}

        {step === "done" && (
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verified Successfully!</h2>
            <p className="text-gray-400">Opening content...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">Loading...</p>
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
