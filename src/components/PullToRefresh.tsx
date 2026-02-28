"use client";

import { useState, useEffect, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => void;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);

  useEffect(() => {
    let ticking = false;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        ticking = false;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (window.scrollY === 0 && !isRefreshing) {
        const currentY = e.touches[0].clientY;
        pullDistance.current = currentY - startY.current;
        
        if (pullDistance.current > 0 && pullDistance.current < 150) {
          if (!ticking) {
            requestAnimationFrame(() => {
              setIsPulling(pullDistance.current > 50);
              ticking = true;
            });
          }
        }
      }
    };

    const onTouchEnd = async () => {
      if (pullDistance.current > 80 && !isRefreshing) {
        setIsRefreshing(true);
        await onRefresh();
        setTimeout(() => {
          setIsRefreshing(false);
          setIsPulling(false);
        }, 500);
      }
      pullDistance.current = 0;
      setIsPulling(false);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, isRefreshing]);

  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 ${
          isPulling ? "opacity-80" : ""
        }`}
        style={{
          transform: isPulling ? `translateY(${Math.min(pullDistance.current * 0.5, 60)}px)` : "translateY(0)",
        }}
      >
        {children}
      </div>
      
      {isPulling && !isRefreshing && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full shadow-lg">
          <RefreshCw className="w-4 h-4 text-white animate-pulse" />
          <span className="text-white text-sm">Pull to refresh</span>
        </div>
      )}
      
      {isRefreshing && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-full shadow-lg">
          <RefreshCw className="w-4 h-4 text-white animate-spin" />
          <span className="text-white text-sm">Refreshing...</span>
        </div>
      )}
    </div>
  );
}
