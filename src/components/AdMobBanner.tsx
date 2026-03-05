"use client";

import { useEffect } from "react";

const AD_UNIT_ID = "ca-app-pub-8628683007968578/1234567890";

export default function AdMobBanner({ 
  size = "ADAPTIVE_BANNER",
}: { 
  size?: "LARGE_BANNER" | "MEDIUM_RECTANGLE" | "FULL_BANNER" | "LEADERBOARD" | "ADAPTIVE_BANNER";
}) {
  useEffect(() => {
    const initAdMob = async () => {
      try {
        const { AdMob } = await import("@capacitor-community/admob");
        await AdMob.initialize();
      } catch (error) {
        console.log("AdMob init error:", error);
      }
    };

    initAdMob();
  }, []);

  return null;
}

export async function showRewardedAd(): Promise<boolean> {
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize();
    await AdMob.prepareRewardVideoAd({ adId: AD_UNIT_ID });
    return true;
  } catch (error) {
    console.log("Rewarded ad error:", error);
    return false;
  }
}

export async function showInterstitialAd(): Promise<void> {
  try {
    const { AdMob } = await import("@capacitor-community/admob");
    await AdMob.initialize();
    await AdMob.prepareInterstitial({ adId: AD_UNIT_ID });
  } catch (error) {
    console.log("Interstitial ad error:", error);
  }
}
