"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Star, Plus, Info } from "lucide-react";
import { IContent } from "@/models/Content";
import { useState } from "react";

interface MovieCardProps {
  movie: IContent;
  index?: number;
  hideTitle?: boolean;
  showNumber?: boolean;
}

export default function MovieCard({ movie, index = 0, hideTitle = false, showNumber = false }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/movie/${String(movie._id)}`} prefetch={true}>
      <div 
        className="group cursor-pointer focus:outline-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-[#1f1f1f] lg:hover:scale-105 transition-transform duration-300 ease-out">
          {showNumber && index < 10 && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center z-10 ml-2 pointer-events-none">
              <span className="text-[80px] sm:text-[100px] md:text-[120px] lg:text-[140px] font-black leading-none text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.22)' }}>
                {index + 1}
              </span>
            </div>
          )}
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 33vw, (max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 16vw"
            loading={index < 8 ? "eager" : "lazy"}
            className={`object-cover transition-transform duration-300 ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
          />
          
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
          
          {movie.rating && (
            <div className="absolute bottom-2 left-2">
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-[10px] font-medium text-white">{movie.rating}</span>
              </div>
            </div>
          )}
        </div>
        
        {!hideTitle && (
        <div className="mt-2 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {movie.year && <span className="text-[10px] md:text-xs text-gray-400">{movie.year}</span>}
            {movie.language && (
              <>
                <span className="text-[10px] md:text-xs text-gray-500">•</span>
                <span className="text-[10px] md:text-xs text-gray-400">{movie.language}</span>
              </>
            )}
          </div>
          {movie.tmdbGenres && movie.tmdbGenres.length > 0 && (
            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
              {movie.tmdbGenres.slice(0, 2).join(", ")}
            </p>
          )}
        </div>
        )}
      </div>
    </Link>
  );
}