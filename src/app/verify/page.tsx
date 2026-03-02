"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"ready" | "verifying" | "verified">("ready");
  const [countdown, setCountdown] = useState(10);
  const adOpenedRef = useRef(false);
  const contentId = searchParams.get("id");
  const contentType = searchParams.get("type") || "movie";
  const downloadUrl = searchParams.get("url");

  if (!contentId) {
    router.push("/");
    return null;
  }

  const handleVerify = () => {
    setStatus("verifying");
    
    if (!adOpenedRef.current) {
      adOpenedRef.current = true;
      window.open(SMARTLINK_URL, "_blank");
    }

    let seconds = 10;
    const countdownInterval = setInterval(() => {
      seconds--;
      setCountdown(seconds);
      if (seconds <= 0) {
        clearInterval(countdownInterval);
        setStatus("verified");
        setTimeout(() => {
          if (contentType === "download" && downloadUrl) {
            window.location.href = decodeURIComponent(downloadUrl);
          } else if (contentType === "series") {
            router.push(`/series/watch/${contentId}`);
          } else {
            router.push(`/watch/${contentId}`);
          }
        }, 1000);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1f1f1f] rounded-2xl p-8 text-center">
          {status === "ready" && (
            <>
              <div className="w-20 h-20 bg-[#e50914]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-[#e50914]" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verification Required</h1>
              <p className="text-gray-400 mb-6">Click verify to access the content</p>
              <button
                onClick={handleVerify}
                className="w-full py-3 px-6 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Verify Now
              </button>
            </>
          )}

          {status === "verifying" && (
            <>
              <Loader2 className="w-16 h-16 text-[#e50914] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying...</h1>
              <p className="text-gray-400 mb-4">Please complete the verification</p>
              <p className="text-sm text-gray-500">Redirecting in {countdown} seconds...</p>
            </>
          )}

          {status === "verified" && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verified!</h1>
              <p className="text-gray-400">Opening player...</p>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1f1f1f] rounded-2xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-[#e50914] animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Loading...</h1>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyContent />
    </Suspense>
  );
}
