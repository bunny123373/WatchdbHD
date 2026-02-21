"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IContent, IEpisode, ISeason } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import Badge from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

function SeriesWatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [series, setSeries] = useState<IContent | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<IEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);

  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  useEffect(() => {
    if (params.id) {
      fetchSeries();
    }
  }, [params.id]);

  useEffect(() => {
    if (series && seasonParam && episodeParam) {
      const seasonNum = parseInt(seasonParam);
      const episodeNum = parseInt(episodeParam);
      const season = series.seasons?.find((s) => s.seasonNumber === seasonNum);
      const episode = season?.episodes.find((e) => e.episodeNumber === episodeNum);
      if (episode) {
        setCurrentSeason(seasonNum);
        setCurrentEpisode(episode);
      }
    } else if (series && !currentEpisode) {
      // Default to first episode of first season
      const firstSeason = series.seasons?.[0];
      const firstEpisode = firstSeason?.episodes[0];
      if (firstEpisode) {
        setCurrentSeason(firstSeason.seasonNumber);
        setCurrentEpisode(firstEpisode);
      }
    }
  }, [series, seasonParam, episodeParam]);

  const fetchSeries = async () => {
    try {
      const response = await fetch(`/api/content/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setSeries(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch series:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEpisodeSelect = (episode: IEpisode, seasonNumber: number) => {
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episode);
    setShowEpisodeList(false);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("season", seasonNumber.toString());
    url.searchParams.set("episode", episode.episodeNumber.toString());
    window.history.replaceState({}, "", url);
  };

  const currentSeasonData = series?.seasons?.find((s) => s.seasonNumber === currentSeason);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-text-primary">Series not found</h1>
          <Link href="/" className="text-primary-gold mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href={`/series/${String(series._id)}`}
              className="inline-flex items-center gap-2 text-text-muted hover:text-primary-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Series Details
            </Link>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <IframePlayer
              src={currentEpisode?.embedIframeLink}
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
            />
          </motion.div>

          {/* Episode Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="purple">S{currentSeason}</Badge>
              <Badge variant="gold">E{currentEpisode?.episodeNumber}</Badge>
              {currentEpisode?.quality && (
                <Badge variant="outline">{currentEpisode.quality}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
            </h1>
            <p className="text-text-muted text-lg">{series.title}</p>
          </motion.div>

          {/* Episode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            {/* Season Selector */}
            <div className="flex border-b border-border overflow-x-auto">
              {series.seasons?.map((season) => (
                <button
                  key={season.seasonNumber}
                  onClick={() => {
                    setCurrentSeason(season.seasonNumber);
                    // Select first episode of this season
                    if (season.episodes.length > 0) {
                      handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                    }
                  }}
                  className={cn(
                    "px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors",
                    currentSeason === season.seasonNumber
                      ? "text-primary-gold border-b-2 border-primary-gold"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  Season {season.seasonNumber}
                </button>
              ))}
            </div>

            {/* Episode List */}
            <div className="max-h-96 overflow-y-auto">
              {currentSeasonData?.episodes.map((episode) => {
                const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;

                return (
                  <button
                    key={episode.episodeNumber}
                    onClick={() => handleEpisodeSelect(episode, currentSeason)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-border/30",
                      isActive && "bg-primary-gold/10 border-l-4 border-l-primary-gold"
                    )}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-border flex items-center justify-center">
                      <span className="text-sm font-semibold text-text-muted">
                        {episode.episodeNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-text-primary truncate">
                        {episode.episodeTitle}
                      </h4>
                      {episode.quality && (
                        <span className="text-xs text-text-muted">{episode.quality}</span>
                      )}
                    </div>
                    {episode.downloadLink && (
                      <a
                        href={episode.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg bg-border text-xs text-text-muted hover:text-secondary-purple hover:bg-secondary-purple/10 transition-colors"
                      >
                        Download
                      </a>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function SeriesWatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-card rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <SeriesWatchContent />
    </Suspense>
  );
}
