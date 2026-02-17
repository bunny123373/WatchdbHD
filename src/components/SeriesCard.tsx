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

  return (
    <Link href={`/series/${String(series._id)}`}>
      <div className="group relative aspect-[2/3] rounded overflow-hidden cursor-pointer">
        <Image
          src={series.poster}
          alt={series.title}
          fill
          sizes="(max-width: 480px) 33vw, (max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 16vw"
          loading="lazy"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <h3 className="text-xs md:text-sm font-medium text-white truncate">{series.title}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {series.year && <span className="text-[10px] md:text-xs text-gray-300">{series.year}</span>}
            {seasonCount > 0 && (
              <span className="text-[10px] md:text-xs text-gray-300">{seasonCount} Seasons</span>
            )}
          </div>
        </div>
        
        {series.rating && (
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[10px] md:text-xs px-1 py-0.5 bg-yellow-500/90 text-black font-semibold rounded flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-current" />
              {series.rating}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
