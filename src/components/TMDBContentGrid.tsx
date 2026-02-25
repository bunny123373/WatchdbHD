"use client";

import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";

interface TMDBContent {
  tmdbId: number;
  title: string;
  poster: string;
  banner: string;
  description: string;
  year: string;
  rating: number;
  genreIds?: number[];
  genres?: string[];
  type?: string;
}

interface TMDBContentGridProps {
  title: string;
  items: TMDBContent[];
}

export default function TMDBContentGrid({ title, items }: TMDBContentGridProps) {
  return (
    <section className="py-2">
      <div className="px-4 md:px-6 lg:px-8">
        <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-4 flex items-center gap-2">
          {title}
          <span className="text-xs bg-[#e50914] px-2 py-0.5 rounded">TMDB</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
          {items.slice(0, 16).map((item, index) => (
            <Link
              key={`${item.tmdbId}-${item.type}`}
              href={item.type === "tv" ? `/tv/${item.tmdbId}` : `/movie/${item.tmdbId}`}
              className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1f1f1f] cursor-pointer lg:hover:scale-105 transition-transform duration-300"
            >
              {item.poster ? (
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading={index < 8 ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <h3 className="text-white text-xs font-medium line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <span>{item.year}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  {item.genres && item.genres.length > 0 && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      {item.genres.slice(0, 2).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
