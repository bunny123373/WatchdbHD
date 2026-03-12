"use client";

import { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@videojs/themes/city/index.css";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    setIsLoading(true);
    setHasError(false);

    const player = videojs(videoRef.current, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      poster: poster,
      sources: [{
        src: src,
        type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }],
      controlBar: {
        children: [
          'playToggle',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
          'progressControl',
          'flexibleWidthSpacer',
          'playbackRateMenuButton',
          'fullscreenToggle'
        ]
      }
    });

    player.on('loadstart', () => {
      setIsLoading(true);
      setHasError(false);
    });

    player.on('canplay', () => {
      setIsLoading(false);
    });

    player.on('playing', () => {
      setIsLoading(false);
    });

    player.on('error', () => {
      setHasError(true);
      setIsLoading(false);
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster]);

  if (!src) {
    return (
      <div className="watch-player-shell relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(229,9,20,0.15),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0))]" />
        <div className="relative flex h-full items-center justify-center">
          <div className="text-center p-8">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
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
      {isLoading && (
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
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="text-center p-8">
            <h3 className="mb-2 text-xl font-semibold text-white">Failed to Load</h3>
            <p className="text-zinc-400 text-sm">Please check your connection</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="video-js vjs-fill vjs-big-play-centered vjs-theme-city watch-player-video"
        playsInline
      />
    </div>
  );
}
