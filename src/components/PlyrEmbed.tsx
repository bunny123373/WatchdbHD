"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { VideoSource, VideoTrack } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";

export interface PlyrEmbedProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  videoSources?: VideoSource[];
  tracks?: VideoTrack[];
  plyrSrc?: string;
  plyrCss?: string;
  playerId?: string;
}

export default function PlyrEmbed({
  src,
  title,
  poster,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  videoSources,
  tracks,
  plyrSrc = "https://cdn.plyr.io/3.8.4/plyr.js",
  plyrCss = "https://cdn.plyr.io/3.8.4/plyr.css",
  playerId = "plyr-player"
}: PlyrEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const plyrInstanceRef = useRef<{ destroy: () => void } | null>(null);
  const plyrEventsRef = useRef<Record<string, () => void>>({});

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

    const initPlyr = () => {
      if (!containerRef.current || !mounted) return;
      if (typeof window === "undefined" || !window.Plyr) return;

      const videoElement = containerRef.current.querySelector("video") as HTMLVideoElement;
      if (!videoElement) return;

      try {
        const player = new window.Plyr(videoElement, {
          controls: [
            "play-large",
            "play",
            "rewind",
            "fast-forward",
            "progress",
            "current-time",
            "duration",
            "mute",
            "volume",
            "captions",
            "settings",
            "pip",
            "fullscreen"
          ],
          settings: ["quality", "captions"],
          captions: { active: true },
          ratio: "16:9",
          fullscreen: { enabled: true, fallback: true },
        });

        plyrInstanceRef.current = player;

        const events: Record<string, () => void> = {
          ready: () => emit("init"),
          play: () => emit("play"),
          pause: () => emit("pause"),
          ended: () => { emit("end"); emit("finish"); onEnded?.(); },
          timeupdate: () => { emit("time", player.currentTime); emit("duration", player.duration); },
          volumechange: () => { emit("volume", player.volume); emit(player.muted ? "mute" : "unmute"); },
          captionsenabled: () => emit("subtitle", "enabled"),
          captionsdisabled: () => emit("subtitle", "disabled"),
          enterfullscreen: () => emit("fullscreen"),
          exitfullscreen: () => emit("exitfullscreen"),
          error: () => { emit("error", "Player error"); setError(true); },
          seeked: () => emit("userseek", player.currentTime),
          qualitychange: () => { const q = player.quality as unknown as { height: number } | null; if (q && typeof q === 'object') emit("quality", `${q.height}p`); },
          waiting: () => emit("buffering"),
          playing: () => emit("buffered"),
        };

        plyrEventsRef.current = events;
        Object.entries(events).forEach(([event, handler]) => {
          (player.on as (e: string, h: () => void) => void)(event, handler);
        });

        setIsReady(true);
        emit("init");
      } catch (err) {
        console.error("Plyr init error:", err);
        setError(true);
      }
    };

    const loadPlyrScript = () => {
      if (window.Plyr) {
        initPlyr();
        return;
      }

      const script = document.createElement("script");
      script.src = plyrSrc;
      script.onload = () => initPlyr();
      script.onerror = () => setError(true);
      document.head.appendChild(script);

      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = plyrCss;
      document.head.appendChild(cssLink);
    };

    if (typeof window !== "undefined") {
      loadPlyrScript();
    }

    return () => {
      mounted = false;
      if (plyrInstanceRef.current) {
        try {
          plyrInstanceRef.current.destroy();
        } catch {}
        plyrInstanceRef.current = null;
      }
    };
  }, [emit, onEnded, plyrSrc]);

  useEffect(() => {
    if (!isReady || !plyrInstanceRef.current || !currentSrc) return;

    const player = plyrInstanceRef.current as unknown as { source: { type: string; title: string; sources: { src: string; type: string }[]; poster?: string; tracks?: { kind: string; label: string; srclang: string; src: string; default?: boolean }[] } };

    const safeSrc = currentSrc || "";
    player.source = {
      type: "video",
      title: title,
      sources: [
        { src: safeSrc, type: safeSrc.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' },
        ...(videoSources || []).map(s => ({ src: s.src, type: s.type || 'video/mp4' })),
      ],
      poster: poster,
      tracks: tracks?.map(t => ({
        kind: t.kind,
        label: t.label,
        srclang: t.srclang,
        src: t.src,
        default: t.default,
      })),
    };

    if (availableSources[activeSourceIndex]) {
      emit("source", availableSources[activeSourceIndex].name);
    }
    emit("new");
  }, [currentSrc, isReady, title, poster, tracks, videoSources, availableSources, activeSourceIndex, emit, src]);

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
      <div ref={containerRef} className="plyr-container">
        <video
          id={playerId}
          playsInline
          preload="metadata"
        >
          <source src={currentSrc} type={currentSrc.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'} />
          {(videoSources || []).map((source, index) => (
            <source key={index} src={source.src} type={source.type || 'video/mp4'} />
          ))}
          {(tracks || []).map((track, index) => (
            <track
              key={index}
              kind={track.kind}
              label={track.label}
              src={track.src}
              srcLang={track.srclang}
              default={track.default}
            />
          ))}
        </video>
      </div>

      {availableSources.length > 1 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs sm:text-sm rounded transition-colors"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="hidden sm:inline">{activeSource?.name || "Sources"}</span>
            <span className="sm:hidden">{activeSource?.name?.slice(0, 3) || "Src"}</span>
          </button>

          {showSourceMenu && (
            <div className="fixed sm:absolute inset-0 sm:inset-auto sm:top-full sm:left-0 mt-2 sm:mt-2 bg-[#1a1a1a] sm:rounded-lg border border-[#333] overflow-hidden min-w-[140px] sm:min-w-[180px] z-50">
              <div className="p-2 border-b border-[#333]">
                <span className="text-white text-xs sm:text-sm font-medium">Audio Sources</span>
              </div>
              {availableSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => handleSourceChange(index)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                    activeSourceIndex === index
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-white hover:bg-[#333]"
                  }`}
                >
                  <span>{source.name}</span>
                  {source.quality && (
                    <span className="text-xs text-white/50 ml-2">({source.quality})</span>
                  )}
                  {activeSourceIndex === index && (
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <p className="text-gray-400 mb-3">Failed to load player</p>
            <button
              onClick={() => {
                setError(false);
                window.location.reload();
              }}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .plyr-container {
          width: 100%;
          max-width: 100%;
        }
        .plyr-container :global(.plyr) {
          --plyr-color-main: #e50914;
          --plyr-video-background: #000;
          --plyr-video-controls-background: linear-gradient(transparent, rgba(0, 0, 0, 0.75));
          --plyr-font-family: inherit;
          --plyr-font-size-base: 14px;
          border-radius: 0;
        }
        .plyr-container :global(.plyr__video-wrapper) {
          aspect-ratio: 16 / 9;
        }
        .plyr-container :global(.plyr--video) {
          background: #000;
        }
        .plyr-container :global(.plyr__controls) {
          padding: 10px;
          gap: 5px;
        }
        .plyr-container :global(.plyr__control) {
          padding: 8px;
          border-radius: 4px;
        }
        .plyr-container :global(.plyr__control--overlaid) {
          padding: 16px;
        }
        @media (max-width: 640px) {
          .plyr-container :global(.plyr__controls) {
            padding: 8px;
            gap: 3px;
          }
          .plyr-container :global(.plyr__control) {
            padding: 6px;
          }
          .plyr-container :global(.plyr__control--overlaid) {
            padding: 12px;
          }
          .plyr-container :global(.plyr__time) {
            font-size: 12px;
          }
          .plyr-container :global(.plyr__tooltip) {
            font-size: 11px;
          }
        }
        @media (max-width: 480px) {
          .plyr-container :global(.plyr__controls) {
            flex-wrap: wrap;
            justify-content: center;
          }
          .plyr-container :global(.plyr__menu) {
            max-width: 120px;
          }
        }
      `}</style>
    </div>
  );
}
