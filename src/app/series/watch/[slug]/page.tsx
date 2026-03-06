"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Download, Play, ChevronLeft, ChevronRight, SkipForward, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IContent, IEpisode } from "@/models/Content";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import { normalizeExternalUrl } from "@/utils/url";

function resolveContentIdFromSlug(slug: string) {
  const normalized = (slug || "").trim();
  if (!normalized) return normalized;
  const maybeId = normalized.split("-").pop() || normalized;
  const objectIdRegex = /^[a-f\d]{24}$/i;
  return objectIdRegex.test(maybeId) ? maybeId : normalized;
}

function SeriesWatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [series, setSeries] = useState<IContent | null>(null);
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<IEpisode | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [activeServer, setActiveServer] = useState<1 | 2>(1);

  const slug = params.slug as string;
  const contentId = resolveContentIdFromSlug(slug);
  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  useEffect(() => {
    if (slug) {
      fetchSeries();
      setActiveServer(1);
    }
  }, [slug]);

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
      const response = await fetch(`/api/content/${contentId}`);
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
  const currentEpisodeEmbedLink = activeServer === 2 ? currentEpisode?.embedIframeLink2 : currentEpisode?.embedIframeLink;
  const currentEpisodeDownloadUrl = normalizeExternalUrl(currentEpisode?.downloadLink);

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
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/90 to-transparent py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href={`/series/${String(series._id)}`}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden sm:inline font-medium">{series.title}</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-xs font-bold bg-black text-white border border-white rounded-sm">
              S{currentSeason} E{currentEpisode?.episodeNumber}
            </span>
            {currentEpisode?.quality && (
              <span className="px-2 py-0.5 text-xs font-bold bg-black text-white border border-white/50 rounded-sm">
                {currentEpisode.quality}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-8">
        <div className="w-full aspect-video bg-black">
          <IframePlayer
            src={currentEpisodeEmbedLink}
            title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
                  {currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
                </h1>
                <p className="text-gray-400">{series.title} • Season {currentSeason}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutoPlayNext(!autoPlayNext)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    autoPlayNext 
                      ? "bg-green-600 text-white" 
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {autoPlayNext ? <SkipForward className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  {autoPlayNext ? "Auto-play On" : "Auto-play Off"}
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-6">
              {currentEpisode?.embedIframeLink && (
                <button
                  onClick={() => setActiveServer(1)}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors ${
                    activeServer === 1 
                      ? "bg-[#e50914] hover:bg-[#f40612] text-white" 
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Server 1
                </button>
              )}
              {currentEpisode?.embedIframeLink2 && (
                <button
                  onClick={() => setActiveServer(2)}
                  className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors ${
                    activeServer === 2 
                      ? "bg-green-600 hover:bg-green-500 text-white" 
                      : "bg-gray-700 hover:bg-gray-600 text-white"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  Server 2
                </button>
              )}
              {currentEpisodeDownloadUrl && (
                <a
                  href={currentEpisodeDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              )}
            </div>

            <button
              onClick={() => setShowEpisodeList(!showEpisodeList)}
              className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-md transition-colors ${
                showEpisodeList ? "bg-white text-black" : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <span>Episodes</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showEpisodeList ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>

          <AnimatePresence>
            {showEpisodeList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8"
              >
                <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                  {series.seasons?.map((season) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => {
                        setCurrentSeason(season.seasonNumber);
                        if (season.episodes.length > 0) {
                          handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                        }
                      }}
                      className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                        currentSeason === season.seasonNumber
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      Season {season.seasonNumber}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                  {currentSeasonData?.episodes.map((episode, idx) => {
                    const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;

                    return (
                      <button
                        key={episode.episodeNumber}
                        onClick={() => handleEpisodeSelect(episode, currentSeason)}
                        className={`flex-shrink-0 w-48 snap-start group relative transition-all ${
                          isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div className={`relative aspect-video rounded-lg overflow-hidden mb-2 ${
                          isActive ? "ring-2 ring-white" : "ring-1 ring-white/20 group-hover:ring-white/50"
                        }`}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white/50" />
                          </div>
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            <span className="text-xs font-medium text-white/90">
                              E{episode.episodeNumber}
                            </span>
                            {episode.quality && (
                              <span className="text-[10px] px-1 py-0.5 bg-white/20 text-white rounded">
                                {episode.quality}
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                              <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                            </div>
                          </div>
                          {isActive && (
                            <div className="absolute top-2 right-2">
                              <span className="text-[10px] px-2 py-0.5 bg-[#e50914] text-white rounded font-medium">
                                Playing
                              </span>
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-white truncate text-left">
                          {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                        </h4>
                        <p className="text-xs text-gray-400 text-left">
                          {series.title}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
