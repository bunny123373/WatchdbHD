"use client";

import { useEffect, useRef, useState } from "react";

const ADSENSE_PUB_ID = "ca-pub-8628683007968578";

interface AdBannerProps {
  slot?: string;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_SLOT = "3635711104";

export default function AdBanner({ slot = DEFAULT_SLOT, className = "", style }: AdBannerProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initAds = () => {
      if (!(window as unknown as { adsbygoogle: unknown[] }).adsbygoogle) {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = [];
      }
      
      try {
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle.push({});
        setAdLoaded(true);
      } catch (error) {
        console.log("AdSense: Ad blocked or error");
      }
    };

    if ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle) {
      initAds();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = initAds;
    document.head.appendChild(script);

    return () => {
      // Don't remove script, keep it for subsequent ads
    };
  }, [slot]);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%", minHeight: "90px", ...style }}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
