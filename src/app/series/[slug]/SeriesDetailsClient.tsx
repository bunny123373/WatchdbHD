"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Plus, ThumbsUp } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      {/* Banner */}
      <div className="relative">
        {/* Backdrop */}
        <div className="absolute inset-0 h-[50vh] sm:h-[60vh] md:h-[70vh]">
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
        </div>

        {/* Content */}
        <div className="relative pt-[25vh] sm:pt-[35vh] md:pt-[45vh] px-4 sm:px-6 md:px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="relative w-40 sm:w-48 md:w-56 lg:w-64 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
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

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
                  {series.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
                  {series.year && (
                    <span className="flex items-center gap-1">
                      {series.year}
                    </span>
                  )}
                  {series.quality && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-600 text-white rounded">
                      {series.quality}
                    </span>
                  )}
                  {series.language && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-700 text-white rounded">
                      {series.language}
                    </span>
                  )}
                  {series.audioLanguages && series.audioLanguages.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-white/10 text-white rounded">
                      Audio: {series.audioLanguages.join(", ")}
                    </span>
                  )}
                </div>

                <p className="text-gray-300 text-sm sm:text-base mb-6 sm:mb-8 line-clamp-3 sm:line-clamp-none">
                  {series.description}
                </p>

                {/* Tags */}
                {series.tags && series.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
                    {series.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs sm:text-sm bg-gray-800 text-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/verify?id=${series._id}&type=series`}
                    className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#e50914] hover:bg-[#f40612] text-white font-bold rounded-lg transition-all transform hover:scale-105 text-sm sm:text-base"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Watch Now</span>
                  </Link>
                  <ShareButton title={series.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seasons & Episodes */}
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

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {/* Similar Series */}
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
