"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "verified" | "redirecting">("loading");
  const [countdown, setCountdown] = useState(5);
  const adOpenedRef = useRef(false);
  const contentId = searchParams.get("id");
  const contentType = searchParams.get("type") || "movie";

  useEffect(() => {
    if (!contentId) {
      router.push("/");
      return;
    }

    const openSmartLink = () => {
      if (!adOpenedRef.current) {
        adOpenedRef.current = true;
        window.open(SMARTLINK_URL, "_blank");
      }
    };

    const verifyAndRedirect = () => {
      setStatus("verified");
      
      let seconds = 5;
      const countdownInterval = setInterval(() => {
        seconds--;
        setCountdown(seconds);
        if (seconds <= 0) {
          clearInterval(countdownInterval);
          setStatus("redirecting");
          const redirectPath = contentType === "series" 
            ? `/series/watch/${contentId}`
            : `/watch/${contentId}`;
          router.push(redirectPath);
        }
      }, 1000);
    };

    setTimeout(() => {
      openSmartLink();
      verifyAndRedirect();
    }, 1500);

  }, [contentId, contentType, router]);

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-[#1f1f1f] rounded-2xl p-8 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 text-[#e50914] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-2">Verifying...</h1>
              <p className="text-gray-400">Please wait while we verify your access</p>
            </>
          )}

          {status === "verified" && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-green-500 fill-current" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Verified!</h1>
              <p className="text-gray-400 mb-4">Redirecting in {countdown} seconds...</p>
              <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full transition-all duration-1000"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </>
          )}

          {status === "redirecting" && (
            <>
              <Loader2 className="w-16 h-16 text-[#e50914] animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-white mb-2">Opening Player...</h1>
              <p className="text-gray-400">Taking you to the movie</p>
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
