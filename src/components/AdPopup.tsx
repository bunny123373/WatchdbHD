"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Megaphone } from "lucide-react";

interface MegaphonePopupProps {
  adUrl?: string;
  showInterval?: number; // in milliseconds (default: 1 hour)
}

export default function MegaphonePopup({ 
  adUrl = "https://omg10.com/4/10665900",
  showInterval = 60 * 60 * 1000 // 1 hour default
}: MegaphonePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showMegaphone = useCallback(() => {
    if (!isMounted) return;
    
    // Check if ad was shown in last hour
    const lastShown = localStorage.getItem("ad_popup_last_shown");
    const now = Date.now();
    
    if (!lastShown || (now - parseInt(lastShown)) > showInterval) {
      setIsVisible(true);
      localStorage.setItem("ad_popup_last_shown", now.toString());
    }
  }, [isMounted, showInterval]);

  // Try to show ad after 5 seconds (to not annoy on first load)
  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setTimeout(() => {
      showMegaphone();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isMounted, showMegaphone]);

  // Also try on page visibility change (when user returns to app)
  useEffect(() => {
    if (!isMounted) return;
    
    const handleVisibility = () => {
      if (!document.hidden) {
        showMegaphone();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isMounted, showMegaphone]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleMegaphoneClick = () => {
    // Open ad in new tab
    window.open(adUrl, "_blank");
  };

  // Don't render on server
  if (!isMounted) return null;
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/90">
      <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-1 max-w-md w-full shadow-2xl border border-amber-500/30">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Megaphone Content */}
        <div 
          onClick={handleMegaphoneClick}
          className="cursor-pointer"
        >
          {/* Megaphone Header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div className="flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">Megaphonevertisement</span>
            </div>
          </div>

          {/* Megaphone Image/Content */}
          <div className="px-4 pb-4">
            <div className="aspect-video bg-gradient-to-br from-amber-600/20 to-orange-600/20 rounded-xl flex items-center justify-center border border-amber-500/20">
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Megaphone className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">WatchDB HD</h3>
                <p className="text-amber-400 text-sm">Click to support us!</p>
                <p className="text-gray-400 text-xs mt-2">Megaphone appears every hour</p>
              </div>
            </div>
          </div>

          {/* Skip Info */}
          <div className="px-4 pb-4 text-center">
            <p className="text-xs text-gray-500">
              Next ad in 1 hour • Click to open in new tab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
