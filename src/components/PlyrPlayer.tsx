"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { VideoSource, VideoTrack } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";

export interface PlyrPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  videoSources?: VideoSource[];
  tracks?: VideoTrack[];
  options?: Record<string, unknown>;
  playerId?: string;
}

export default function PlyrPlayer({
  src,
  title,
  poster,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  videoSources,
  tracks,
  options,
  playerId = "plyr-player"
}: PlyrPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Record<string, unknown> | null>(null);
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

    const initPlyr = async () => {
      if (!containerRef.current || !mounted) return;

      try {
        const PlyrModule = await import("plyr");
        const Plyr = PlyrModule.default || PlyrModule;
        
        if (!mounted) return;

        const plyrOptions = {
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
          ...options,
        };

        const videoElement = containerRef.current.querySelector("video") as HTMLVideoElement;
        if (videoElement) {
        const plyrInstance = new Plyr(videoElement, plyrOptions) as unknown as Record<string, unknown>;
          playerRef.current = plyrInstance;

          const plyrOn = plyrInstance.on as (event: string, callback: () => void) => void;
          plyrOn("ready", () => emit("init"));
          plyrOn("play", () => emit("play"));
          plyrOn("pause", () => emit("pause"));
          plyrOn("ended", () => {
            emit("end");
            emit("finish");
            onEnded?.();
          });
          plyrOn("timeupdate", () => {
            const time = plyrInstance.currentTime as number;
            const duration = plyrInstance.duration as number;
            emit("time", time);
            emit("duration", duration);
          });
          plyrOn("volumechange", () => {
            const volume = plyrInstance.volume as number;
            const muted = plyrInstance.muted as boolean;
            emit("volume", volume);
            emit(muted ? "mute" : "unmute");
          });
          plyrOn("captionsenabled", () => emit("subtitle", "enabled"));
          plyrOn("captionsdisabled", () => emit("subtitle", "disabled"));
          plyrOn("enterfullscreen", () => emit("fullscreen"));
          plyrOn("exitfullscreen", () => emit("exitfullscreen"));
          plyrOn("error", () => {
            emit("error", "Player error");
            setError(true);
          });
          plyrOn("seeked", () => {
            const time = plyrInstance.currentTime as number;
            emit("userseek", time);
          });
          plyrOn("qualitychange", () => {
            const quality = plyrInstance.quality as { height: number } | null;
            if (quality) emit("quality", `${quality.height}p`);
          });
          plyrOn("waiting", () => emit("buffering"));
          plyrOn("playing", () => emit("buffered"));

          emit("init");
        }
      } catch (err) {
        console.error("Failed to initialize Plyr:", err);
        setError(true);
      }
    };

    initPlyr();

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          (playerRef.current as unknown as { destroy: () => void }).destroy();
        } catch (e) {
          console.warn('Failed to destroy player:', e);
        }
        playerRef.current = null;
      }
    };
  }, [emit, onEnded, options]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (containerRef.current) {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLandscape = window.innerWidth > window.innerHeight;
        if (isMobile && isLandscape && !document.fullscreenElement) {
          containerRef.current.requestFullscreen?.();
        } else if (isMobile && !isLandscape && document.fullscreenElement && document.fullscreenElement === containerRef.current) {
          document.exitFullscreen?.();
        }
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
    if (!isReady || !playerRef.current) return;

    const newSrc = availableSources.length > 0 
      ? availableSources[activeSourceIndex]?.url || src 
      : src;

    if (newSrc) {
      const plyrInstance = playerRef.current as unknown as { source: Record<string, unknown> };
      plyrInstance.source = {
        type: "video",
        title: title,
        sources: [
          {
            src: newSrc,
            type: newSrc.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4',
          },
          ...(videoSources || []).map(s => ({
            src: s.src,
            type: s.type || 'video/mp4',
          })),
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
    }
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
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-sm rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{activeSource?.name || "Sources"}</span>
          </button>

          {showSourceMenu && (
            <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[180px]">
              <div className="p-2 border-b border-[#333]">
                <span className="text-white text-xs font-medium">Audio Sources</span>
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
            <p className="text-gray-400 mb-3">Failed to load video</p>
            <button
              onClick={() => {
                setError(false);
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
        }
        .plyr-container :global(.plyr__video-wrapper) {
          aspect-ratio: 16 / 9;
        }
        .plyr-container :global(.plyr--video) {
          background: #000;
        }
      `}</style>
    </div>
  );
}
