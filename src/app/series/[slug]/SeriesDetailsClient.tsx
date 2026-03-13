"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Tv, Download } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import ContentGrid from "@/components/ContentGrid";

interface SeriesDetailsClientProps {
  series: IContent;
  similarSeries: IContent[];
}

export default function SeriesDetailsClient({ series: initialSeries, similarSeries: initialSimilar }: SeriesDetailsClientProps) {
  const [series] = useState<IContent>(initialSeries);
  const [similarSeries] = useState<IContent[]>(initialSimilar);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);

  const totalEpisodes = series.seasons?.reduce((acc: number, s: { episodes?: unknown[] }) => acc + (s.episodes?.length || 0), 0) || 0;

  const toggleSeason = (seasonIndex: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonIndex) 
        ? prev.filter(i => i !== seasonIndex)
        : [...prev, seasonIndex]
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#141414]">
      {/* Hero Section */}
      <div className="relative">
        {/* Banner Image with Netflix-style gradient */}
        <div className="absolute inset-0 h-[85vh] lg:h-[90vh]">
          {(series.banner || series.poster) && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${series.banner || series.poster})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#141414]" />
            </>
          )}
        </div>

        {/* Content */}
        <div className="relative pt-[45vh] lg:pt-[35vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
              {/* Left: Poster (hidden on large screens) */}
              <div className="flex-shrink-0 lg:order-2 lg:ml-auto mb-[-80px] lg:mb-0 relative z-10">
                <div className="relative w-40 sm:w-48 md:w-56 lg:w-48 xl:w-56 aspect-[2/3] rounded-md overflow-hidden shadow-2xl ring-1 ring-white/20 hidden lg:block">
                  {series.poster ? (
                    <Image
                      src={series.poster}
                      alt={series.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Tv className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Details */}
              <div className="flex-1 lg:order-1 lg:pr-8 max-w-2xl">
                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                  {series.title}
                </h1>

                {/* Meta Info Row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mb-6">
                  {series.year && (
                    <span className="text-white font-medium">{series.year}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tv className="w-3.5 h-3.5" />
                    TV Series
                  </span>
                  {series.quality && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                      {series.quality}
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/20 text-white rounded-sm">
                    {series.language || "HD"}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-base md:text-lg mb-6 leading-relaxed line-clamp-3">
                  {series.description}
                </p>

                {/* Genres */}
                {series.tmdbGenres && series.tmdbGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {series.tmdbGenres.slice(0, 4).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full border border-white/10"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons - Netflix Style */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <Link
                    href={`/verify?id=${series._id}&type=series`}
                    className="flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 bg-white text-black hover:bg-gray-200 font-medium rounded-sm transition-colors w-full sm:w-auto"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span className="text-base">Play</span>
                  </Link>
                </div>

                {/* Rating Badge */}
                {series.rating && (
                  <div className="flex items-center gap-2 mb-8">
                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-yellow-500 font-bold">{series.rating}</span>
                    </div>
                    <span className="text-gray-400 text-sm">from users</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {series.seasons && series.seasons.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Episodes</h2>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>{series.seasons.length} Seasons</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{totalEpisodes} Episodes</span>
              </div>
            </div>
            <EpisodeList
              seasons={series.seasons as unknown as { seasonNumber: number; episodes: IEpisode[] }[]}
              seriesId={series._id}
              seriesPoster={series.poster}
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No episodes available yet</p>
            <Link
              href={`/verify?id=${series._id}&type=series`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-sm transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Watching
            </Link>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-t border-white/10">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Seasons</p>
            <p className="text-white text-sm font-medium">{series.seasons?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Episodes</p>
            <p className="text-white text-sm font-medium">{totalEpisodes}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Genres</p>
            <p className="text-white text-sm font-medium">
              {series.tmdbGenres?.slice(0, 2).join(", ") || series.tags?.slice(0, 2).join(", ") || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Audio</p>
            <p className="text-white text-sm font-medium">
              {series.audioLanguages?.slice(0, 2).join(", ") || series.language || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Similar Series */}
      {similarSeries.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
          <ContentGrid title="" items={similarSeries} isNetflixStyle />
        </div>
      )}

      <Footer />
    </div>
  );
}
