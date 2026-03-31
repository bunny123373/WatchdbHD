"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import "@vidstack/react/player/styles/base.css";

export interface VidstackPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  playerId?: string;
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

export default function VidstackPlayer({
  src,
  title,
  poster,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  playerId = "vidstack-player",
}: VidstackPlayerProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastQuartileRef = useRef<number>(0);
  const playerRef = useRef<any>(null);

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
    lastQuartileRef.current = 0;
    emit("new");
  }, [currentSrc, emit]);

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

  const handlePlay = useCallback(() => {
    if (!hasStarted) {
      emit("start");
      setHasStarted(true);
    }
    emit("play");
  }, [hasStarted, emit]);

  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      emit("time", currentTime);
      emit("duration", duration);
      checkQuartile(currentTime, duration);
    },
    [emit, checkQuartile]
  );

  const handleVolumeChange = useCallback(
    (volume: number, muted: boolean) => {
      emit(muted ? "mute" : "unmute");
      emit("volume", muted ? 0 : volume);
    },
    [emit]
  );

  const handleEnded = useCallback(() => {
    emit("end");
    emit("finish");
    onEnded?.();
  }, [emit, onEnded]);

  const activeSource = availableSources[activeSourceIndex];

  if (!currentSrc) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
      <MediaPlayer
        ref={playerRef}
        id={playerId}
        src={currentSrc}
        poster={poster}
        title={title}
        playsInline
        onPlay={handlePlay as any}
        onPause={() => emit("pause") as any}
        onEnded={handleEnded as any}
        onTimeUpdate={(detail: any) => handleTimeUpdate(detail.currentTime, detail.duration)}
        onVolumeChange={(detail: any) => handleVolumeChange(detail.volume, detail.muted)}
        onSeeked={(detail: any) => emit("userseek", detail)}
        onWaiting={() => emit("buffering")}
        onPlaying={() => emit("buffered")}
        onError={() => emit("error", "Video playback error")}
        onLoadedMetadata={() => {
          emit("metadata");
          if (playerRef.current) {
            emit("duration", playerRef.current.duration);
          }
        }}
      >
        <MediaProvider>
          <div slot="poster"></div>
        </MediaProvider>
      </MediaPlayer>

      {availableSources.length > 1 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20">
          <button
            onClick={() => setShowSourceMenu((open) => !open)}
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
    </div>
  );
}
