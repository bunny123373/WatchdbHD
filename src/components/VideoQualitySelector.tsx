"use client";

import { useState, useEffect } from "react";
import { Settings, X, Check } from "lucide-react";
import { showRewardedAd } from "./AdMobBanner";

interface Quality {
  label: string;
  url: string;
  height: number;
}

interface VideoQualityProps {
  qualities: Quality[];
  currentUrl?: string;
  onChange: (url: string) => void;
}

export default function VideoQualitySelector({ qualities, currentUrl, onChange }: VideoQualityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const currentQuality = qualities.find(q => q.url === currentUrl) || qualities[0];

  const handleUnlock = async () => {
    const rewarded = await showRewardedAd();
    if (rewarded) {
      setUnlocked(true);
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => unlocked ? setIsOpen(!isOpen) : handleUnlock()}
        className="flex items-center gap-1 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white text-sm rounded transition-colors"
      >
        <Settings className="w-4 h-4" />
        {currentQuality?.label || "HD"}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden min-w-[150px]">
          <div className="p-2 border-b border-[#333]">
            <span className="text-white text-sm font-medium">Video Quality</span>
          </div>
          {qualities.map((quality, index) => (
            <button
              key={index}
              onClick={() => {
                onChange(quality.url);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                currentQuality?.url === quality.url 
                  ? "bg-yellow-500/20 text-yellow-500" 
                  : "text-white hover:bg-[#333]"
              }`}
            >
              <span>{quality.label}</span>
              {currentQuality?.url === quality.url && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
