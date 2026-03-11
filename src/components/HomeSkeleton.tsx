"use client";

import Logo from "./Logo";

export default function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] bg-[#0a0a0a]">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent z-10" />
        
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo size="lg" className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 opacity-40" />
        </div>

        {/* Top gradient for navbar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#141414]/90 to-transparent z-20" />
      </div>

      {/* Content Sections */}
      <div className="relative -mt-32 z-20 px-4 md:px-6 lg:px-8 space-y-12 pb-12">
        
        {/* Featured Row */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-[#e50914]" />
            <div className="w-32 h-6 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/10 rounded-md overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/15" />
              </div>
            ))}
          </div>
        </section>

        {/* Trending Now */}
        <section>
          <div className="w-40 h-6 bg-white/20 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/10 rounded-md overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/15" />
              </div>
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section>
          <div className="w-36 h-6 bg-white/20 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/10 rounded-md overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/15" />
              </div>
            ))}
          </div>
        </section>

        {/* Top Rated */}
        <section>
          <div className="w-44 h-6 bg-white/20 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/10 rounded-md overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/15" />
              </div>
            ))}
          </div>
        </section>

        {/* New Releases */}
        <section>
          <div className="w-48 h-6 bg-white/20 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/10 rounded-md overflow-hidden animate-pulse">
                <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/15" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function LogoSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: 24,
    md: 32,
    lg: 48,
  };
  
  return (
    <div 
      className="animate-pulse rounded-full bg-white/10"
      style={{ width: sizes[size], height: sizes[size] }}
    />
  );
}
