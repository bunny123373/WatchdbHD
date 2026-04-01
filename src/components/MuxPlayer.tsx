"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayerReact from "@mux/mux-player-react";
import "@mux/mux-player/themes/classic";
import type MuxPlayerElement from "@mux/mux-player";
import { ParsedSource } from "@/utils/url";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";

export interface MuxPlayerProps {
  src?: string;
  playbackId?: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
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

export default function MuxPlayer({
  src,
  playbackId,
  title,
  poster,
  autoplay,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  playerId = "mux-player",
}: MuxPlayerProps) {
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastQuartileRef = useRef<number>(0);
  const playerRef = useRef<typeof MuxPlayerElement.prototype>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const availableSources = sources || [];
  const currentSrc =
    availableSources.length > 0 ? availableSources[activeSourceIndex]?.url || src : src;

  const usePlaybackId = !!playbackId;

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

  useEffect(() => {
    const handleOrientationChange = () => {
      if (playerContainerRef.current) {
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isLandscape = window.innerWidth > window.innerHeight;
        if (isMobile && isLandscape && !document.fullscreenElement) {
          playerContainerRef.current.requestFullscreen?.();
        } else if (isMobile && !isLandscape && document.fullscreenElement && document.fullscreenElement === playerContainerRef.current) {
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

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handlePlayEvent = () => handlePlay();
    const handlePauseEvent = () => emit("pause");
    const handleEndedEvent = () => handleEnded();
    const handleTimeUpdateEvent = () => handleTimeUpdate(player.currentTime, player.duration);
    const handleVolumeChangeEvent = () => handleVolumeChange(player.volume, player.muted);
    const handleSeekedEvent = () => emit("userseek", player.currentTime);
    const handleWaitingEvent = () => emit("buffering");
    const handlePlayingEvent = () => emit("buffered");
    const handleErrorEvent = () => emit("error", "Video playback error");
    const handleLoadedMetadataEvent = () => {
      emit("metadata");
      emit("duration", player.duration);
    };

    player.addEventListener("play", handlePlayEvent);
    player.addEventListener("pause", handlePauseEvent);
    player.addEventListener("ended", handleEndedEvent);
    player.addEventListener("timeupdate", handleTimeUpdateEvent);
    player.addEventListener("volumechange", handleVolumeChangeEvent);
    player.addEventListener("seeked", handleSeekedEvent);
    player.addEventListener("waiting", handleWaitingEvent);
    player.addEventListener("playing", handlePlayingEvent);
    player.addEventListener("error", handleErrorEvent);
    player.addEventListener("loadedmetadata", handleLoadedMetadataEvent);

    return () => {
      player.removeEventListener("play", handlePlayEvent);
      player.removeEventListener("pause", handlePauseEvent);
      player.removeEventListener("ended", handleEndedEvent);
      player.removeEventListener("timeupdate", handleTimeUpdateEvent);
      player.removeEventListener("volumechange", handleVolumeChangeEvent);
      player.removeEventListener("seeked", handleSeekedEvent);
      player.removeEventListener("waiting", handleWaitingEvent);
      player.removeEventListener("playing", handlePlayingEvent);
      player.removeEventListener("error", handleErrorEvent);
      player.removeEventListener("loadedmetadata", handleLoadedMetadataEvent);
    };
  }, [handlePlay, handleEnded, handleTimeUpdate, handleVolumeChange, emit]);

  const activeSource = availableSources[activeSourceIndex];

  if (!currentSrc && !usePlaybackId) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div ref={playerContainerRef} className="relative w-full bg-black" style={{ aspectRatio: "16 / 9" }}>
      <MuxPlayerReact
        ref={playerRef as any}
        src={currentSrc || undefined}
        playbackId={playbackId}
        poster={poster}
        title={title}
        metadataVideoTitle={title}
        metadataViewerUserId={playerId}
        playsInline
        autoPlay={autoplay}
        theme="classic"
        style={{ width: "100%", height: "100%" }}
      />

      {availableSources.length > 1 && !usePlaybackId && (
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
