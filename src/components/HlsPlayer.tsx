"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { AlertCircle, RefreshCcw, Maximize2, Minimize2, Play } from "lucide-react";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
}

export default function HlsPlayer({ src, title, poster }: HlsPlayerProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);
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
    setShowPlayOverlay(true);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      setIsFullscreen(fs);
      if (!fs) setShowPlayOverlay(true);
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

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      enterFullscreen();
      setShowPlayOverlay(false);
    }
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
    <div 
      ref={playerRef}
      className={`relative w-full aspect-video overflow-hidden bg-black ${isFullscreen ? 'fixed inset-0 z-[9999] !rounded-none' : ''}`}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-gray-400 mb-3">Failed to load video</p>
            <button
              onClick={() => {
                setError(false);
                setReloadKey(k => k + 1);
                setShowPlayOverlay(true);
              }}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
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
          preload="auto"
          className="w-full h-full object-contain bg-black"
          onError={() => setError(true)}
          onEnded={() => setShowPlayOverlay(true)}
        />
      )}

      {/* Play Overlay Button */}
      {showPlayOverlay && !isFullscreen && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <button
            onClick={handlePlayClick}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-10 h-10 text-white fill-white ml-1" />
          </button>
        </div>
      )}

      {/* Controls */}
      {!isFullscreen && !error && !showPlayOverlay && (
        <div className="absolute right-3 top-3 z-[3] flex gap-2">
          <button
            type="button"
            onClick={() => {
              setError(false);
              setReloadKey(k => k + 1);
              setShowPlayOverlay(true);
            }}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={enterFullscreen}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isFullscreen && (
        <button
          type="button"
          onClick={exitFullscreen}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-[10]"
        >
          <Minimize2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
