"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Play, ChevronLeft, Check, CircleCheck, ListVideo, ChevronDown, ChevronUp } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import { normalizeExternalUrl } from "@/utils/url";

interface SeriesWatchClientProps {
  series: IContent;
  initialSeason?: number;
  initialEpisode?: number;
}

export default function SeriesWatchClient({
  series,
  initialSeason,
  initialEpisode,
}: SeriesWatchClientProps) {
  const [currentSeason, setCurrentSeason] = useState<number>(initialSeason || 1);
  const [currentEpisode, setCurrentEpisode] = useState<IEpisode | null>(null);
  const [showEpisodeList, setShowEpisodeList] = useState(true);
  const [activeServer, setActiveServer] = useState<1 | 2>(1);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([initialSeason || 1]);

  useEffect(() => {
    setActiveServer(1);
    const saved = localStorage.getItem(`watched_${series._id}`);
    if (saved) {
      // watched episodes loaded
    }
  }, [series._id]);

  useEffect(() => {
    const requestedSeason = initialSeason || series.seasons?.[0]?.seasonNumber || 1;
    const season = series.seasons?.find((item) => item.seasonNumber === requestedSeason) || series.seasons?.[0];
    const requestedEpisode = initialEpisode
      ? season?.episodes.find((item) => item.episodeNumber === initialEpisode)
      : season?.episodes[0];

    if (season) {
      setCurrentSeason(season.seasonNumber);
      setCurrentEpisode(requestedEpisode || season.episodes[0] || null);
    }
  }, [initialEpisode, initialSeason, series]);

  const handleEpisodeSelect = (episode: IEpisode, seasonNumber: number) => {
    setCurrentSeason(seasonNumber);
    setCurrentEpisode(episode);
    setActiveServer(1);

    const url = new URL(window.location.href);
    url.searchParams.set("season", seasonNumber.toString());
    url.searchParams.set("episode", episode.episodeNumber.toString());
    window.history.replaceState({}, "", url);
  };

  const toggleSeason = (seasonNum: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonNum) 
        ? prev.filter(n => n !== seasonNum)
        : [...prev, seasonNum]
    );
  };

  const currentSeasonData = series.seasons?.find((item) => item.seasonNumber === currentSeason);
  const currentEpisodeEmbedLink = activeServer === 2 ? currentEpisode?.embedIframeLink2 : currentEpisode?.embedIframeLink;
  const currentEpisodeDownloadUrl = normalizeExternalUrl(currentEpisode?.downloadLink);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/series/${String(series._id)}`}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{series.title?.slice(0, 20)}{series.title && series.title.length > 20 ? "..." : ""}</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
              S{currentSeason}E{currentEpisode?.episodeNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Player Section */}
      <div className="pt-14">
        <IframePlayer
          src={currentEpisodeEmbedLink}
          title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
        />
      </div>

      {/* Info & Episodes */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Current Episode Info */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {currentEpisode?.episodeTitle || `Episode ${currentEpisode?.episodeNumber}`}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
            <span className="text-white/70">Season {currentSeason}, Episode {currentEpisode?.episodeNumber}</span>
            {currentEpisode?.quality && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                {currentEpisode.quality}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setActiveServer(1)}
            className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
              activeServer === 1
                ? "bg-[#e50914] text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            Server 1
          </button>
          {currentEpisode?.embedIframeLink2 && (
            <button
              onClick={() => setActiveServer(2)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                activeServer === 2
                  ? "bg-[#e50914] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              Server 2
            </button>
          )}
          {currentEpisodeDownloadUrl && (
            <a
              href={currentEpisodeDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-sm text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          )}
          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
              showEpisodeList
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/20"
            }`}
          >
            <ListVideo className="w-4 h-4" />
            {showEpisodeList ? "Hide" : "Episodes"}
          </button>
        </div>

        {/* Episode List */}
        {showEpisodeList && (
          <div className="space-y-4">
            {series.seasons?.map((season) => {
              const isExpanded = expandedSeasons.includes(season.seasonNumber);
              
              return (
                <div key={season.seasonNumber} className="border border-white/10 rounded-md overflow-hidden">
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
                      {season.episodes.map((episode) => {
                        const isActive = currentEpisode?.episodeNumber === episode.episodeNumber && currentSeason === season.seasonNumber;
                        
                        return (
                          <button
                            key={episode.episodeNumber}
                            onClick={() => handleEpisodeSelect(episode, season.seasonNumber)}
                            className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                              isActive
                                ? "bg-[#e50914]/20"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <span className={`text-sm font-medium w-8 ${isActive ? "text-[#e50914]" : "text-gray-400"}`}>
                              {episode.episodeNumber}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-white/80"}`}>
                                {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                              </p>
                              {episode.episodeDescription && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {episode.episodeDescription}
                                </p>
                              )}
                            </div>
                            {episode.quality && (
                              <span className="text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded-sm">
                                {episode.quality}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
