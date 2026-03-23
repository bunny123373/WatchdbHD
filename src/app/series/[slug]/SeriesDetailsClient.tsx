"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Star, Tv, Download, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import Footer from "@/components/Footer";
import ContentGrid from "@/components/ContentGrid";

interface SeriesDetailsClientProps {
  series: IContent;
  similarSeries: IContent[];
}

export default function SeriesDetailsClient({ series: initialSeries, similarSeries: initialSimilar }: SeriesDetailsClientProps) {
  const [series] = useState<IContent>(initialSeries);
  const [similarSeries] = useState<IContent[]>(initialSimilar);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([1]);

  const totalEpisodes = series.seasons?.reduce((acc: number, s: { episodes?: unknown[] }) => acc + (s.episodes?.length || 0), 0) || 0;

  const toggleSeason = (seasonNum: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonNum) 
        ? prev.filter(i => i !== seasonNum)
        : [...prev, seasonNum]
    );
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Banner */}
      <div className="relative">
        {/* Banner Background */}
        <div className="absolute inset-0 h-[60vh] md:h-[70vh]">
          {series.banner || series.poster ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${series.banner || series.poster})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
          )}
        </div>

        {/* Back Button */}
        <div className="relative z-10">
          <Link href="/" className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
        </div>

        {/* Content */}
        <div className="relative z-10 pt-[35vh] md:pt-[45vh] px-4">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{series.title}</h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300 mb-6">
            {series.year && <span>{series.year}</span>}
            <span className="flex items-center gap-1"><Tv className="w-4 h-4" /> TV Series</span>
            {series.quality && (
              <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">{series.quality}</span>
            )}
            {series.language && <span>{series.language}</span>}
            {series.rating && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-yellow-500">{series.rating}</span>
              </span>
            )}
            {series.audioLanguages && series.audioLanguages.length > 0 && (
              <span className="text-white/80">Audio: {series.audioLanguages.join(", ")}</span>
            )}
          </div>

          {/* Play Button - Full width mobile */}
          <Link
            href={`/verify?id=${series._id}&type=series`}
            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-white text-black font-medium rounded hover:bg-gray-200 transition-colors mb-4"
          >
            <Play className="w-5 h-5 fill-black" />
            <span>Play</span>
          </Link>

          {/* Description */}
          <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-8">
            {series.description}
          </p>
        </div>
      </div>

      {/* Seasons & Episodes */}
      <div className="px-4 py-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Episodes</h2>
          <div className="text-gray-400 text-sm">
            {series.seasons?.length || 0} Seasons · {totalEpisodes} Episodes
          </div>
        </div>

        {series.seasons && series.seasons.length > 0 ? (
          <div className="space-y-3">
            {series.seasons.map((season) => {
              const isExpanded = expandedSeasons.includes(season.seasonNumber);
              return (
                <div key={season.seasonNumber} className="border border-white/10 rounded overflow-hidden">
                  <button
                    onClick={() => toggleSeason(season.seasonNumber)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium text-white">Season {season.seasonNumber}</span>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="text-sm">{season.episodes.length} episodes</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="divide-y divide-white/10">
                      {(season.episodes as unknown as IEpisode[]).map((episode) => (
                        <Link
                          key={episode.episodeNumber}
                          href={`/series/watch/${series._id}?season=${season.seasonNumber}&episode=${episode.episodeNumber}`}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-gray-500 text-sm w-8">{episode.episodeNumber}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                            </p>
                            {episode.episodeDescription && (
                              <p className="text-gray-500 text-xs truncate mt-0.5">{episode.episodeDescription}</p>
                            )}
                          </div>
                          {episode.quality && (
                            <span className="text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{episode.quality}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No episodes available</div>
        )}
      </div>

      {/* About Section */}
      <div className="px-4 py-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Seasons</p>
            <p className="text-white text-sm">{series.seasons?.length || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase mb-1">Genres</p>
            <p className="text-white text-sm">{series.tmdbGenres?.slice(0, 2).join(", ") || series.tags?.slice(0, 2).join(", ") || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Genres */}
      {series.tmdbGenres && series.tmdbGenres.length > 0 && (
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {series.tmdbGenres.map((genre: string) => (
              <span key={genre} className="px-3 py-1 text-xs bg-white/10 text-white/80 rounded-full">{genre}</span>
            ))}
          </div>
        </div>
      )}

      {/* Similar Series */}
      {similarSeries.length > 0 && (
        <div className="px-4 py-6 border-t border-white/10">
          <h2 className="text-xl font-bold text-white mb-4">More Like This</h2>
          <ContentGrid title="" items={similarSeries} isNetflixStyle />
        </div>
      )}

      <Footer />
    </div>
  );
}
