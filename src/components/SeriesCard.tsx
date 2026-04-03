"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Star, Plus, Info, Tv } from "lucide-react";
import { IContent } from "@/models/Content";
import { useState } from "react";

interface SeriesCardProps {
  series: IContent;
  index?: number;
  hideTitle?: boolean;
  showNumber?: boolean;
}

export default function SeriesCard({ series, index = 0, hideTitle = false, showNumber = false }: SeriesCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const seasonCount = series.seasons?.length || 0;
  const episodeCount = series.seasons?.reduce((acc, s) => acc + (s.episodes?.length || 0), 0) || 0;

  return (
    <Link href={`/series/${String(series._id)}`}>
      <div 
        className="group cursor-pointer focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1f1f1f] lg:hover:scale-105 transition-transform duration-300 ease-out">
          {showNumber && index < 10 && (
            <div className="absolute left-0 -bottom-4 sm:-bottom-5 md:-bottom-6 z-0 pointer-events-none select-none">
              <span className="text-[120px] sm:text-[140px] md:text-[160px] lg:text-[180px] font-black leading-none text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.22)' }}>
                {index + 1}
              </span>
            </div>
          )}
          <div className={`relative z-10 ${showNumber && index < 10 ? 'ml-10 sm:ml-12 md:ml-14' : ''}`}>
            <Image
              src={series.poster}
              alt={series.title}
              fill
              sizes="(max-width: 480px) 33vw, (max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 16vw"
              loading={index < 8 ? "eager" : "lazy"}
              className={`object-cover transition-transform duration-300 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          </div>
          
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 lg:opacity-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          
          {isHovered && (
            <div className="absolute inset-0 bg-black/70 lg:flex hidden items-center justify-center gap-3">
              <button className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors transform hover:scale-110">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-600/80 text-white flex items-center justify-center hover:bg-gray-500 transition-colors transform hover:scale-110">
                <Plus className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-600/80 text-white flex items-center justify-center hover:bg-gray-500 transition-colors transform hover:scale-110">
                <Info className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-600 text-white rounded-sm flex items-center gap-1">
              <Tv className="w-3 h-3" />
              SERIES
            </span>
          </div>
          
          {series.rating && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-medium text-white">{series.rating}</span>
              </div>
            </div>
          )}
        </div>
        
        {!hideTitle && (
        <div className="mt-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 leading-tight">
            {series.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {series.year && <span className="text-[10px] md:text-xs text-gray-400">{series.year}</span>}
            {series.language && (
              <>
                <span className="text-[10px] md:text-xs text-gray-500">•</span>
                <span className="text-[10px] md:text-xs text-gray-400">{series.language}</span>
              </>
            )}
          </div>
          {seasonCount > 0 && (
            <p className="text-[10px] text-gray-500 mt-1">
              {seasonCount} {seasonCount === 1 ? "Season" : "Seasons"} | {episodeCount} Eps
            </p>
          )}
        </div>
        )}
      </div>
    </Link>
  );
}
