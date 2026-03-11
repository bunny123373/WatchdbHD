"use client";

import Logo from "./Logo";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Logo size="lg" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32" />
        <span className="mt-4 text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wider">
          WatchDB
        </span>
      </div>
    </div>
  );
}
