"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import { Volume2, Globe, Check, Languages } from "lucide-react";
import { AudioTrack } from "@/hooks/useAudioTracks";
import { ParsedSource } from "@/utils/url";

export type PlayerEventCallback = (event: string, data?: unknown, id?: string) => void;

export type PlayerEventName =
  | "init" | "start" | "play" | "userplay" | "pause" | "userpause" | "stop" | "end" | "finish"
  | "metadata" | "new" | "time" | "quartile" | "duration" | "seek" | "userseek"
  | "mute" | "unmute" | "volume"
  | "quality" | "audiotrack" | "subtitle" | "speed"
  | "fullscreen" | "exitfullscreen"
  | "buffering" | "buffered"
  | "loaderror" | "error"
  | "fragment" | "height" | "playlist" | "download" | "visibility" | "resize"
  | "geo" | "casted" | "uncasted" | "ui" | "click" | "line" | "next" | "previous";

export interface PlayerjsEvents {
  init?: () => void;
  start?: () => void;
  play?: () => void;
  pause?: () => void;
  end?: () => void;
  finish?: () => void;
  time?: (currentTime: number) => void;
  duration?: (duration: number) => void;
  volume?: (volume: number) => void;
  buffering?: () => void;
  buffered?: () => void;
  error?: (error: string) => void;
  loaderror?: (error: string) => void;
  audiotrack?: (trackName: string) => void;
  quality?: (qualityName: string) => void;
  source?: (sourceName: string) => void;
  mute?: () => void;
  unmute?: () => void;
  seek?: (time: number) => void;
  userseek?: (time: number) => void;
  quartile?: (percent: string) => void;
  metadata?: () => void;
  new?: () => void;
  stop?: () => void;
  fullscreen?: () => void;
  exitfullscreen?: () => void;
  fragment?: (filename: string) => void;
  resize?: (dimensions: { width: number; height: number }) => void;
  download?: () => void;
  click?: () => void;
}

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onAudioTracksChange?: (tracks: AudioTrack[], activeTrackId: number) => void;
  onEvent?: PlayerEventCallback;
  onPlayerjsEvents?: PlayerjsEvents;
  sources?: ParsedSource[];
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

export default function HlsPlayer({
  src,
  title,
  poster,
  onEnded,
  onAudioTracksChange,
  onEvent,
  onPlayerjsEvents,
  sources,
  playerId = "hls-player"
}: HlsPlayerProps) {
  const [error, setError] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<number>(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>("auto");
  const lastQuartileRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sourceMenuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSrc = sources && sources.length > 0 ? sources[activeSourceIndex]?.url || src : src;
  const availableSources = sources || [];

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

  const checkQuartile = useCallback((currentTime: number, duration: number) => {
    if (!duration) return;
    const percent = (currentTime / duration) * 100;
    const quartiles = [25, 50, 75, 100];
    for (const quartile of quartiles) {
      if (percent >= quartile && lastQuartileRef.current < quartile) {
        lastQuartileRef.current = quartile;
        emit("quartile", `${quartile}%`);
      }
    }
  }, [emit]);

  useEffect(() => {
    emit("init");
    setIsInitialized(true);
    return () => {
      emit("stop");
    };
  }, [emit]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (!hasStarted) {
        emit("start");
        setHasStarted(true);
      }
      emit("play");
    };
    const handlePause = () => emit("pause");
    const handleEnded = () => {
      emit("end");
      emit("finish");
      onEnded?.();
    };
    const handleTimeUpdate = () => {
      emit("time", video.currentTime);
      emit("duration", video.duration);
      checkQuartile(video.currentTime, video.duration);
    };
    const handleVolumeChange = () => {
      const muted = video.muted || video.volume === 0;
      if (muted !== isMuted) {
        setIsMuted(muted);
        emit(muted ? "mute" : "unmute");
      }
      emit("volume", video.muted ? 0 : video.volume);
    };
    const handleLoadedMetadata = () => {
      emit("metadata");
      emit("duration", video.duration);
    };
    const handleWaiting = () => emit("buffering");
    const handlePlaying = () => emit("buffered");
    const handleSeeking = () => emit("seek", video.currentTime);
    const handleSeeked = () => emit("userseek", video.currentTime);
    const handleError = () => emit("error", "Video playback error");
    const handleEmptied = () => emit("new");

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("emptied", handleEmptied);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("error", handleError);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("emptied", handleEmptied);
    };
  }, [emit, onEnded, hasStarted, isMuted, checkQuartile]);

  useEffect(() => {
    setError(false);
    setAudioTracks([]);
    setActiveAudioTrack(0);
    setHasStarted(false);
    lastQuartileRef.current = 0;
    emit("new");

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [currentSrc, emit]);

  useEffect(() => {
    if (!currentSrc || !videoRef.current) return;

    const video = videoRef.current;
    
    if (Hls.isSupported() && currentSrc.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(currentSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels.map((level, index) => ({
          height: level.height,
          bitrate: level.bitrate,
          index,
        }));
        if (levels.length > 0) {
          emit("quality", `${levels[0].height}p`);
        }

        if (hls.audioTracks && hls.audioTracks.length > 1) {
          const tracks: AudioTrack[] = hls.audioTracks.map((track, index) => ({
            id: index,
            name: track.name || `Track ${index + 1}`,
            lang: track.lang,
            url: track.url,
            default: track.default,
          }));
          setAudioTracks(tracks);
          setActiveAudioTrack(hls.audioTrack);
          const activeTrack = tracks[hls.audioTrack];
          if (activeTrack) emit("audiotrack", activeTrack.name);
          onAudioTracksChange?.(tracks, hls.audioTrack);
        }
      });

      hls.on(Hls.Events.AUDIO_TRACK_LOADED, () => {
        if (hls.audioTracks) {
          const tracks: AudioTrack[] = hls.audioTracks.map((track, index) => ({
            id: index,
            name: track.name || `Track ${index + 1}`,
            lang: track.lang,
            url: track.url,
            default: track.default,
          }));
          setAudioTracks(tracks);
          onAudioTracksChange?.(tracks, hls.audioTrack);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        emit("error", data.details || "HLS error");
        if (data.fatal) {
          emit("loaderror", data.details);
          setError(true);
        }
      });

      hls.on(Hls.Events.FRAG_LOADED, (_, data) => {
        if (data.frag) {
          emit("fragment", data.frag.relurl);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && currentSrc.includes('.m3u8')) {
      video.src = currentSrc;
      video.addEventListener('loadedmetadata', () => {
        const audioTrackList = (video as any).audioTracks;
        if (audioTrackList && audioTrackList.length > 1) {
          const tracks: AudioTrack[] = Array.from(audioTrackList).map((track: any, index: number) => ({
            id: index,
            name: track.label || `Track ${index + 1}`,
            lang: track.language,
            default: track.default,
          }));
          setAudioTracks(tracks);
          const activeTrack = tracks.find((t: AudioTrack) => t.default) || tracks[0];
          if (activeTrack) emit("audiotrack", activeTrack.name);
          onAudioTracksChange?.(tracks, 0);
        }
      });
    }
  }, [currentSrc, onAudioTracksChange, emit]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (document.fullscreenElement) {
        emit("fullscreen");
      } else {
        emit("exitfullscreen");
      }
    };

    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        emit("resize", { width, height });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [emit]);

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
    if (hlsRef.current && hlsRef.current.audioTracks) {
      hlsRef.current.audioTrack = trackId;
      setActiveAudioTrack(trackId);
      const track = audioTracks[trackId];
      if (track) emit("audiotrack", track.name);
      onAudioTracksChange?.(audioTracks, trackId);
    }
    setShowAudioMenu(false);
  }, [audioTracks, onAudioTracksChange, emit]);

  const activeTrack = audioTracks.find(t => t.id === activeAudioTrack);
  const activeSource = availableSources[activeSourceIndex];

  const handleSourceChange = useCallback((index: number) => {
    setActiveSourceIndex(index);
    setShowSourceMenu(false);
    setActiveAudioTrack(0);
    setAudioTracks([]);
    if (availableSources[index]) {
      emit("source", availableSources[index].name);
    }
  }, [availableSources, emit]);

  const handleDownload = useCallback(() => {
    emit("download");
  }, [emit]);

  if (!currentSrc) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full aspect-video bg-black relative">
      {error ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-3">Failed to load video</p>
            <button
              onClick={() => {
                setError(false);
                if (videoRef.current) videoRef.current.load();
              }}
              className="px-4 py-2 bg-white/10 text-white text-sm rounded hover:bg-white/20"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            id={playerId}
            key={currentSrc}
            ref={videoRef}
            src={currentSrc}
            poster={poster}
            controls
            playsInline
            preload="auto"
            className="w-full h-full"
            onError={() => setError(true)}
            onEnded={onEnded}
            onClick={() => emit("click")}
          >
            Your browser does not support the video tag.
          </video>

          {audioTracks.length > 1 && (
            <div className="absolute top-4 right-4 z-10" ref={menuRef}>
              <button
                onClick={() => setShowAudioMenu(!showAudioMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-sm rounded transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{activeTrack?.name || "Audio"}</span>
              </button>

              {showAudioMenu && (
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[180px]">
                  <div className="p-2 border-b border-[#333]">
                    <span className="text-white text-xs font-medium">Audio Tracks</span>
                  </div>
                  {audioTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleAudioTrackChange(track.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                        activeAudioTrack === track.id
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "text-white hover:bg-[#333]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{getLanguageFlag(track.lang)}</span>
                        <span>{track.name}</span>
                      </div>
                      {activeAudioTrack === track.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {availableSources.length > 1 && (
            <div className="absolute top-4 left-4 z-10" ref={sourceMenuRef}>
              <button
                onClick={() => setShowSourceMenu(!showSourceMenu)}
                className="flex items-center gap-2 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white text-sm rounded transition-colors"
              >
                <Languages className="w-4 h-4" />
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
                      <div className="flex items-center gap-2">
                        {getLanguageFlag(source.name)}
                        <span>{source.name}</span>
                        {source.quality && (
                          <span className="text-xs text-white/50">({source.quality})</span>
                        )}
                      </div>
                      {activeSourceIndex === index && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}