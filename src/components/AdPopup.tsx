"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Megaphone, Unlock, Play, CheckCircle } from "lucide-react";

interface MegaphonePopupProps {
  adUrl?: string;
  showInterval?: number;
}

export default function MegaphonePopup({ 
  adUrl = "https://omg10.com/4/10665900",
  showInterval = 60 * 60 * 1000
}: MegaphonePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [adClicked, setAdClicked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showAdPopup = useCallback(() => {
    if (!isMounted) return;
    
    const lastShown = localStorage.getItem("ad_popup_last_shown");
    const now = Date.now();
    
    if (!lastShown || (now - parseInt(lastShown)) > showInterval) {
      setIsVisible(true);
    }
  }, [isMounted, showInterval]);

  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setTimeout(() => {
      showAdPopup();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isMounted, showAdPopup]);

  useEffect(() => {
    if (!isMounted) return;
    
    const handleVisibility = () => {
      if (!document.hidden) {
        if (adClicked && !isCountingDown && !isVerified) {
          setIsCountingDown(true);
          setCountdown(10);
        } else if (!isVerified) {
          showAdPopup();
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isMounted, showAdPopup, adClicked, isCountingDown, isVerified]);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setIsVerified(true);
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [isCountingDown, countdown]);

  const handleAdClick = () => {
    window.open(adUrl, "_blank");
    setAdClicked(true);
  };

  const handleUnlock = () => {
    localStorage.setItem("ad_popup_last_shown", Date.now().toString());
    setIsVisible(false);
    setIsCountingDown(false);
    setAdClicked(false);
    setIsVerified(false);
    setCountdown(10);
  };

  if (!isMounted) return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isVerified ? (
          <div className="text-center py-12 px-6">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
            <p className="text-green-400 mb-8">Ad watched successfully</p>
            <button
              onClick={handleUnlock}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-8 py-3 rounded-full text-lg transition-colors w-full justify-center"
            >
              <Unlock className="w-5 h-5" />
              Unlock & Watch Movies
            </button>
          </div>
        ) : isCountingDown ? (
          <div className="text-center py-12 px-6">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl font-bold text-amber-500">{countdown}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying...</h2>
            <p className="text-amber-400 mb-4">Please wait while we verify your ad</p>
            <p className="text-gray-500 text-sm">Return to app after watching the ad</p>
          </div>
        ) : !adClicked ? (
          <div className="text-center py-12 px-6">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-2xl font-bold text-white">WatchDB HD</span>
            </div>
            
            <p className="text-gray-400 mb-8">Watch a short ad to unlock movies</p>
            
            <button
              onClick={handleAdClick}
              className="inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-4 rounded-full text-lg transition-colors w-full justify-center"
            >
              <Megaphone className="w-5 h-5" />
              Click to Watch Ad
            </button>
            
            <p className="text-gray-500 text-sm mt-4">Ad appears every hour</p>
          </div>
        ) : (
          <div className="text-center py-12 px-6">
            <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Megaphone className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Watch the Ad</h2>
            <p className="text-amber-400 mb-4">The ad is now open in a new tab</p>
            <p className="text-gray-500 text-sm">Return to this app after watching</p>
          </div>
        )}
      </div>
    </div>
  );
}
