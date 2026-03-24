"use client";

import { useState, useEffect, useRef } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

interface IframePlayerProps {
  src?: string;
  title: string;
  autoPlay?: boolean;
}

export default function IframePlayer({ src, title, autoPlay = false }: IframePlayerProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setStatus("loading");
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

  const handleRetry = () => {
    setStatus("loading");
    if (iframeRef.current) {
      const current = iframeRef.current.src;
      iframeRef.current.src = "";
      iframeRef.current.src = current;
    }
  };

  return (
    <div className="w-full aspect-video bg-black">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
      
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-20">
          <p className="text-gray-400 mb-4">Unable to load embed</p>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </a>
          </div>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="w-full h-full"
        frameBorder={0}
        loading="eager"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
