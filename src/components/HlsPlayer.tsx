"use client";

import { useState, useRef, useEffect } from "react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
}

export default function HlsPlayer({ src, title, poster, onEnded }: HlsPlayerProps) {
  const [error, setError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
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
          key={src}
          ref={videoRef}
          src={src}
          poster={poster}
          controls
          playsInline
          preload="auto"
          className="w-full h-full"
          onError={() => setError(true)}
          onEnded={onEnded}
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
