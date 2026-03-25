"use client";

import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { Globe, Check } from "lucide-react";
import { AudioTrack } from "@/hooks/useAudioTracks";

interface VideoJsPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  onAudioTracksChange?: (tracks: AudioTrack[], activeTrackId: number) => void;
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

export default function VideoJsPlayer({ src, title, poster, onAudioTracksChange }: VideoJsPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrack, setActiveAudioTrack] = useState<number>(0);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!src || !videoRef.current) return;

    const videoElement = document.createElement("video-js");
    videoElement.classList.add("vjs-fill", "vjs-big-play-centered");
    videoRef.current.appendChild(videoElement);

    const player = videojs(videoElement, {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      playbackRates: [0.5, 1, 1.5, 2],
      poster: poster,
      sources: [{
        src: src,
        type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4'
      }]
    }, () => {
      player.src({ src, type: src.includes('.m3u8') ? 'application/x-mpegURL' : 'video/mp4' });
      
      if (player.audioTracks) {
        const trackList = player.audioTracks() as any;
        const tracks: AudioTrack[] = [];
        for (let i = 0; i < trackList.length; i++) {
          const track = trackList[i];
          tracks.push({
            id: i,
            name: track.label || `Track ${i + 1}`,
            lang: track.language,
            default: track.default,
          });
        }
        if (tracks.length > 1) {
          setAudioTracks(tracks);
          for (let i = 0; i < trackList.length; i++) {
            if (trackList[i].enabled) {
              setActiveAudioTrack(i);
              onAudioTracksChange?.(tracks, i);
              break;
            }
          }
        }
      }

      player.on('loadedmetadata', () => {
        if (player.audioTracks) {
          const trackList = player.audioTracks() as any;
          if (trackList.length > 1) {
            const tracks: AudioTrack[] = [];
            for (let i = 0; i < trackList.length; i++) {
              const track = trackList[i];
              tracks.push({
                id: i,
                name: track.label || `Track ${i + 1}`,
                lang: track.language,
                default: track.default,
              });
            }
            setAudioTracks(tracks);
            onAudioTracksChange?.(tracks, trackList.length > 0 ? 0 : -1);
          }
        }
      });
    });

    playerRef.current = player;

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, poster, onAudioTracksChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAudioMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAudioTrackChange = (trackId: number) => {
    if (playerRef.current && playerRef.current.audioTracks) {
      const trackList = playerRef.current.audioTracks() as any;
      for (let i = 0; i < trackList.length; i++) {
        trackList[i].enabled = i === trackId;
      }
      setActiveAudioTrack(trackId);
      onAudioTracksChange?.(audioTracks, trackId);
    }
    setShowAudioMenu(false);
  };

  const activeTrack = audioTracks.find(t => t.id === activeAudioTrack);

  if (!src) {
    return (
      <div className="relative w-full aspect-video bg-[#141414] rounded-2xl border border-[#222] flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Stream Not Available</h3>
          <p className="text-gray-500">This content does not have a stream yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-[#222] bg-black">
      <div data-vjs-player ref={videoRef} className="w-full h-full" />

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
    </div>
  );
}