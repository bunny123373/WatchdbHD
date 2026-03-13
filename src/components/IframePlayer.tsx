"use client";

import { useState } from "react";
import { Play, AlertCircle } from "lucide-react";

interface IframePlayerProps {
  src?: string;
  title: string;
}

export default function IframePlayer({ src, title }: IframePlayerProps) {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
        <div className="relative flex h-full items-center justify-center">
          <div className="text-center p-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <AlertCircle className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Watch Link Not Available</h3>
            <p className="text-gray-500">This content does not have a streaming link yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 z-[2] flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-white/80">
        EMBED PLAYER
      </div>
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#141414]/95">
          <div className="text-center p-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Failed to Load Video</h3>
            <p className="text-gray-500">Please try again later or check your connection.</p>
          </div>
        </div>
      )}

      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
