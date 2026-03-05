"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IContent, IEpisode, ISeason } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import { normalizeExternalUrl } from "@/utils/url";

function SeriesWatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [series, setSeries] = useState<IContent | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<IEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

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
    const url = new URL(window.location.href);
    url.searchParams.set("season", seasonNumber.toString());
    url.searchParams.set("episode", episode.episodeNumber.toString());
    window.history.replaceState({}, "", url);
  };

  const playNextEpisode = () => {
    if (!series || !currentEpisode) return;
    
    const currentSeasonData = series.seasons?.find((s) => s.seasonNumber === currentSeason);
    const currentEpisodeIndex = currentSeasonData?.episodes.findIndex((e) => e.episodeNumber === currentEpisode?.episodeNumber);
    
    if (currentEpisodeIndex !== undefined && currentEpisodeIndex < (currentSeasonData?.episodes.length || 0) - 1) {
      const nextEpisode = currentSeasonData?.episodes[currentEpisodeIndex + 1];
      if (nextEpisode) {
        handleEpisodeSelect(nextEpisode, currentSeason);
      }
    } else {
      const nextSeason = series.seasons?.find((s) => s.seasonNumber === currentSeason + 1);
      if (nextSeason && nextSeason.episodes.length > 0) {
        handleEpisodeSelect(nextSeason.episodes[0], nextSeason.seasonNumber);
      }
    }
  };

  const currentSeasonData = series?.seasons?.find((s) => s.seasonNumber === currentSeason);
  const currentEpisodeEmbedLink = currentEpisode?.embedIframeLink || currentEpisode?.embedIframeLink2;
  const currentEpisodeDownloadUrl = normalizeExternalUrl(currentEpisode?.downloadLink);
  const currentEpisodeNumber = currentEpisode?.episodeNumber;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-gray-800 rounded-2xl animate-pulse" />
          </div>
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
          <Link href="/" className="text-yellow-500 mt-4 inline-block">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link
              href={`/series/${String(series._id)}`}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Series Details
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <IframePlayer
              src={currentEpisodeEmbedLink}
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded">S{currentSeason}</span>
              <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded">E{currentEpisode?.episodeNumber}</span>
              {currentEpisode?.quality && (
                <span className="px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded">{currentEpisode.quality}</span>
              )}
              <button
                onClick={() => setAutoPlayNext(!autoPlayNext)}
                className={`ml-auto px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  autoPlayNext 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {autoPlayNext ? "Auto-play On" : "Auto-play Off"}
              </button>
            </div>
            
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
                </h1>
                <p className="text-gray-400 text-lg">{series.title}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {currentEpisodeDownloadUrl && (
                  <a
                    href={currentEpisodeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                )}
                {currentEpisode?.embedIframeLink2 && (
                  <a
                    href={currentEpisode.embedIframeLink2}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Server 2
                  </a>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden"
          >
            <div className="flex border-b border-gray-800 overflow-x-auto">
              {series.seasons?.map((season) => (
                <button
                  key={season.seasonNumber}
                  onClick={() => {
                    setCurrentSeason(season.seasonNumber);
                    if (season.episodes.length > 0) {
                      handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                    }
                  }}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                    currentSeason === season.seasonNumber
                      ? "text-yellow-500 border-b-2 border-yellow-500"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  Season {season.seasonNumber}
                </button>
              ))}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {currentSeasonData?.episodes.map((episode) => {
                const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;

                return (
                  <button
                    key={episode.episodeNumber}
                    onClick={() => handleEpisodeSelect(episode, currentSeason)}
                    className={`w-full flex items-center gap-4 p-4 text-left transition-colors hover:bg-gray-800/50 ${
                      isActive ? "bg-yellow-500/10 border-l-4 border-l-yellow-500" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-300">
                        {episode.episodeNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {episode.episodeTitle}
                      </h4>
                      {episode.quality && (
                        <span className="text-xs text-gray-400">{episode.quality}</span>
                      )}
                    </div>
                    {normalizeExternalUrl(episode.downloadLink) && (
                      <a
                        href={normalizeExternalUrl(episode.downloadLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:text-yellow-500 hover:bg-gray-600 transition-colors"
                      >
                        <Download className="w-4 h-4" />
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
    </div>
  );
}

export default function SeriesWatchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#141414]">
        <Navbar />
        <div className="pt-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="aspect-video bg-gray-800 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    }>
      <SeriesWatchContent />
    </Suspense>
  );
}
