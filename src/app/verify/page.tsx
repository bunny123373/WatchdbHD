"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [adOpened, setAdOpened] = useState(false);
  const [redirectPath, setRedirectPath] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const contentId = searchParams.get("id");
    const contentType = searchParams.get("type") || "movie";
    const downloadUrl = searchParams.get("url");

    if (!contentId) {
      router.push("/");
      return;
    }

    let path = "";
    if (contentType === "download" && downloadUrl) {
      path = decodeURIComponent(downloadUrl);
    } else if (contentType === "series") {
      path = `/series/watch/${contentId}`;
    } else {
      path = `/watch/${contentId}`;
    }
    setRedirectPath(path);
  }, [searchParams, router]);

  const startVerify = () => {
    setAdOpened(true);
    window.open(SMARTLINK_URL, "_blank");
  };

  useEffect(() => {
    const handleFocus = () => {
      if (adOpened && redirectPath) {
        if (redirectPath.startsWith("http")) {
          window.location.href = redirectPath;
        } else {
          router.push(redirectPath);
        }
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [adOpened, redirectPath, router]);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#141414",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Human Verification Required</h2>

      <button
        onClick={startVerify}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          background: "#e50914",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Click to Verify
      </button>

      {adOpened && (
        <p style={{ marginTop: "20px", color: "#888" }}>
          After watching ad, come back to this tab...
        </p>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#141414",
        color: "white",
      }}
    >
      Loading...
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
