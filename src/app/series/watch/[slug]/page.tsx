"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Download, Play, ChevronLeft, SkipForward, Check, CircleCheck, Tv, ListVideo, Clock3 } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
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

  const currentSeasonData = series?.seasons?.find((s) => s.seasonNumber === currentSeason);
  const currentEpisodeEmbedLink = activeServer === 2 ? currentEpisode?.embedIframeLink2 : currentEpisode?.embedIframeLink;
  const currentEpisodeDownloadUrl = normalizeExternalUrl(currentEpisode?.downloadLink);
  const totalEpisodes = currentSeasonData?.episodes.length || 0;

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(229,9,20,0.16),_transparent_20%),linear-gradient(180deg,_#020202_0%,_#070707_42%,_#020202_100%)]">
      <div className="fixed left-0 right-0 top-0 z-50 bg-gradient-to-b from-black via-black/90 to-transparent">
        <div
          className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 pb-3 pt-3 sm:px-6 lg:px-10"
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

      <div className="px-4 pb-12 pt-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-6">
            <WatchPlayerShell
              eyebrow="Watch Series"
              title={currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
              subtitle={currentEpisode?.episodeDescription || series.description || `Season ${currentSeason}, Episode ${currentEpisode?.episodeNumber}`}
              badges={
                <>
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200">
                    <Tv className="h-3.5 w-3.5" />
                    S{currentSeason}E{currentEpisode?.episodeNumber}
                  </span>
                  {currentEpisode?.quality && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-200">
                      <Play className="h-3.5 w-3.5 text-red-400" />
                      {currentEpisode.quality}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-200">
                    <Clock3 className="h-3.5 w-3.5 text-red-400" />
                    {getWatchedCountForSeason(currentSeason)}/{totalEpisodes} watched
                  </span>
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
                    <ListVideo className="w-4 h-4" />
                    {showEpisodeList ? "Hide Episodes" : "Browse Episodes"}
                  </button>
                </>
              }
            >
              <IframePlayer
                src={currentEpisodeEmbedLink}
                title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
              />
            </WatchPlayerShell>
          </div>

          {showEpisodeList && (
            <section className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 shadow-[0_18px_54px_rgba(0,0,0,0.22)] sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-400">Seasons</p>
                <div className="mt-4 space-y-2">
                  {series.seasons?.map((season) => (
                    <button
                      key={season.seasonNumber}
                      onClick={() => {
                        setCurrentSeason(season.seasonNumber);
                        if (season.episodes.length > 0) {
                          handleEpisodeSelect(season.episodes[0], season.seasonNumber);
                        }
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors ${
                        currentSeason === season.seasonNumber
                          ? "bg-white text-black"
                          : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      <span className="font-medium">Season {season.seasonNumber}</span>
                      <span className={`text-xs ${currentSeason === season.seasonNumber ? "text-black/60" : "text-white/45"}`}>
                        {getWatchedCountForSeason(season.seasonNumber)}/{season.episodes.length}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={playSeason}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e50914] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#f40612]"
                >
                  <Play className="h-4 w-4 fill-white" />
                  Continue Watching
                </button>
              </aside>

              <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_54px_rgba(0,0,0,0.22)] sm:p-5 lg:p-6">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-400">Episodes</p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Season {currentSeason}</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/75">
                    {totalEpisodes} episodes
                  </div>
                </div>

                <div className="space-y-3">
                  {currentSeasonData?.episodes.map((episode) => {
                    const isActive = currentEpisode?.episodeNumber === episode.episodeNumber;
                    const isWatched = isEpisodeWatched(episode.episodeNumber, currentSeason);

                    return (
                      <button
                        key={episode.episodeNumber}
                        onClick={() => handleEpisodeSelect(episode, currentSeason)}
                        className={`grid w-full gap-4 rounded-[24px] border p-3 text-left transition-colors sm:grid-cols-[220px_minmax(0,1fr)] sm:p-4 ${
                          isActive
                            ? "border-white/30 bg-white/[0.08]"
                            : "border-white/10 bg-black/20 hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className={`relative aspect-video overflow-hidden rounded-2xl ${
                          isActive ? "ring-2 ring-white/80" : isWatched ? "ring-1 ring-emerald-500/50" : "ring-1 ring-white/10"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          <div className="absolute left-3 top-3 rounded-full bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
                            Episode {episode.episodeNumber}
                          </div>
                          {isActive && (
                            <div className="absolute right-3 top-3 rounded-full bg-[#e50914] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                              Playing
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-semibold text-white sm:text-lg">
                              {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                            </h4>
                            {episode.quality && (
                              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/75">
                                {episode.quality}
                              </span>
                            )}
                            {isWatched && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                                <CircleCheck className="h-3.5 w-3.5" />
                                Watched
                              </span>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-300">
                            {episode.episodeDescription || `Continue watching ${series.title} from Episode ${episode.episodeNumber}.`}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
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
