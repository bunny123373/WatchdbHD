"use client";

import { useState, useEffect } from "react";

interface IframePlayerProps {
  src?: string;
  title: string;
  autoPlay?: boolean;
}

export default function IframePlayer({ src, title, autoPlay = false }: IframePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [src]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black" />
    );
  }

  let embedUrl = src.trim();
  
  if (embedUrl.startsWith("//")) {
    embedUrl = "https:" + embedUrl;
  } else if (!embedUrl.startsWith("http://") && !embedUrl.startsWith("https://")) {
    embedUrl = "https://" + embedUrl;
  }

  const separator = embedUrl.includes("?") ? "&" : "?";
  if (autoPlay) {
    embedUrl = `${embedUrl}${separator}autoplay=1`;
  }

  return (
    <div className="relative w-full aspect-video bg-black">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <iframe
        key={embedUrl}
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder={0}
        allowFullScreen
        allow="autoplay; encrypted-media"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}
