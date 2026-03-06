"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Plus, Star, Calendar, Tv, Info, Download, ChevronDown } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import ContentGrid from "@/components/ContentGrid";
import ShareButton from "@/components/ShareButton";

interface SeriesDetailsClientProps {
  series: IContent;
  similarSeries: IContent[];
}

export default function SeriesDetailsClient({ series: initialSeries, similarSeries: initialSimilar }: SeriesDetailsClientProps) {
  const [series, setSeries] = useState<IContent>(initialSeries);
  const [similarSeries, setSimilarSeries] = useState<IContent[]>(initialSimilar);
  const [loading, setLoading] = useState(false);
  const [showAllSeasons, setShowAllSeasons] = useState(false);

  const displayedSeasons = showAllSeasons ? series.seasons : (series.seasons as unknown as { seasonNumber: number; episodes: IEpisode[] }[]).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="relative">
        <div className="absolute inset-0 h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
          {series.banner ? (
            <Image
              src={series.banner}
              alt={series.title}
              fill
              className="object-cover"
              priority
            />
          ) : series.poster ? (
            <Image
              src={series.poster}
              alt={series.title}
              fill
              className="object-cover"
              priority
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-transparent to-transparent" />
        </div>

        <div className="relative pt-[30vh] sm:pt-[40vh] md:pt-[50vh] lg:pt-[60vh] px-4 sm:px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
              <div className="flex-shrink-0 hidden lg:block">
                <div className="relative w-64 xl:w-72 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10">
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
                      <span className="text-gray-500">No Poster</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                  {series.title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm text-gray-300 mb-5 sm:mb-6">
                  {series.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-white">{series.rating}</span>
                    </div>
                  )}
                  {series.year && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {series.year}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    TV Series
                  </span>
                  {series.quality && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded-sm">
                      {series.quality}
                    </span>
                  )}
                  {series.language && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white rounded-sm">
                      {series.language}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-4 lg:line-clamp-6 max-w-3xl">
                  {series.description}
                </p>

                {series.tmdbGenres && series.tmdbGenres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    {series.tmdbGenres.slice(0, 4).map((genre: string) => (
                      <span
                        key={genre}
                        className="px-3 py-1.5 text-xs sm:text-sm bg-white/10 text-white rounded-full border border-white/20"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-4 mb-8">
                  <Link
                    href={`/verify?id=${series._id}&type=series`}
                    className="flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-[#e50914] hover:bg-[#f40612] text-white font-bold rounded-md transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play</span>
                  </Link>
                  
                  <button className="flex items-center gap-2.5 px-5 sm:px-6 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-all text-sm">
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">My List</span>
                  </button>
                  
                  <ShareButton title={series.title} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 py-4 border-t border-b border-white/10">
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Episodes</p>
                    <p className="text-white text-sm font-medium">
                      {series.seasons?.reduce((acc: number, s: { episodes?: unknown[] }) => acc + (s.episodes?.length || 0), 0) || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Seasons</p>
                    <p className="text-white text-sm font-medium">
                      {series.seasons?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Genre</p>
                    <p className="text-white text-sm font-medium">
                      {series.tmdbGenres?.slice(0, 2).join(", ") || series.tags?.slice(0, 2).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase mb-1">Audio</p>
                    <p className="text-white text-sm font-medium">
                      {series.audioLanguages?.join(", ") || series.language || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
        {series.seasons && series.seasons.length > 0 ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Seasons & Episodes</h2>
            <EpisodeList
              seasons={series.seasons as unknown as { seasonNumber: number; episodes: IEpisode[] }[]}
              seriesId={series._id}
              seriesPoster={series.poster}
            />
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No episodes available</p>
            <Link
              href={`/verify?id=${series._id}&type=series`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-md transition-colors"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Watching
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {similarSeries.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
            <ContentGrid title="" items={similarSeries} isNetflixStyle />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
