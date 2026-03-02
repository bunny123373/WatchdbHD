"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [step, setStep] = useState("idle");
  const [countdown, setCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  const startVerify = () => {
    setStep("verifying");
    
    // Try popup, fallback for mobile
    const popup = window.open(SMARTLINK_URL, "_blank");
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      window.location.href = SMARTLINK_URL;
    }
    
    localStorage.setItem("watchdb_verified", "true");
  };

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    let redirectTimeout: NodeJS.Timeout;

    const handleVerification = () => {
      if (step === "verifying") {
        setStep("done");
        
        redirectTimeout = setTimeout(() => {
          const contentId = searchParams.get("id");
          const contentType = searchParams.get("type") || "movie";
          const downloadUrl = searchParams.get("url");

          if (contentType === "download" && downloadUrl) {
            window.location.href = decodeURIComponent(downloadUrl);
          } else if (contentId) {
            if (contentType === "series") {
              router.push(`/series/watch/${contentId}`);
            } else {
              router.push(`/watch/${contentId}`);
            }
          } else {
            router.push("/");
          }
        }, 5000);
      }
    };

    // Countdown timer
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

    // Detect when user returns to tab (works on mobile)
    window.addEventListener("focus", handleVerification);
    
    // Also detect visibility change as backup
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
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [step, searchParams, router]);

  return (
    <div className="container">
      <div className="card">
        {step === "idle" && (
          <>
            <h1>Verification Required</h1>
            <p>Please verify to continue watching movies</p>
            <button onClick={startVerify}>Verify & Continue</button>
          </>
        )}

        {step === "verifying" && (
          <>
            <div className="countdown">{countdown}</div>
            <h2>Verifying...</h2>
            <p>Please wait {countdown} seconds</p>
          </>
        )}

        {step === "done" && (
          <>
            <h2>Verified Successfully</h2>
            <p>Opening content...</p>
          </>
        )}
      </div>

      <style jsx>{`
        .container{
          min-height:100vh;
          width:100%;
          min-height:100dvh;
          background:linear-gradient(180deg, #0b0b0b 0%, #1a1a1a 100%);
          display:flex;
          justify-content:center;
          align-items:center;
          font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color:white;
          padding:20px;
          box-sizing:border-box;
          overflow-y:auto;
        }
        .card{
          background:linear-gradient(145deg, #1c1c1c, #141414);
          padding:clamp(24px, 5vw, 48px);
          border-radius:clamp(10px, 3vw, 16px);
          text-align:center;
          width:100%;
          max-width:380px;
          box-shadow:0 8px 32px rgba(0,0,0,0.4);
          border:1px solid #2a2a2a;
          margin:auto;
        }
        h1{
          margin-bottom:12px;
          font-weight:700;
          font-size:clamp(20px, 5vw, 28px);
        }
        h2{
          margin-bottom:12px;
          font-weight:600;
          font-size:clamp(18px, 4vw, 24px);
        }
        p{
          opacity:0.7;
          margin-bottom:clamp(20px, 4vw, 28px);
          font-size:clamp(13px, 3vw, 15px);
          line-height:1.5;
        }
        button{
          background:linear-gradient(135deg, #e50914 0%, #b2070f 100%);
          border:none;
          padding:clamp(14px, 3vw, 18px) clamp(24px, 5vw, 36px);
          font-size:clamp(14px, 3vw, 17px);
          font-weight:600;
          color:white;
          border-radius:clamp(6px, 2vw, 10px);
          cursor:pointer;
        }
        .spinner{
          width:clamp(36px, 8vw, 48px);
          height:clamp(36px, 8vw, 48px);
          border:3px solid #333;
          border-top:3px solid #e50914;
          border-radius:50%;
          margin:0 auto 20px;
          animation:spin 1s linear infinite;
        }
        @keyframes spin{
          100%{transform:rotate(360deg);}
        }
        .countdown{
          font-size:clamp(48px, 12vw, 72px);
          font-weight:700;
          color:#e50914;
          margin-bottom:10px;
        }
      `}</style>
    </div>
  );
}

function Loading() {
  return (
    <div className="container">
      <div className="card">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
      <style jsx>{`
        .container{
          min-height:100vh;
          width:100%;
          min-height:100dvh;
          background:linear-gradient(180deg, #0b0b0b 0%, #1a1a1a 100%);
          display:flex;
          justify-content:center;
          align-items:center;
          font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color:white;
          padding:20px;
          box-sizing:border-box;
        }
        .card{
          background:linear-gradient(145deg, #1c1c1c, #141414);
          padding:clamp(24px, 5vw, 48px);
          border-radius:clamp(10px, 3vw, 16px);
          text-align:center;
          width:100%;
          max-width:380px;
          box-shadow:0 8px 32px rgba(0,0,0,0.4);
          border:1px solid #2a2a2a;
          margin:auto;
        }
        .spinner{
          width:clamp(36px, 8vw, 48px);
          height:clamp(36px, 8vw, 48px);
          border:3px solid #333;
          border-top:3px solid #e50914;
          border-radius:50%;
          margin:0 auto 20px;
          animation:spin 1s linear infinite;
        }
        @keyframes spin{
          100%{transform:rotate(360deg);}
        }
        p{
          font-size:clamp(14px, 3vw, 16px);
          opacity:0.7;
        }
      `}</style>
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
