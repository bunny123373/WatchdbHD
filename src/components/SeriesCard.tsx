"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { IContent } from "@/models/Content";

interface SeriesCardProps {
  series: IContent;
  index?: number;
}

export default function SeriesCard({ series, index = 0 }: SeriesCardProps) {
  const seasonCount = series.seasons?.length || 0;
  const episodeCount = series.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0;

  return (
    <Link href={`/series/${String(series._id)}`}>
      <div className="group cursor-pointer focus:outline-none">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f1f] lg:hover:scale-105 transition-transform duration-300">
          <Image
            src={series.poster}
            alt={series.title}
            fill
            sizes="(max-width: 480px) 33vw, (max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 16vw"
            loading={index < 8 ? "eager" : "lazy"}
            className="object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">
                {series.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>{series.year}</span>
                {series.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{series.rating}</span>
                  </div>
                )}
              </div>
              {seasonCount > 0 && (
                <p className="text-[10px] text-gray-400 mt-1">
                  {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"} | {episodeCount} Episodes
                </p>
              )}
              {series.tmdbGenres && series.tmdbGenres.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {series.tmdbGenres.slice(0, 2).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 leading-tight">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {series.year && <span className="text-[10px] md:text-xs text-gray-400">{series.year}</span>}
            {series.language && (
              <>
                <span className="text-[10px] md:text-xs text-gray-500">|</span>
                <span className="text-[10px] md:text-xs text-gray-400">{series.language}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
