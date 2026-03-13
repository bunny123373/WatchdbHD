"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { AlertCircle, RefreshCcw, Maximize2, Minimize2 } from "lucide-react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

function isHlsSource(source: string) {
  return source.includes(".m3u8");
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const enterFullscreen = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      } else if ((playerRef.current as any).webkitRequestFullscreen) {
        (playerRef.current as any).webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if ((document as any).webkitFullscreenElement) {
      (document as any).webkitExitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, exitFullscreen]);

  if (!src) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-[24px] border border-white/10 bg-[#050505]">
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

  const isHls = isHlsSource(src);

  return (
    <div 
      ref={playerRef}
      className={`relative w-full aspect-video overflow-hidden bg-black ${isFullscreen ? 'fixed inset-0 z-[9999] !rounded-none' : 'rounded-[20px] sm:rounded-[24px] border border-white/10'}`}
    >
      {!isFullscreen && (
        <>
          <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.18))]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/72 via-black/28 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-t from-black via-black/78 to-transparent" />
          <div className="pointer-events-none absolute left-3 top-3 z-[2] flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-white/80 sm:left-4 sm:top-4 sm:px-3 sm:text-[11px] sm:tracking-[0.2em]">
            {isHls ? "HLS STREAM" : "VIDEO STREAM"}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between p-3 sm:p-4">
            <div className="max-w-[68%]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45 sm:text-[11px]">Watching Now</p>
              <h3 className="mt-1 line-clamp-1 text-sm font-semibold text-white sm:text-lg">{title}</h3>
            </div>
          </div>
        </>
      )}

      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center p-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Video</h3>
            <p className="text-gray-400 mb-4">Please try reloading the player</p>
            <button
              onClick={() => {
                setError(false);
                setReloadKey(k => k + 1);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <video
          key={`${src}-${reloadKey}`}
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline={!isFullscreen}
          controls={isFullscreen}
          autoPlay={isFullscreen}
          preload="auto"
          className="w-full h-full object-contain bg-black"
          onError={() => setError(true)}
          onPlay={!isFullscreen ? enterFullscreen : undefined}
        />
      )}

      <div className={`absolute z-[3] flex gap-2 ${isFullscreen ? 'top-4 right-4' : 'right-3 top-3 sm:right-4 sm:top-4'}`}>
        <button
          type="button"
          onClick={() => {
            setError(false);
            setReloadKey(k => k + 1);
          }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-black/75 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          {!isFullscreen && <span>Reload</span>}
        </button>
        {!isFullscreen && (
          <button
            type="button"
            onClick={enterFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-black/75 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Fullscreen
          </button>
        )}
        {isFullscreen && (
          <button
            type="button"
            onClick={exitFullscreen}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black/75"
          >
            <Minimize2 className="h-4 w-4" />
            Exit
          </button>
        )}
      </div>
    </div>
  );
}
