"use client";

import { useState } from "react";
import { Volume2, Globe, ChevronDown, Check } from "lucide-react";
import { AudioTrack } from "@/hooks/useAudioTracks";

interface AudioTrackSelectorProps {
  tracks: AudioTrack[];
  activeTrackId: number;
  onTrackChange: (trackId: number) => void;
  variant?: "inline" | "dropdown";
  showLabel?: boolean;
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

export default function AudioTrackSelector({
  tracks,
  activeTrackId,
  onTrackChange,
  variant = "dropdown",
  showLabel = true,
}: AudioTrackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (tracks.length <= 1) {
    return null;
  }

  const activeTrack = tracks.find((t) => t.id === activeTrackId);

  if (variant === "inline") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {showLabel && (
          <span className="text-white/50 text-sm flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            Audio:
          </span>
        )}
        {tracks.map((track) => (
          <button
            key={track.id}
            onClick={() => onTrackChange(track.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors flex items-center gap-1.5 ${
              activeTrackId === track.id
                ? "bg-[#e50914] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <span>{getLanguageFlag(track.lang)}</span>
            <span>{track.name}</span>
            {activeTrackId === track.id && <Check className="w-3.5 h-3.5" />}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-sm rounded transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>Audio: {activeTrack?.name || "Select"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[200px] z-50">
          <div className="p-2 border-b border-[#333]">
            <span className="text-white text-sm font-medium">Audio Tracks</span>
          </div>
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => {
                onTrackChange(track.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                activeTrackId === track.id
                  ? "bg-yellow-500/20 text-yellow-500"
                  : "text-white hover:bg-[#333]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{getLanguageFlag(track.lang)}</span>
                <span>{track.name}</span>
                {track.lang && (
                  <span className="text-xs text-white/40 uppercase">({track.lang})</span>
                )}
              </div>
              {activeTrackId === track.id && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}