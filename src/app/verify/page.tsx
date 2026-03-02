"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [opened, setOpened] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const verify = () => {
    setOpened(true);
    window.open(SMARTLINK_URL, "_blank");
    localStorage.setItem("watchdb_verified", "true");
  };

  useEffect(() => {
    const backDetect = () => {
      if (opened) {
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
      }
    };

    window.addEventListener("focus", backDetect);
    return () => window.removeEventListener("focus", backDetect);
  }, [opened, searchParams, router]);

  return (
    <div className="verify-container">

      <div className="card">
        <h1>🔒 Verification Required</h1>

        <p>
          Please verify that you are human to continue
          watching movies.
        </p>

        <button onClick={verify}>
          ✅ Verify & Continue
        </button>

        <span>Only takes 5 seconds</span>
      </div>

      <style jsx>{`
        .verify-container {
          height:100vh;
          background:linear-gradient(
            135deg,
            #000,
            #111,
            #1a1a1a
          );
          display:flex;
          justify-content:center;
          align-items:center;
          color:white;
          font-family:sans-serif;
        }

        .card{
          background:#141414;
          padding:40px;
          border-radius:14px;
          text-align:center;
          width:90%;
          max-width:400px;
          box-shadow:0 0 30px rgba(255,0,0,0.3);
        }

        h1{
          margin-bottom:15px;
        }

        p{
          opacity:.8;
          margin-bottom:25px;
        }

        button{
          background:#e50914;
          border:none;
          padding:14px 28px;
          font-size:18px;
          color:white;
          border-radius:8px;
          cursor:pointer;
          transition:.3s;
        }

        button:hover{
          transform:scale(1.05);
        }

        span{
          display:block;
          margin-top:15px;
          font-size:12px;
          opacity:.6;
        }
      `}</style>

    </div>
  );
}

function Loading() {
  return (
    <div className="verify-container">
      <div className="card">
        <p>Loading...</p>
      </div>
      <style jsx>{`
        .verify-container {
          height:100vh;
          background:linear-gradient(135deg, #000, #111, #1a1a1a);
          display:flex;
          justify-content:center;
          align-items:center;
          color:white;
          font-family:sans-serif;
        }
        .card{
          background:#141414;
          padding:40px;
          border-radius:14px;
          text-align:center;
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
