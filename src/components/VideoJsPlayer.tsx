"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Globe, Check } from "lucide-react";
import { PlayerEventCallback, PlayerjsEvents } from "./HlsPlayer";
import { VideoSource, VideoTrack } from "./HlsPlayer";
import { ParsedSource } from "@/utils/url";
import { AudioTrack } from "@/hooks/useAudioTracks";

export interface VideoJsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
  videoSources?: VideoSource[];
  tracks?: VideoTrack[];
  playerId?: string;
}

const languageFlags: Record<string, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  hi: "🇮🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
  ta: "🇮🇳",
  te: "🇮🇳",
  default: "🌐",
};

function getLanguageFlag(lang?: string): string {
  if (!lang) return languageFlags.default;
  const langCode = lang.toLowerCase().slice(0, 2);
  return languageFlags[langCode] || languageFlags.default;
}

export default function VideoJsPlayer({
  src,
  title,
  poster,
  onEnded,
  onEvent,
  onPlayerjsEvents,
  sources,
  videoSources,
  tracks,
  playerId = "videojs-player"
}: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<number>(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);

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
    if (!currentSrc || !videoRef.current) return;

    if (playerRef.current) {
      playerRef.current.dispose();
      playerRef.current = null;
    }

    const videoElement = document.createElement("video");
    videoElement.classList.add("video-js", "vjs-big-play-centered", "vjs-fluid");
    videoElement.id = playerId;
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      preload: "auto",
      playbackRates: [0.5, 1, 1.5, 2],
      poster: poster,
      sources: [{
        src: currentSrc,
        type: currentSrc.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }],
      html5: {
        vhs: {
          overrideNative: true
        }
      }
    }, function() {
      emit("init");
      setIsReady(true);
    });

    player.on('play', () => emit("play"));
    player.on('pause', () => emit("pause"));
    player.on('ended', () => { emit("end"); emit("finish"); onEnded?.(); });
    player.on('timeupdate', () => { emit("time", player.currentTime()); emit("duration", player.duration()); });
    player.on('volumechange', () => { emit("volume", player.volume()); emit(player.muted() ? "mute" : "unmute"); });
    player.on('waiting', () => emit("buffering"));
    player.on('playing', () => emit("buffered"));
    player.on('error', () => { emit("error", "Video error"); });
    player.on('loadedmetadata', () => { emit("metadata"); emit("duration", player.duration()); });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [currentSrc, poster, emit, onEnded, playerId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
      }
      if (sourceMenuRef.current && !sourceMenuRef.current.contains(event.target as Node)) {
        setShowSourceMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAudioTrackChange = useCallback((trackId: number) => {
    if (playerRef.current && playerRef.current.audioTracks) {
      const trackList = playerRef.current.audioTracks() as any;
      for (let i = 0; i < trackList.length; i++) {
        trackList[i].enabled = i === trackId;
      }
      setActiveAudioTrack(trackId);
      emit("audiotrack", audioTracks[trackId]?.name);
    }
    setShowAudioMenu(false);
  }, [audioTracks, emit]);

  const handleSourceChange = useCallback((index: number) => {
    setActiveSourceIndex(index);
    setShowSourceMenu(false);
    emit("source", availableSources[index]?.name);
  }, [availableSources, emit]);

  const activeTrack = audioTracks.find(t => t.id === activeAudioTrack);
  const activeSource = availableSources[activeSourceIndex];

  if (!currentSrc) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
      <div ref={videoRef} className="w-full h-full" />

      {audioTracks.length > 1 && (
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20" ref={menuRef}>
          <button
            onClick={() => setShowAudioMenu(!showAudioMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-black/70 hover:bg-black/90 text-white text-xs sm:text-sm font-medium rounded-md transition-colors backdrop-blur-sm"
          >
            <Globe className="w-4 h-4" />
            <span>{activeTrack?.name || "Audio"}</span>
          </button>

          {showAudioMenu && (
            <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[160px] sm:min-w-[180px]">
              <div className="p-2 border-b border-[#333]">
                <span className="text-white text-xs sm:text-sm font-medium">Audio Tracks</span>
              </div>
              {audioTracks.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleAudioTrackChange(track.id)}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition-colors ${
                    activeAudioTrack === track.id
                      ? "bg-red-600/20 text-red-400"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{getLanguageFlag(track.lang)}</span>
                    <span>{track.name}</span>
                  </div>
                  {activeAudioTrack === track.id && <Check className="w-4 h-4 text-red-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {availableSources.length > 1 && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20" ref={sourceMenuRef}>
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
                  {activeSourceIndex === index && <Check className="w-4 h-4 text-red-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        :global(.video-js) {
          width: 100%;
          height: 100%;
          background-color: #000;
        }
        :global(.video-js .vjs-big-play-button) {
          background-color: rgba(229, 9, 20, 0.8);
          border: none;
          border-radius: 50%;
          width: 70px;
          height: 70px;
          line-height: 70px;
          font-size: 35px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
        }
        :global(.video-js .vjs-big-play-button:hover) {
          background-color: rgba(229, 9, 20, 1);
        }
        :global(.video-js .vjs-control-bar) {
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        }
        :global(.video-js .vjs-play-progress),
        :global(.video-js .vjs-volume-level) {
          background-color: #e50914;
        }
        :global(.video-js .vjs-slider:focus) {
          box-shadow: none;
        }
        :global(.vjs-loading-spinner) {
          border: 4px solid rgba(229, 9, 20, 0.3);
          border-top-color: #e50914;
        }
        @media (max-width: 640px) {
          :global(.video-js .vjs-big-play-button) {
            width: 55px;
            height: 55px;
            font-size: 28px;
          }
          :global(.video-js .vjs-control-bar) {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
