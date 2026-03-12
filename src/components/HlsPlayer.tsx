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
      <div className="relative w-full aspect-video bg-zinc-900 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Stream Not Available</h3>
          <p className="text-zinc-500">This content does not have an HLS stream yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-medium">Loading...</p>
          </div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/90">
          <div className="text-center p-8">
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load</h3>
            <p className="text-zinc-400 text-sm">Please check your connection</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="video-js vjs-fill vjs-big-play-centered vjs-theme-city"
        playsInline
      />
    </div>
  );
}
