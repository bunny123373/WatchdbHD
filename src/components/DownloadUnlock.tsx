"use client";

import { useState } from "react";
import { Lock, Download, Loader2 } from "lucide-react";
import { showRewardedAd } from "./AdMobBanner";

interface DownloadUnlockButtonProps {
  downloadUrl: string;
  quality?: string;
}

export default function DownloadUnlockButton({ downloadUrl, quality = "HD" }: DownloadUnlockButtonProps) {
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    const rewarded = await showRewardedAd();
    if (rewarded) {
      setUnlocked(true);
      window.open(downloadUrl, "_blank");
    }
    setLoading(false);
  };

  if (unlocked) {
    return (
      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
      >
        <Download className="w-4 h-4" />
        Download Now
      </a>
    );
  }

  return (
    <button
      onClick={handleUnlock}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold rounded-lg transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Lock className="w-4 h-4" />
      )}
      Unlock Download
    </button>
  );
}
