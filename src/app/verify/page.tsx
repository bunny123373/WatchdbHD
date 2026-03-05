"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, CheckCircle, Loader2, Play, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-[#1a1a1a] bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WD</span>
            </div>
            <span className="text-white font-semibold">WatchDB</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
        <div className="w-full max-w-md">
          {step === "idle" && (
            <div className="bg-[#141414] rounded-2xl border border-[#222] p-8 text-center">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#333]">
                <Shield className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Required</h1>
              <p className="text-gray-400 mb-6 text-sm">Complete verification to access your content</p>
              <button
                onClick={startVerify}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                <Play className="w-5 h-5 fill-current" />
                Verify & Continue
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-gray-500 text-xs mt-4">This helps us keep content free for everyone</p>
            </div>
          )}

          {step === "verifying" && (
            <div className="bg-[#141414] rounded-2xl border border-[#222] p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6">
                <div className="w-full h-full border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="text-5xl font-bold text-white mb-2">{countdown}</div>
              <h2 className="text-xl font-semibold text-white mb-1">Verifying...</h2>
              <p className="text-gray-400 text-sm">Please wait while we verify</p>
            </div>
          )}

          {step === "done" && (
            <div className="bg-[#141414] rounded-2xl border border-[#222] p-8 text-center">
              <div className="w-20 h-20 bg-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-green-600/30">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
              <p className="text-gray-400 text-sm">Redirecting to your content...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="border-b border-[#1a1a1a] bg-[#111]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WD</span>
            </div>
            <span className="text-white font-semibold">WatchDB</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)] p-4">
        <div className="bg-[#141414] rounded-2xl border border-[#222] p-8 text-center">
          <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading...</p>
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
