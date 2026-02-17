"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Info } from "lucide-react";
import { IContent } from "@/models/Content";

interface HeroBannerProps {
  content: IContent;
}

export default function HeroBanner({ content }: HeroBannerProps) {
  if (!content) return null;

  const isMovie = content.type === "movie";
  const watchLink = isMovie ? `/watch/${content._id}` : `/series/watch/${content._id}`;
  const detailLink = isMovie ? `/movie/${String(content._id)}` : `/series/${String(content._id)}`;
  
  const bannerImage = content.banner || content.poster;

  return (
    <div className="relative w-full aspect-[16/9] h-auto min-h-[300px] max-h-[500px] overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={bannerImage}
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/40 to-[#141414]" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-8 md:pb-12">
        <div className="max-w-xl lg:max-w-2xl space-y-3 md:space-y-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
            {content.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
            {content.rating && (
              <span className="text-green-400 font-semibold">{content.rating} Match</span>
            )}
            {content.year && (
              <span className="text-white/80">{content.year}</span>
            )}
            {content.quality && (
              <span className="text-white font-bold bg-[#e50914] px-1.5 py-0.5 text-xs rounded">
                {content.quality}
              </span>
            )}
            <span className="text-white/80">{content.language}</span>
          </div>

          {content.description && (
            <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2">
              {content.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link href={watchLink}>
              <button className="bg-white text-black hover:bg-white/90 rounded px-5 md:px-7 py-2 md:py-2.5 flex items-center gap-2 font-bold text-sm">
                <Play className="w-4 h-4 fill-black" />
                Play
              </button>
            </Link>
            <Link href={detailLink}>
              <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded px-4 md:px-6 py-2 md:py-2.5 flex items-center gap-2 text-sm">
                <Info className="w-4 h-4" />
                More Info
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
