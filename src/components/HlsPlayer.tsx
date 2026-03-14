"use client";

import { useState, useRef, useEffect } from "react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setLoading(true);
      setError(false);
    }
  }, [src]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black">
      {error ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-3">Failed to load video</p>
            <button
              onClick={() => {
                setError(false);
                if (videoRef.current) videoRef.current.load();
              }}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="w-full h-full"
          onLoadedData={() => setLoading(false)}
          onError={() => setError(true)}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
