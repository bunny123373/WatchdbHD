"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

const SMARTLINK_URL = "https://www.effectivegatecpm.com/ez0wrxx0zn?key=b166ecee7b5de9ec7c78ffb0dc437430";

function VerifyContent() {
  const [step, setStep] = useState("idle");
  const searchParams = useSearchParams();
  const router = useRouter();

  const startVerify = () => {
    setStep("ad");
    window.open(SMARTLINK_URL, "_blank");
    localStorage.setItem("watchdb_verified", "true");
  };

  useEffect(() => {
    const backDetect = () => {
      if (step === "ad") {
        setStep("loading");

        setTimeout(() => {
          setStep("done");

          setTimeout(() => {
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
          }, 2000);

        }, 10000);
      }
    };

    window.addEventListener("focus", backDetect);
    return () => window.removeEventListener("focus", backDetect);
  }, [step, searchParams, router]);

  return (
    <div className="container">

      <div className="card">

        {step === "idle" && (
          <>
            <h1>Verification Required</h1>
            <p>
              Please verify to continue watching movies
            </p>

            <button onClick={startVerify}>
              Verify & Continue
            </button>
          </>
        )}

        {step === "loading" && (
          <>
            <div className="loader"></div>
            <h2>Verifying...</h2>
            <p>Please wait a moment</p>
          </>
        )}

        {step === "done" && (
          <>
            <h2>Verified Successfully</h2>
            <p>Opening Movies...</p>
          </>
        )}

      </div>

<style jsx>{`

.container{
height:100vh;
background:#0b0b0b;
display:flex;
justify-content:center;
align-items:center;
font-family:sans-serif;
color:white;
}

.card{
background:#161616;
padding:40px;
border-radius:12px;
text-align:center;
width:90%;
max-width:380px;
}

h1{
margin-bottom:12px;
font-weight:600;
}

p{
opacity:.7;
margin-bottom:25px;
}

button{
background:#e50914;
border:none;
padding:14px 28px;
font-size:16px;
color:white;
border-radius:6px;
cursor:pointer;
}

.loader{
width:40px;
height:40px;
border:4px solid #333;
border-top:4px solid white;
border-radius:50%;
margin:0 auto 20px;
animation:spin 1s linear infinite;
}

@keyframes spin{
100%{transform:rotate(360deg);}
}

`}</style>

    </div>
  );
}

function Loading() {
  return (
    <div className="container">
      <div className="card">
        <p>Loading...</p>
      </div>
      <style jsx>{`
        .container{
          height:100vh;
          background:#0b0b0b;
          display:flex;
          justify-content:center;
          align-items:center;
          font-family:sans-serif;
          color:white;
        }
        .card{
          background:#161616;
          padding:40px;
          border-radius:12px;
          text-align:center;
          width:90%;
          max-width:380px;
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
