"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Download, Play, ChevronLeft, SkipForward, Check, ChevronDown, CircleCheck, Tv, Layers3, ListVideo, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IContent, IEpisode } from "@/models/Content";
import Footer from "@/components/Footer";
import IframePlayer from "@/components/IframePlayer";
import WatchPlayerShell from "@/components/WatchPlayerShell";
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
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<string>>(new Set());
  const [hoveredEpisode, setHoveredEpisode] = useState<number | null>(null);
  const episodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const slug = params.slug as string;
  const contentId = resolveContentIdFromSlug(slug);
  const seasonParam = searchParams.get("season");
  const episodeParam = searchParams.get("episode");

  useEffect(() => {
    if (slug) {
      fetchSeries();
      setActiveServer(1);
      const saved = localStorage.getItem(`watched_${contentId}`);
      if (saved) {
        setWatchedEpisodes(new Set(JSON.parse(saved)));
      }
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

  const markAsWatched = (episode: IEpisode, seasonNum: number) => {
    const key = `${seasonNum}-${episode.episodeNumber}`;
    const newWatched = new Set(watchedEpisodes);
    newWatched.add(key);
    setWatchedEpisodes(newWatched);
    localStorage.setItem(`watched_${contentId}`, JSON.stringify([...newWatched]));
  };

  const isEpisodeWatched = (episodeNum: number, seasonNum: number) => {
    return watchedEpisodes.has(`${seasonNum}-${episodeNum}`);
  };

  const getWatchedCountForSeason = (seasonNum: number) => {
    const season = series?.seasons?.find((s) => s.seasonNumber === seasonNum);
    if (!season) return 0;
    return season.episodes.filter((ep) => watchedEpisodes.has(`${seasonNum}-${ep.episodeNumber}`)).length;
  };

  const playNextEpisode = () => {
    if (!series || !currentEpisode) return;

    markAsWatched(currentEpisode, currentSeason);

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

  useEffect(() => {
    if (showEpisodeList && currentEpisode && episodeRefs.current.size > 0) {
      const currentEl = episodeRefs.current.get(currentEpisode.episodeNumber);
      if (currentEl) {
        setTimeout(() => {
          currentEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }, 300);
      }
    }
  }, [showEpisodeList, currentEpisode]);

  const playSeason = () => {
    const firstUnwatched = currentSeasonData?.episodes.find(
      (ep) => !watchedEpisodes.has(`${currentSeason}-${ep.episodeNumber}`)
    );
    if (firstUnwatched) {
      handleEpisodeSelect(firstUnwatched, currentSeason);
    } else if (currentSeasonData?.episodes.length) {
      handleEpisodeSelect(currentSeasonData.episodes[0], currentSeason);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="px-4 pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="aspect-video rounded-2xl bg-gray-800 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-[#141414]">
        <div className="pt-32 text-center">
          <h1 className="text-2xl font-bold text-white">Series not found</h1>
          <Link href="/" className="mt-4 inline-block text-yellow-500">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.14),_transparent_22%),linear-gradient(180deg,_#050505_0%,_#090909_45%,_#040404_100%)]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-black via-black/90 to-transparent">
        <div
          className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pb-3 pt-3 sm:px-6 lg:px-8"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <Link
            href={`/series/${String(series._id)}`}
            className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-white/90 backdrop-blur transition-colors hover:border-white/20 hover:bg-black/45 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
            <span className="max-w-[140px] truncate text-xs font-medium sm:max-w-none sm:text-sm">
              {series.title?.slice(0, 15)}
              {series.title && series.title.length > 15 ? "..." : ""}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#e50914] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_20px_rgba(229,9,20,0.3)]">
              S{currentSeason}E{currentEpisode?.episodeNumber}
            </span>
            {currentEpisode?.quality && (
              <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                {currentEpisode.quality}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <WatchPlayerShell
              eyebrow={`Season ${currentSeason}`}
              title={currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
              subtitle={`${series.title} | Episode ${currentEpisode?.episodeNumber}${currentEpisode?.quality ? ` | ${currentEpisode.quality}` : ""}`}
              badges={
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                    <Tv className="h-3.5 w-3.5" />
                    S{currentSeason}E{currentEpisode?.episodeNumber}
                  </span>
                  {currentEpisode?.quality && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200">
                      <Play className="h-3.5 w-3.5 text-red-400" />
                      {currentEpisode.quality}
                    </span>
                  )}
                  <button
                    onClick={() => setAutoPlayNext(!autoPlayNext)}
                    className={`inline-flex min-h-[34px] items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      autoPlayNext
                        ? "bg-emerald-600 text-white"
                        : "border border-white/10 bg-white/[0.04] text-gray-300"
                    }`}
                  >
                    {autoPlayNext ? <SkipForward className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                    {autoPlayNext ? "Auto-play On" : "Auto-play Off"}
                  </button>
                </>
              }
              actions={
                <>
                  {currentEpisode?.embedIframeLink && (
                    <button
                      onClick={() => setActiveServer(1)}
                      className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                        activeServer === 1
                          ? "bg-[#e50914] text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                          : "border border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]"
                      }`}
                    >
                      <Play className="w-4 h-4" />
                      Server 1
                    </button>
                  )}
                  {currentEpisode?.embedIframeLink2 && (
                    <button
                      onClick={() => setActiveServer(2)}
                      className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                        activeServer === 2
                          ? "bg-[#e50914] text-white shadow-[0_10px_30px_rgba(229,9,20,0.28)]"
                          : "border border-white/10 bg-white/[0.04] text-gray-200 hover:bg-white/[0.08]"
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
                      className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => setShowEpisodeList(!showEpisodeList)}
                    className={`inline-flex min-h-[42px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                      showEpisodeList
                        ? "bg-white text-black"
                        : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Layers3 className="w-4 h-4" />
                    Episodes
                    <ChevronDown className={`w-4 h-4 transition-transform ${showEpisodeList ? "rotate-180" : ""}`} />
                  </button>
                </>
              }
            >
              <IframePlayer
                src={currentEpisodeEmbedLink}
                title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
              />
            </WatchPlayerShell>
          </motion.div>

          <div className="mb-6 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">About This Episode</h3>
                <p className="leading-relaxed text-gray-300">
                  {currentEpisode?.episodeDescription || currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
                </p>
                {series.description && (
                  <p className="mt-4 border-t border-white/5 pt-4 text-sm leading-relaxed text-gray-400">
                    {series.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Playback</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-start gap-3">
                      <Tv className="mt-0.5 h-4 w-4 text-red-400" />
                      <p>Use Server 1 first, then switch only if the current source stalls or fails.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 text-red-400" />
                      <p>Open episodes below the player to stay in the same flow, especially on mobile.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(229,9,20,0.1),rgba(255,255,255,0.02))] p-5 sm:p-6">
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-white">Series Context</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>{series.title}</p>
                    <p>Season {currentSeason}</p>
                    <p>{currentSeasonData?.episodes.length || 0} episodes in this season</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Watch Status</h3>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <span className="text-gray-500">Season</span>
                    <span>{currentSeason}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <span className="text-gray-500">Episode</span>
                    <span>{currentEpisode?.episodeNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                    <span className="text-gray-500">Watched</span>
                    <span>{getWatchedCountForSeason(currentSeason)}/{currentSeasonData?.episodes.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-500">Auto-play</span>
                    <span>{autoPlayNext ? "Enabled" : "Disabled"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Next Up</h3>
                <p className="text-sm leading-relaxed text-gray-300">
                  {autoPlayNext
                    ? "When enabled, the player can continue your current season flow more smoothly after each episode."
                    : "Auto-play is off. You’ll manually choose the next episode from the browser below."}
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showEpisodeList && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5 lg:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ListVideo className="h-4 w-4 text-red-400" />
                    <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-red-400">Episode Browser</h3>
                  </div>
                  <span className="text-xs text-gray-500">Season {currentSeason}</span>
                </div>

                <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide lg:mb-6">
                  {series.seasons?.map((season) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => {
                        setCurrentSeason(season.seasonNumber);
                        if (season.episodes.length > 0) {
                          handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                        }
                      }}
                      className={`flex flex-shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all lg:gap-2 lg:px-4 lg:py-2 lg:text-sm ${
                        currentSeason === season.seasonNumber
                          ? "bg-white text-black"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      <span>S{season.seasonNumber}</span>
                      <span className={`text-[10px] lg:text-xs ${currentSeason === season.seasonNumber ? "text-gray-500" : "text-gray-400"}`}>
                        {getWatchedCountForSeason(season.seasonNumber)}/{season.episodes.length}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={playSeason}
                    className="flex flex-shrink-0 items-center gap-1 rounded-full bg-[#e50914] px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-[#f40612] lg:gap-2 lg:px-4 lg:py-2 lg:text-sm"
                  >
                    <Play className="h-3 w-3 fill-white lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">Play</span>
                  </button>
                </div>

                <div className="hidden gap-4 overflow-x-auto pb-4 snap-x lg:flex lg:snap-none lg:scrollbar-hide">
                  {currentSeasonData?.episodes.map((episode) => {
                    const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;
                    const isWatched = isEpisodeWatched(episode.episodeNumber, currentSeason);

                    return (
                      <div
                        key={episode.episodeNumber}
                        ref={(el) => {
                          if (el) episodeRefs.current.set(episode.episodeNumber, el);
                        }}
                        className={`group relative w-48 flex-shrink-0 snap-start transition-all ${
                          isActive ? "scale-105" : "opacity-70 hover:opacity-100"
                        }`}
                        onMouseEnter={() => setHoveredEpisode(episode.episodeNumber)}
                        onMouseLeave={() => setHoveredEpisode(null)}
                      >
                        <button onClick={() => handleEpisodeSelect(episode, currentSeason)} className="w-full">
                          <div className={`relative mb-2 aspect-video overflow-hidden rounded-lg ${
                            isActive ? "ring-2 ring-white" : isWatched ? "ring-1 ring-green-500/50" : "ring-1 ring-white/20 group-hover:ring-white/50"
                          }`}>
                            {episode.episodeThumbnail || series.poster ? (
                              <img
                                src={episode.episodeThumbnail || series.poster}
                                alt={episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                <Play className="h-8 w-8 text-white/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-2 left-2 flex items-center gap-1">
                              <span className="text-xs font-medium text-white/90">E{episode.episodeNumber}</span>
                              {episode.quality && (
                                <span className="rounded bg-white/20 px-1 py-0.5 text-[10px] text-white">
                                  {episode.quality}
                                </span>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90">
                                <Play className="ml-0.5 h-5 w-5 text-black" fill="black" />
                              </div>
                            </div>
                            {isActive && (
                              <div className="absolute top-2 right-2">
                                <span className="rounded bg-[#e50914] px-2 py-0.5 text-[10px] font-medium text-white">
                                  Playing
                                </span>
                              </div>
                            )}
                            {!isActive && isWatched && (
                              <div className="absolute top-2 right-2">
                                <CircleCheck className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="flex-1 truncate text-left text-sm font-medium text-white">
                              {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                            </h4>
                            {isWatched && <CircleCheck className="h-4 w-4 flex-shrink-0 text-green-500" />}
                          </div>
                          <p className="text-left text-xs text-gray-400">{series.title}</p>
                        </button>
                        <AnimatePresence>
                          {hoveredEpisode === episode.episodeNumber && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute top-full left-0 right-0 z-20 mt-2 hidden rounded-lg border border-gray-700 bg-[#1a1a1a] p-3 lg:block"
                            >
                              <p className="line-clamp-4 text-xs text-gray-300">
                                {episode.episodeDescription || episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 lg:hidden">
                  {currentSeasonData?.episodes.map((episode) => {
                    const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;
                    const isWatched = isEpisodeWatched(episode.episodeNumber, currentSeason);

                    return (
                      <button
                        key={episode.episodeNumber}
                        onClick={() => handleEpisodeSelect(episode, currentSeason)}
                        className={`flex w-full items-center gap-3 rounded-lg p-2 transition-all ${
                          isActive ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        <div className={`relative aspect-video w-24 flex-shrink-0 overflow-hidden rounded ${
                          isActive ? "ring-2 ring-white" : isWatched ? "ring-1 ring-green-500" : "ring-1 ring-white/20"
                        }`}>
                          {episode.episodeThumbnail || series.poster ? (
                            <img
                              src={episode.episodeThumbnail || series.poster}
                              alt={episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                              <Play className="h-6 w-6 text-white/50" />
                            </div>
                          )}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <Play className="h-8 w-8 text-white" fill="white" />
                            </div>
                          )}
                          {isWatched && !isActive && (
                            <div className="absolute top-1 right-1">
                              <CircleCheck className="h-4 w-4 text-green-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">E{episode.episodeNumber}</span>
                            {isActive && (
                              <span className="rounded bg-[#e50914] px-1.5 py-0.5 text-[10px] font-medium text-white">
                                Playing
                              </span>
                            )}
                          </div>
                          <h4 className="truncate text-sm font-medium text-white">
                            {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                          </h4>
                        </div>
                        {isWatched && <CircleCheck className="h-5 w-5 flex-shrink-0 text-green-500" />}
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#141414]">
          <div className="px-4 pt-24">
            <div className="mx-auto max-w-6xl">
              <div className="aspect-video rounded-2xl bg-gray-800 animate-pulse" />
            </div>
          </div>
        </div>
      }
    >
      <SeriesWatchContent />
    </Suspense>
  );
}
