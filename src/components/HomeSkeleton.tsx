"use client";

import Logo from "./Logo";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="relative">
          <Logo size="lg" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
        <span className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider animate-pulse">
          WatchDB
        </span>
        <div className="mt-6 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
