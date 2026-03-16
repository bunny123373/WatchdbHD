"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";

interface IframePlayerProps {
  src?: string;
  title: string;
  autoPlay?: boolean;
}

export default function IframePlayer({ src, title, autoPlay = false }: IframePlayerProps) {
  const [hasError, setHasError] = useState(false);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    const separator = url.includes("?") ? "&" : "?";
    return autoPlay ? `${url}${separator}autoplay=1` : url;
  };

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black">
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-400">Failed to load video</p>
            <button
              onClick={() => setHasError(false)}
              className="mt-3 px-4 py-2 bg-white/10 text-white text-sm rounded-sm hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <iframe
          src={getEmbedUrl(src)}
          title={title}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
