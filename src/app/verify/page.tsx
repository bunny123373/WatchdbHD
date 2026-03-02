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
    const contentId = searchParams.get("id");
    const contentType = searchParams.get("type") || "movie";
    const downloadUrl = searchParams.get("url");

    const focusBack = () => {
      if (opened) {
        if (contentId) {
          if (contentType === "download" && downloadUrl) {
            window.location.href = decodeURIComponent(downloadUrl);
          } else if (contentType === "series") {
            router.push(`/series/watch/${contentId}`);
          } else {
            router.push(`/watch/${contentId}`);
          }
        } else {
          router.push("/");
        }
      }
    };

    window.addEventListener("focus", focusBack);
    return () => window.removeEventListener("focus", focusBack);
  }, [searchParams, router, opened]);

  return (
    <div style={{
      height:"100vh",
      display:"flex",
      flexDirection:"column",
      justifyContent:"center",
      alignItems:"center",
      background:"#111",
      color:"#fff"
    }}>
      <h2>Human Verification Required</h2>

      <button
        onClick={verify}
        style={{
          padding:"15px 30px",
          background:"red",
          border:"none",
          borderRadius:"8px",
          color:"#fff",
          fontSize:"18px",
          cursor:"pointer",
          marginTop:"20px"
        }}
      >
        Click to Verify
      </button>
    </div>
  );
}

function Loading() {
  return (
    <div style={{
      height:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"#111",
      color:"#fff"
    }}>
      Loading...
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyContent />
    </Suspense>
  );
}
