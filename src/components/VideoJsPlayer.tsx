"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Controls, createPlayer, PlayButton, Time, selectFullscreen, usePlayer } from "@videojs/react";
import { Video, videoFeatures } from "@videojs/react/video";
import "@videojs/react/video/minimal-skin.css";
import { Check, Languages } from "lucide-react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";
import "./BasicUsage.css";

export interface VideoJsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  playerId?: string;
}

const Player = createPlayer({
  features: videoFeatures,
  displayName: "VideoJsPlayer",
});

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

function FullscreenButton({ className, playerId }: { className?: string; playerId: string }) {
  const fs = usePlayer(selectFullscreen);
  const isActive = fs?.fullscreen ?? false;

  return (
    <button
      onClick={() => {
        const player = document.querySelector(`#${playerId}`);
        if (player) {
          if (document.fullscreenElement) {
            document.exitFullscreen?.();
          } else {
            player.requestFullscreen?.();
          }
        }
      }}
      className={`flex items-center justify-center w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors ${className || ''}`}
    >
      {isActive ? (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
        </svg>
      )}
    </button>
  );
}

export default function VideoJsPlayer({
  src,
  title,
  poster,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  playerId = "videojs-player",
}: VideoJsPlayerProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [lastMuted, setLastMuted] = useState(false);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const lastQuartileRef = useRef<number>(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const availableSources = sources || [];
  const currentSrc =
    availableSources.length > 0 ? availableSources[activeSourceIndex]?.url || src : src;

  const emit = useCallback(
    (event: string, data?: unknown) => {
      onEvent?.(event, data, playerId);

      const handler = onPlayerjsEvents?.[event as keyof PlayerjsEvents];
      if (typeof handler === "function") {
        handler(data as never);
      }
    },
    [onEvent, onPlayerjsEvents, playerId]
  );

  useEffect(() => {
    emit("init");
    return () => emit("stop");
  }, [emit]);

  useEffect(() => {
    setHasStarted(false);
    setLastMuted(false);
    lastQuartileRef.current = 0;
    emit("new");
  }, [currentSrc, emit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setShowSourceMenu(false);
      }
    };

    const handleOrientationChange = () => {
      if (playerContainerRef.current && document.fullscreenElement === playerContainerRef.current) {
        setTimeout(() => {
          playerContainerRef.current?.requestFullscreen?.();
        }, 100);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  const handleSourceChange = useCallback(
    (index: number) => {
      setActiveSourceIndex(index);
      setShowSourceMenu(false);
      if (availableSources[index]) {
        emit("source", availableSources[index].name);
      }
    },
    [availableSources, emit]
  );

  const checkQuartile = useCallback(
    (currentTime: number, duration: number) => {
      if (!duration) return;

      const percent = (currentTime / duration) * 100;
      const quartiles = [25, 50, 75, 100];
      for (const quartile of quartiles) {
        if (percent >= quartile && lastQuartileRef.current < quartile) {
          lastQuartileRef.current = quartile;
          emit("quartile", `${quartile}%`);
        }
      }
    },
    [emit]
  );

  const activeSource = availableSources[activeSourceIndex];

  if (!currentSrc) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div ref={playerContainerRef} className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
      <Player.Provider key={currentSrc}>
        <Player.Container className="react-controls-basic">
          <Video
            id={playerId}
            key={currentSrc}
            src={currentSrc}
            title={title}
            poster={poster}
            playsInline
            preload="auto"
            className="w-full h-full"
            onClick={() => emit("click")}
            onPlay={() => {
              if (!hasStarted) {
                emit("start");
                setHasStarted(true);
              }
              emit("play");
            }}
            onPause={() => emit("pause")}
            onEnded={() => {
              emit("end");
              emit("finish");
              onEnded?.();
            }}
            onLoadedMetadata={(event) => {
              emit("metadata");
              emit("duration", event.currentTarget.duration);
            }}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              emit("time", video.currentTime);
              emit("duration", video.duration);
              checkQuartile(video.currentTime, video.duration);
            }}
            onWaiting={() => emit("buffering")}
            onPlaying={() => emit("buffered")}
            onSeeking={(event) => emit("seek", event.currentTarget.currentTime)}
            onSeeked={(event) => emit("userseek", event.currentTarget.currentTime)}
            onRateChange={(event) => emit("speed", event.currentTarget.playbackRate)}
            onEmptied={() => emit("new")}
            onVolumeChange={(event) => {
              const video = event.currentTarget;
              const muted = video.muted || video.volume === 0;
              if (muted !== lastMuted) {
                setLastMuted(muted);
                emit(muted ? "mute" : "unmute");
              }
              emit("volume", muted ? 0 : video.volume);
            }}
            onError={() => emit("error", "Video playback error")}
          />

          <Controls.Root className="react-controls-basic__root">
            <Controls.Group className="react-controls-basic__bottom" aria-label="Playback controls">
              <PlayButton
                className="react-controls-basic__button"
                render={(props, state) => (
                  <button {...props} className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                    {state.paused ? (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    )}
                  </button>
                )}
              />

              <Time.Value type="current" className="react-controls-basic__time text-white text-sm" />
              <span className="text-white text-sm">/</span>
              <Time.Value type="duration" className="react-controls-basic__time text-white text-sm" />

              <FullscreenButton className="react-controls-basic__fullscreen" playerId={playerId} />
            </Controls.Group>
          </Controls.Root>
        </Player.Container>
      </Player.Provider>

      {availableSources.length > 1 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20" ref={sourceMenuRef}>
          <button
            onClick={() => setShowSourceMenu((open) => !open)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs sm:text-sm font-medium rounded-md transition-colors backdrop-blur-sm"
          >
            <Languages className="w-4 h-4" />
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
                  {activeSourceIndex === index && <Check className="w-4 h-4 text-red-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
