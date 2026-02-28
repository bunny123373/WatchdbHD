"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Megaphone, Unlock, Play } from "lucide-react";

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
  const [canUnlock, setCanUnlock] = useState(false);
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
        if (adClicked && !isCountingDown && !canUnlock) {
          setIsCountingDown(true);
          setCountdown(10);
        } else if (canUnlock) {
        } else {
          showAdPopup();
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isMounted, showAdPopup, adClicked, isCountingDown, canUnlock]);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setCanUnlock(true);
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
    setCanUnlock(false);
    setCountdown(10);
  };

  if (!isMounted) return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999]">
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] shadow-lg border-b border-amber-500/30">
        {adClicked && !isCountingDown && !canUnlock && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500/20">
            <span className="text-sm font-medium text-amber-500">Return to app to unlock</span>
          </div>
        )}

        {!adClicked && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-white font-bold">WatchDB HD</span>
              <span className="text-amber-500 text-xs ml-1">• Ad</span>
            </div>

            {canUnlock ? (
              <button
                onClick={handleUnlock}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
              >
                <Unlock className="w-4 h-4" />
                Unlock
              </button>
            ) : isCountingDown ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-amber-500">{countdown}</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleAdClick}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
              >
                <Megaphone className="w-4 h-4" />
                Click Ad
              </button>
            )}
          </div>
        )}

        {adClicked && !isCountingDown && !canUnlock && (
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            <button
              onClick={handleAdClick}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              Check Ad
            </button>
          </div>
        )}

        {canUnlock && (
          <div className="flex items-center justify-center gap-3 px-4 py-2">
            <span className="text-green-400 font-medium">Ready to unlock!</span>
            <button
              onClick={handleUnlock}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-4 py-2 rounded-full text-sm transition-colors"
            >
              <Unlock className="w-4 h-4" />
              Unlock Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
