"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Play, Plus, ThumbsUp, Share } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EpisodeList from "@/components/EpisodeList";
import ContentGrid from "@/components/ContentGrid";
import AdBanner from "@/components/AdBanner";

export default function SeriesDetailsPage() {
  const params = useParams();
  const [series, setSeries] = useState<IContent | null>(null);
  const [similarSeries, setSimilarSeries] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchSeries();
    }
  }, [params.id]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.data);
        fetchSimilarSeries(data.data._id);
      }
    } catch (error) {
      console.error("Failed to fetch series:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarSeries = async (excludeId: string) => {
    try {
      const response = await fetch("/api/content?type=series");
      const data = await response.json();
      if (data.success) {
        setSimilarSeries(data.data.filter((s: IContent) => String(s._id) !== excludeId).slice(0, 10));
      }
    } catch (error) {
      console.error("Failed to fetch similar series:", error);
    }
  };

  const handleEpisodeSelect = (episode: IEpisode, seasonNumber: number) => {
    window.location.href = `/series/watch/${series?._id}?season=${seasonNumber}&episode=${episode.episodeNumber}`;
  };

  const getTotalEpisodes = () => {
    return series?.seasons?.reduce((acc, season) => acc + (season.episodes?.length || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-16">
          <div className="h-[50vh] bg-gray-900 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-white">Series not found</h1>
          <Link href="/" className="text-red-600 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-16">
        {/* Netflix Hero Section */}
        <div className="relative w-full aspect-[16/9] h-auto min-h-[300px] max-h-[500px] overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 w-full h-full">
            <Image
              src={series.banner || series.poster}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/40 to-[#141414]" />
          </div>

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 flex items-end pb-8 md:pb-12">
            <div className="max-w-xl lg:max-w-2xl space-y-3 md:space-y-4">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                {series.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-sm">
                {series.rating && (
                  <span className="text-green-400 font-semibold">{series.rating} Match</span>
                )}
                {series.year && (
                  <span className="text-white/80">{series.year}</span>
                )}
                <span className="text-white font-bold bg-purple-600 px-1.5 py-0.5 text-xs rounded">
                  SERIES
                </span>
                <span className="text-white/80">{series.seasons?.length || 0} Seasons</span>
                <span className="text-white/60">{getTotalEpisodes()} Episodes</span>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Link href={`/series/watch/${String(series._id)}`}>
                  <button className="bg-white text-black hover:bg-white/90 rounded px-5 md:px-7 py-2 md:py-2.5 flex items-center gap-2 font-bold text-sm">
                    <Play className="w-4 h-4 fill-black" />
                    Play
                  </button>
                </Link>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
                <button className="bg-gray-500/60 hover:bg-gray-500/80 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {series.description && (
                <p className="text-white/90 text-sm md:text-base leading-relaxed line-clamp-2">
                  {series.description}
                </p>
              )}

              {/* Tags */}
              {series.tags && series.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {series.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-white/10 text-xs text-white/80"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {series.seasons && series.seasons.length > 0 && (
            <EpisodeList
              seasons={series.seasons}
              onEpisodeSelect={handleEpisodeSelect}
            />
          )}
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          {/* Ad */}
          <div className="mb-6 sm:mb-8">
            <AdBanner slot="series-details" className="w-full h-16 sm:h-20 md:h-24" />
          </div>

          {/* Similar Series */}
          {similarSeries.length > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-4 sm:mb-6">More Like This</h2>
              <ContentGrid title="" items={similarSeries} isNetflixStyle />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
