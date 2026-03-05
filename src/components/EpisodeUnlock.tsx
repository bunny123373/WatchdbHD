"use client";

import { useState } from "react";
import { Lock, Play, Loader2 } from "lucide-react";
import { showRewardedAd } from "./AdMobBanner";

interface UnlockButtonProps {
  onUnlock: () => void;
  label?: string;
}

export default function EpisodeUnlockButton({ onUnlock, label = "Unlock Episode" }: UnlockButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    const rewarded = await showRewardedAd();
    if (rewarded) {
      onUnlock();
    }
    setLoading(false);
  };

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
      {label}
    </button>
  );
}
