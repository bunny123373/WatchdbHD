"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { IContent } from "@/models/Content";

interface MovieCardProps {
  movie: IContent;
  index?: number;
}

export default function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <Link href={`/movie/${String(movie._id)}`} prefetch={true}>
      <div className="group cursor-pointer focus:outline-none">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f1f] lg:hover:scale-105 transition-transform duration-300">
          <Image
            src={movie.poster}
            alt={movie.title}
            fill
            sizes="(max-width: 480px) 33vw, (max-width: 640px) 28vw, (max-width: 768px) 22vw, (max-width: 1024px) 18vw, 16vw"
            loading={index < 8 ? "eager" : "lazy"}
            className="object-cover"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">
                {movie.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-300">
                <span>{movie.year}</span>
                {movie.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{movie.rating}</span>
                  </div>
                )}
              </div>
              {movie.tmdbGenres && movie.tmdbGenres.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                  {movie.tmdbGenres.slice(0, 2).join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-2">
          <h3 className="text-xs md:text-sm font-medium text-white line-clamp-2 leading-tight">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {movie.year && <span className="text-[10px] md:text-xs text-gray-400">{movie.year}</span>}
            {movie.language && (
              <>
                <span className="text-[10px] md:text-xs text-gray-500">|</span>
                <span className="text-[10px] md:text-xs text-gray-400">{movie.language}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
