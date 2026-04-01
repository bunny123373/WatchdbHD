"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";

export interface VidstackEmbedProps {
  src?: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  playerId?: string;
  thumbnails?: string;
  vidstackSrc?: string;
  vidstackTheme?: string;
  vidstackVideoCss?: string;
}

const languageFlags: Record<string, string> = {
  en: "US",
  es: "ES",
  hi: "IN",
  ja: "JP",
  ko: "KR",
  ta: "IN",
  te: "IN",
  default: "GL",
};

function getLanguageFlag(lang?: string): string {
  if (!lang) return languageFlags.default;
  const langCode = lang.toLowerCase().slice(0, 2);
  return languageFlags[langCode] || languageFlags.default;
}

export default function VidstackEmbed({
  src,
  title,
  poster,
  autoplay,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  playerId = "vidstack-player",
  thumbnails,
  vidstackSrc = "https://cdn.vidstack.io/player",
  vidstackTheme = "https://cdn.vidstack.io/player/theme.css",
  vidstackVideoCss = "https://cdn.vidstack.io/player/video.css"
}: VidstackEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);

  const availableSources = sources || [];
  const currentSrc = availableSources.length > 0 
    ? availableSources[activeSourceIndex]?.url || src 
    : src;

  const emit = useCallback((event: string, data?: unknown) => {
    if (onEvent) {
      onEvent(event, data, playerId);
    }
    if (onPlayerjsEvents) {
      const handler = onPlayerjsEvents[event as keyof PlayerjsEvents];
      if (typeof handler === "function") {
        handler(data as never);
      }
    }
  }, [onEvent, onPlayerjsEvents, playerId]);

  useEffect(() => {
    let mounted = true;

    const loadStyles = () => {
      if (!document.querySelector(`link[href="${vidstackTheme}"]`)) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = vidstackTheme;
        document.head.appendChild(cssLink);
      }
      if (!document.querySelector(`link[href="${vidstackVideoCss}"]`)) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = vidstackVideoCss;
        document.head.appendChild(cssLink);
      }
    };

    const loadVidstack = () => {
      if ((window as any).MediaPlayer) {
        initPlayer();
        return;
      }

      const script = document.createElement("script");
      script.src = vidstackSrc;
      script.type = "module";
      script.async = true;
      script.onload = () => initPlayer();
      script.onerror = () => {
        console.error("Failed to load Vidstack script");
        setError(true);
      };
      document.head.appendChild(script);

      loadStyles();
    };

    const initPlayer = () => {
      if (!containerRef.current || !mounted) return;
      if (!(window as any).MediaPlayer) {
        console.error("MediaPlayer not available");
        return;
      }

      const player = document.createElement("media-player");
      player.setAttribute("src", currentSrc || "");
      if (poster) player.setAttribute("poster", poster);
      if (title) player.setAttribute("title", title);
      player.setAttribute("playsinline", "true");
      player.setAttribute("id", playerId);
      if (autoplay) player.setAttribute("autoplay", "true");

      player.innerHTML = `
        <media-provider></media-provider>
        <media-poster class="vds-poster" src="${poster || ''}" alt="${title || ''}"></media-poster>
        <media-video-layout ${thumbnails ? `thumbnails="${thumbnails}"` : ""}></media-video-layout>
      `;

      containerRef.current.appendChild(player);
      playerRef.current = player;

      player.addEventListener("ready", () => {
        setIsReady(true);
        emit("init");
      });

      player.addEventListener("play", () => emit("play"));
      player.addEventListener("pause", () => emit("pause"));
      player.addEventListener("ended", () => {
        emit("end");
        emit("finish");
        onEnded?.();
      });
      
      player.addEventListener("time-update", (e: any) => {
        emit("time", e.currentTime);
        emit("duration", e.duration);
      });
      
      player.addEventListener("volume-change", (e: any) => {
        emit("volume", e.volume);
        emit(e.muted ? "mute" : "unmute");
      });
      
      player.addEventListener("error", () => {
        emit("error", "Player error");
        setError(true);
      });
      
      player.addEventListener("seeking", (e: any) => emit("seek", e.currentTime));
      player.addEventListener("seeked", (e: any) => emit("userseek", e.currentTime));
      player.addEventListener("waiting", () => emit("buffering"));
      player.addEventListener("playing", () => emit("buffered"));
      player.addEventListener("enter-fullscreen", () => emit("fullscreen"));
      player.addEventListener("exit-fullscreen", () => emit("exitfullscreen"));

      emit("init");
    };

    if (typeof window !== "undefined") {
      loadVidstack();
    }

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (e) {
          console.warn("Failed to remove player:", e);
        }
        playerRef.current = null;
      }
    };
  }, [emit, onEnded, vidstackSrc, vidstackTheme, vidstackVideoCss, thumbnails]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (containerRef.current && document.fullscreenElement === containerRef.current) {
        setTimeout(() => {
          containerRef.current?.requestFullscreen?.();
        }, 100);
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    if (!isReady || !playerRef.current || !currentSrc) return;

    playerRef.current.src = currentSrc;
    
    if (availableSources[activeSourceIndex]) {
      emit("source", availableSources[activeSourceIndex].name);
    }
    emit("new");
  }, [currentSrc, isReady, availableSources, activeSourceIndex, emit]);

  const handleSourceChange = useCallback((index: number) => {
    setActiveSourceIndex(index);
    setShowSourceMenu(false);
  }, []);

  const activeSource = availableSources[activeSourceIndex];

  if (!currentSrc) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div ref={containerRef} className="vidstack-container w-full aspect-video bg-black">
      </div>

      {availableSources.length > 1 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs sm:text-sm font-medium rounded-md transition-colors backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{activeSource?.name || "Sources"}</span>
          </button>

          {showSourceMenu && (
            <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[140px] sm:min-w-[180px]">
              <div className="p-2 border-b border-[#333]">
                <span className="text-white text-xs sm:text-sm font-medium">Audio Sources</span>
              </div>
              {availableSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => handleSourceChange(index)}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition-colors ${
                    activeSourceIndex === index
                      ? "bg-red-600/20 text-red-400"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getLanguageFlag(source.name)}</span>
                    <span>{source.name}</span>
                    {source.quality && (
                      <span className="text-white/50 text-xs">({source.quality})</span>
                    )}
                  </div>
                  {activeSourceIndex === index && (
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center p-4">
            <p className="text-white/70 mb-4">Failed to load video</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .vidstack-container :global(media-player) {
          width: 100%;
          height: 100%;
          --media-background: #000;
        }
        .vidstack-container :global(media-video-layout) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
