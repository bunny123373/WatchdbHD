"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Megaphone, Timer } from "lucide-react";

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
        if (adClicked && !isCountingDown) {
          setIsCountingDown(true);
          setCountdown(10);
        } else {
          showAdPopup();
        }
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isMounted, showAdPopup, adClicked, isCountingDown]);

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      handleClose();
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

  const handleClose = () => {
    localStorage.setItem("ad_popup_last_shown", Date.now().toString());
    setIsVisible(false);
    setIsCountingDown(false);
    setAdClicked(false);
    setCountdown(10);
  };

  if (!isMounted) return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90">
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-1 max-w-md w-full shadow-2xl border border-amber-500/30">
        {(!isCountingDown && !adClicked) && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {adClicked && !isCountingDown && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full">
              <Timer className="w-4 h-4 text-amber-500 animate-pulse" />
              <span className="text-sm font-medium text-amber-500">Return to app to unlock</span>
            </div>
          </div>
        )}

        {!adClicked && (
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">Advertisement</span>
            </div>
          </div>
        )}

        <div className="px-4 pb-4">
          {isCountingDown ? (
            <div className="py-8 text-center">
              <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Timer className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Thanks for supporting!</h3>
              <p className="text-amber-400 mb-4">Unlocking in {countdown} seconds...</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 10) * 100}%` }}
                />
              </div>
              <button
                onClick={handleClose}
                className="text-sm text-gray-400 hover:text-white underline"
              >
                Skip wait
              </button>
            </div>
          ) : !adClicked ? (
            <div 
              onClick={handleAdClick}
              className="aspect-video bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-amber-500/20 cursor-pointer"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Megaphone className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">WatchDB HD</h3>
                <p className="text-amber-400 text-sm">Click to support us!</p>
                <p className="text-gray-400 text-xs mt-2">Ad appears every hour</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-amber-500/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Megaphone className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Check out the ad!</h3>
                <p className="text-amber-400 text-sm">Return to app when done</p>
              </div>
            </div>
          )}
        </div>

        {!adClicked && (
          <div className="px-4 pb-4 text-center">
            <p className="text-xs text-gray-500">
              Click ad → return to app → wait 10 sec → unlock
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
