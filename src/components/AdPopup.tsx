"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Megaphone, Unlock, Play } from "lucide-react";

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90">
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-1 max-w-sm w-full shadow-2xl border border-amber-500/30">
        {(!isCountingDown && !canUnlock) && (
          <button
            onClick={() => {
              localStorage.setItem("ad_popup_last_shown", Date.now().toString());
              setIsVisible(false);
            }}
            className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="bg-[#1f1f1f] rounded-xl p-4 sm:p-6">
          {adClicked && !isCountingDown && !canUnlock && (
            <div className="flex items-center justify-center gap-2 py-2 mb-4 bg-amber-500/20 rounded-full">
              <span className="text-sm font-medium text-amber-500">Return to app to unlock</span>
            </div>
          )}

          {canUnlock ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Unlock className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ready to Unlock!</h3>
              <p className="text-green-400 text-sm mb-4">Click to continue watching</p>
              <button
                onClick={handleUnlock}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
              >
                <Unlock className="w-4 h-4" />
                Unlock Now
              </button>
            </div>
          ) : isCountingDown ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-amber-500">{countdown}</span>
              </div>
              <p className="text-amber-400 text-sm">seconds to unlock</p>
            </div>
          ) : !adClicked ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-white font-bold text-lg">WatchDB HD</span>
                <span className="text-amber-500 text-xs">• Ad</span>
              </div>
              
              <div 
                onClick={handleAdClick}
                className="bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl p-6 cursor-pointer border border-amber-500/20"
              >
                <Megaphone className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Click to support us!</h3>
                <p className="text-gray-400 text-xs">Ad appears every hour</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Megaphone className="w-10 h-10 text-amber-500 mx-auto mb-2 animate-pulse" />
              <h3 className="text-white font-semibold mb-1">Check out the ad!</h3>
              <p className="text-gray-400 text-sm">Return to app when done</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
