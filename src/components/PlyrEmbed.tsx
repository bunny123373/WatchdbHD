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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const plyrInstanceRef = useRef<{ destroy: () => void } | null>(null);

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
      if (!videoRef.current || !mounted) return;
      if (typeof window === "undefined" || !window.Plyr) return;

      try {
        const player = new window.Plyr(videoRef.current, {
          controls: ["play-large", "play", "progress", "current-time", "duration", "mute", "volume", "captions", "settings", "fullscreen"],
          settings: ["quality", "captions"],
          captions: { active: false },
          ratio: "16:9",
          fullscreen: { enabled: true, fallback: true },
          keyboard: { focused: true, global: false },
          tooltips: { controls: false, seek: true },
          invertTime: false,
          toggleInvert: false,
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
      script.async = true;
      script.onload = () => initPlyr();
      script.onerror = () => setError(true);
      document.head.appendChild(script);

      if (!document.querySelector(`link[href="${plyrCss}"]`)) {
        const cssLink = document.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = plyrCss;
        document.head.appendChild(cssLink);
      }
    };

    if (typeof window !== "undefined") {
      loadPlyrScript();
    }

    return () => {
      mounted = false;
      if (plyrInstanceRef.current) {
        try {
          plyrInstanceRef.current.destroy();
        } catch (e) {
          console.warn('Failed to destroy Plyr instance:', e);
        }
        plyrInstanceRef.current = null;
      }
    };
  }, [emit, onEnded, plyrSrc]);

  useEffect(() => {
    const handleOrientationChange = () => {
      if (containerRef.current) {
        const isLandscape = window.innerWidth > window.innerHeight;
        if (isLandscape && !document.fullscreenElement) {
          containerRef.current.requestFullscreen?.();
        } else if (!isLandscape && document.fullscreenElement && document.fullscreenElement !== containerRef.current) {
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

  const handleCloseMenu = useCallback(() => {
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
    <div className="w-full relative bg-black" style={{ aspectRatio: "16/9" }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full">
        <video
          ref={videoRef}
          id={playerId}
          className="w-full h-full object-contain"
          playsInline
          preload="auto"
          autoPlay={false}
          controlsList="nodownload"
          disablePictureInPicture
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
        <div className="absolute top-2 left-2 z-30">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs font-medium rounded-md transition-colors backdrop-blur-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>{activeSource?.name || "Sources"}</span>
          </button>

          {showSourceMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={handleCloseMenu}
              />
              <div className="fixed sm:absolute top-1/2 sm:top-full left-1/2 sm:left-2 -translate-x-1/2 sm:translate-x-0 sm:-translate-y-0 mt-0 sm:mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[160px] max-w-[90vw] sm:min-w-[180px] z-50">
                <div className="p-3 border-b border-[#333] flex items-center justify-between">
                  <span className="text-white text-sm font-medium">Audio Sources</span>
                  <button 
                    onClick={handleCloseMenu}
                    className="text-white/50 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="max-h-[50vh] sm:max-h-[300px] overflow-y-auto">
                  {availableSources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => handleSourceChange(index)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                        activeSourceIndex === index
                          ? "bg-red-600/20 text-red-400"
                          : "text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="font-medium">{source.name}</span>
                      <div className="flex items-center gap-2">
                        {source.quality && (
                          <span className="text-xs text-white/50">{source.quality}</span>
                        )}
                        {activeSourceIndex === index && (
                          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-40">
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
    </div>
  );
}
