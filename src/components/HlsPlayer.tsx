"use client";

import { useMemo, useState } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { createPlayer, Poster } from "@videojs/react";
import { Video, videoFeatures } from "@videojs/react/video";
import HlsVideo from "@videojs/react/media/hls-video";
import { VideoSkin } from "@/components/VideoJsReactPlayer";
import "@videojs/react/video/skin.css";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

const Player = createPlayer({ features: videoFeatures });

function isHlsSource(source: string) {
  return source.includes(".m3u8");
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const MediaComponent = useMemo(() => (src && isHlsSource(src) ? HlsVideo : Video), [src]);

  if (!src) {
    return (
      <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
        <div className="relative flex h-full items-center justify-center">
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <AlertCircle className="h-10 w-10 text-zinc-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Stream Not Available</h3>
            <p className="text-zinc-500">This content does not have an HLS stream yet.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="watch-player-shell watch-player-shell--react watch-player-shell--netflix relative w-full aspect-video overflow-hidden rounded-[20px] sm:rounded-[24px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/72 via-black/28 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-black via-black/78 to-transparent" />
      <div className="pointer-events-none absolute left-3 top-3 z-[2] flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-white/80 backdrop-blur sm:left-4 sm:top-4 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
        {isHlsSource(src) ? "HLS STREAM" : "VIDEO STREAM"}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3 sm:p-4">
        <div className="max-w-[68%]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-[11px]">Watching Now</p>
          <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white sm:text-lg">{title}</h3>
        </div>
      </div>

      <Player.Provider key={`${src}-${reloadKey}`}>
        <VideoSkin className="h-full w-full">
          <MediaComponent
            src={src}
            poster={poster}
            playsInline
            preload="auto"
            aria-label={title}
            className="h-full w-full object-cover"
          />
          {poster && <Poster src={poster} alt={title} />}
        </VideoSkin>
      </Player.Provider>

      <button
        type="button"
        onClick={() => setReloadKey((current) => current + 1)}
        className="absolute right-3 top-3 z-[3] inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-black/75 sm:right-4 sm:top-4 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
      >
        <RefreshCcw className="h-3.5 w-3.5" />
        Reload
      </button>
    </div>
  );
}
