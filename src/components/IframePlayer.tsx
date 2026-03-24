"use client";

import { useState, useEffect, useRef } from "react";

interface IframePlayerProps {
  src?: string;
  title: string;
  autoPlay?: boolean;
}

export default function IframePlayer({ src, title, autoPlay = false }: IframePlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const keyRef = useRef(src);

  useEffect(() => {
    if (src !== keyRef.current) {
      keyRef.current = src;
      setIsLoading(true);
    }
  }, [src]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
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
      {isLoading && (
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
        allow="autoplay; fullscreen; picture-in-picture"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
