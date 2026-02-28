"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Info, Plus } from "lucide-react";
import { IContent } from "@/models/Content";

interface HeroBannerProps {
  content: IContent;
  onContentClick?: (content: IContent) => void;
}

export default function HeroBanner({ content, onContentClick }: HeroBannerProps) {
  if (!content) return null;

  const isMovie = content.type === "movie";
  const watchLink = isMovie ? `/watch/${content._id}` : `/series/watch/${content._id}`;
  const detailLink = isMovie ? `/movie/${content._id}` : `/series/${content._id}`;
  
  const getBannerUrl = (url: string) => {
    if (!url) return url;
    if (url.includes("tmdb.org/t/p/")) {
      return url.replace("/w780/", "/original/").replace("/w1280/", "/original/");
    }
    return url;
  };
  
  const bannerImage = getBannerUrl(content.banner || content.poster);

  return (
    <div className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={bannerImage}
          alt={content.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/20 to-[#141414]" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-xl lg:max-w-2xl space-y-4 sm:space-y-5">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl leading-tight">
            {content.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            {content.rating && (
              <span className="text-green-400 font-bold">{content.rating}% Match</span>
            )}
            {content.year && (
              <span className="text-white/80">{content.year}</span>
            )}
            {content.quality && (
              <span className="text-white font-bold bg-red-600 px-2 py-0.5 text-xs rounded">
                {content.quality}
              </span>
            )}
            <span className="text-white/80">{content.language}</span>
            <span className="px-2 py-0.5 bg-white/20 text-white/80 text-xs rounded">
              {isMovie ? "Movie" : "TV Show"}
            </span>
          </div>

          {/* Description */}
          {content.description && (
            <p className="text-white/90 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 max-w-lg">
              {content.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href={watchLink}>
              <button className="bg-white text-black hover:bg-gray-200 rounded-lg px-6 sm:px-8 py-2.5 sm:py-3 flex items-center gap-2 font-bold text-sm sm:text-base transition-all hover:scale-105">
                <Play className="w-5 h-5 fill-black" />
                Play
              </button>
            </Link>
            
            <Link href={detailLink}>
              <button className="bg-gray-500/50 hover:bg-gray-500/70 text-white rounded-lg px-5 sm:px-7 py-2.5 sm:py-3 flex items-center gap-2 text-sm sm:text-base transition-colors">
                <Info className="w-5 h-5" />
                More Info
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 bg-gradient-to-t from-[#141414] to-transparent" />
    </div>
  );
}
