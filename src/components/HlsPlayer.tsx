"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "@videojs/themes/city/index.css";
import { AlertCircle, RefreshCcw, Wifi } from "lucide-react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

function getSourceType(source: string) {
  return source.includes(".m3u8") ? "application/x-mpegURL" : "video/mp4";
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    setIsLoading(true);
    setHasError(false);

    const player = videojs(videoRef.current, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      inactivityTimeout: 2000,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      poster,
      sources: [
        {
          src,
          type: getSourceType(src),
        },
      ],
      controlBar: {
        children: [
          "playToggle",
          "volumePanel",
          "currentTimeDisplay",
          "timeDivider",
          "durationDisplay",
          "progressControl",
          "flexibleWidthSpacer",
          "playbackRateMenuButton",
          "fullscreenToggle",
        ],
      },
    });

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setHasError(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    player.on("loadstart", handleLoadStart);
    player.on("canplay", handleCanPlay);
    player.on("playing", handlePlaying);
    player.on("waiting", handleWaiting);
    player.on("error", handleError);

    playerRef.current = player;

    return () => {
      player.off("loadstart", handleLoadStart);
      player.off("canplay", handleCanPlay);
      player.off("playing", handlePlaying);
      player.off("waiting", handleWaiting);
      player.off("error", handleError);

      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, reloadKey]);

  if (!src) {
    return (
      <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
        <div className="relative flex h-full items-center justify-center">
          <div className="text-center p-8">
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
    <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-20 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-t from-black/65 to-transparent" />
      <div className="pointer-events-none absolute left-4 top-4 z-[2] flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-white/80 backdrop-blur">
        HLS STREAM
      </div>

      {isLoading && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/78 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <div className="h-10 w-10 rounded-full border-[3px] border-red-600/90 border-t-transparent animate-spin" />
            </div>
            <p className="text-lg font-medium text-white">Loading stream...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/92 px-6 backdrop-blur-sm">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <Wifi className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">Failed to Load Stream</h3>
            <p className="mb-5 text-sm text-zinc-400">
              The player could not load this source. Retry the stream or switch to another server if available.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-[#e50914] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#f40612]"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry Stream
            </button>
          </div>
        </div>
      )}

      <video
        key={reloadKey}
        ref={videoRef}
        className="video-js vjs-fill vjs-big-play-centered vjs-theme-city watch-player-video"
        playsInline
        aria-label={title}
      />
    </div>
  );
}
