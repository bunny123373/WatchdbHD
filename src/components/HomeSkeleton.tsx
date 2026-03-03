"use client";

export default function HomeSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] bg-[#1f1f1f]" />

      {/* Genre Filter Skeleton */}
      <div className="lg:hidden px-4 py-3">
        <div className="flex gap-2 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-16 h-8 bg-white/10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Content Grid Skeleton */}
      <div className="py-4 px-4 md:px-6 lg:px-8">
        {/* Section Title Skeleton */}
        <div className="w-32 h-6 bg-white/10 rounded mb-4" />

        {/* Grid Skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      {/* More Sections */}
      <div className="py-4 px-4 md:px-6 lg:px-8">
        <div className="w-32 h-6 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="py-4 px-4 md:px-6 lg:px-8">
        <div className="w-32 h-6 bg-white/10 rounded mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-3">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
