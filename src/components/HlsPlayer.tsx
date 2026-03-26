"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Hls from "hls.js";
import { Volume2, Globe, Check } from "lucide-react";
import { AudioTrack } from "@/hooks/useAudioTracks";
import { PlayerEventData } from "./IframePlayer";

interface HlsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onEnded?: () => void;
  onAudioTracksChange?: (tracks: AudioTrack[], activeTrackId: number) => void;
  onEvent?: (eventData: PlayerEventData) => void;
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

export default function HlsPlayer({ src, title, poster, onEnded, onAudioTracksChange, onEvent }: HlsPlayerProps) {
  const [error, setError] = useState(false);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<number>(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const emitEvent = useCallback((event: string, data?: unknown) => {
    if (onEvent) {
      onEvent({ event, data });
    }
  }, [onEvent]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => emitEvent("play");
    const handlePause = () => emitEvent("pause");
    const handleEnded = () => {
      emitEvent("end");
      onEnded?.();
    };
    const handleTimeUpdate = () => {
      emitEvent("time", video.currentTime);
    };
    const handleVolumeChange = () => {
      emitEvent("volume", video.volume);
    };
    const handleLoadedMetadata = () => {
      emitEvent("metadata");
      emitEvent("duration", video.duration);
    };
    const handleError = () => emitEvent("error", "Video playback error");
    const handleWaiting = () => emitEvent("buffering");
    const handlePlaying = () => emitEvent("buffered");

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("error", handleError);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

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
    };
  }, [emitEvent, onEnded]);

  useEffect(() => {
    setError(false);
    setAudioTracks([]);
    setActiveAudioTrack(0);

    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const video = videoRef.current;
    
    if (Hls.isSupported() && src.includes('.m3u8')) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
        emitEvent("error", data.details || "HLS error");
        if (data.fatal) {
          setError(true);
        }
      });

      return () => {
        hls.destroy();
        hlsRef.current = null;
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl') && src.includes('.m3u8')) {
      video.src = src;
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
          onAudioTracksChange?.(tracks, 0);
        }
      });
    }
  }, [src, onAudioTracksChange, emitEvent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAudioTrackChange = useCallback((trackId: number) => {
    if (hlsRef.current && hlsRef.current.audioTracks) {
      hlsRef.current.audioTrack = trackId;
      setActiveAudioTrack(trackId);
      onAudioTracksChange?.(audioTracks, trackId);
    }
    setShowAudioMenu(false);
  }, [audioTracks, onAudioTracksChange]);

  const activeTrack = audioTracks.find(t => t.id === activeAudioTrack);

  if (!src) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <p className="text-gray-500">No stream available</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black relative">
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
            key={src}
            ref={videoRef}
            src={src}
            poster={poster}
            controls
            playsInline
            preload="auto"
            className="w-full h-full"
            onError={() => setError(true)}
            onEnded={onEnded}
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
        </>
      )}
    </div>
  );
}