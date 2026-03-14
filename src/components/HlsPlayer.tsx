"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [error, setError] = useState(false);

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
              onClick={() => setError(false)}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <MuxPlayer
          src={src}
          poster={poster}
          metadata={{
            video_title: title,
          }}
          streamType="on-demand"
          className="w-full h-full"
          onError={() => setError(true)}
          accentColor="#e50914"
        />
      )}
    </div>
  );
}
