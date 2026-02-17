"use client";

import { useEffect, useRef, useState } from "react";

interface AdBannerProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function AdBanner({ slot, className = "", style }: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adsReady, setAdsReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initAds = () => {
      if (!(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle) {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
      }
      
      try {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
        setAdsReady(true);
      } catch (error) {
        console.error("AdSense error:", error);
      }
    };

    const script = document.createElement("script");
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8628683007968578";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = initAds;
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[src*="googlesyndication"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [slot]);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client="ca-pub-8628683007968578"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
