"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Download, ChevronLeft, ListVideo, ChevronDown, ChevronUp, SkipForward } from "lucide-react";
import { IContent, IEpisode } from "@/models/Content";
import IframePlayer from "@/components/IframePlayer";
import HlsPlayer from "@/components/HlsPlayer";
import WatchPlayerShell from "@/components/WatchPlayerShell";
import AudioTrackSelector from "@/components/AudioTrackSelector";
import { normalizeExternalUrl, isDirectFileUrl, isAudioFileUrl, getFileExtension, downloadFile } from "@/utils/url";
import { AudioTrack } from "@/hooks/useAudioTracks";

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
  const [langServer, setLangServer] = useState<1 | 2>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([initialSeason || 1]);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeAudioTrackId, setActiveAudioTrackId] = useState<number>(0);
  const playerRef = useRef<{ playNext: () => void } | null>(null);

  const handleAudioTracksChange = useCallback((tracks: AudioTrack[], activeTrackId: number) => {
    setAudioTracks(tracks);
    setActiveAudioTrackId(activeTrackId);
  }, []);

  useEffect(() => {
    setActiveServer(1);
    setLangServer(1);
    setSelectedLanguage("");
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
    setLangServer(1);
    setSelectedLanguage("");

    const url = new URL(window.location.href);
    url.searchParams.set("season", seasonNumber.toString());
    url.searchParams.set("episode", episode.episodeNumber.toString());
    window.history.replaceState({}, "", url);
  };

  const handleDownload = (url: string, filename?: string) => {
    if (isDirectFileUrl(url)) {
      const ext = getFileExtension(url) || ".mp4";
      downloadFile(url, filename || `${series.title}${ext}`);
    } else {
      window.open(url, "_blank");
    }
  };

  const toggleSeason = (seasonNum: number) => {
    setExpandedSeasons(prev => 
      prev.includes(seasonNum) 
        ? prev.filter(n => n !== seasonNum)
        : [...prev, seasonNum]
    );
  };

  const getNextEpisode = (): { episode: IEpisode; season: number } | null => {
    const currentSeasonData = series.seasons?.find((item) => item.seasonNumber === currentSeason);
    if (!currentSeasonData || !currentEpisode) return null;

    const currentEpIndex = currentSeasonData.episodes.findIndex(ep => ep.episodeNumber === currentEpisode.episodeNumber);
    
    if (currentEpIndex < currentSeasonData.episodes.length - 1) {
      return { episode: currentSeasonData.episodes[currentEpIndex + 1], season: currentSeason };
    }

    const nextSeason = series.seasons?.find(s => s.seasonNumber === currentSeason + 1);
    if (nextSeason && nextSeason.episodes.length > 0) {
      return { episode: nextSeason.episodes[0], season: currentSeason + 1 };
    }

    return null;
  };

  const handleVideoEnded = () => {
    if (!autoPlayNext) return;
    const next = getNextEpisode();
    if (next) {
      handleEpisodeSelect(next.episode, next.season);
    }
  };

  const playNextEpisode = () => {
    const next = getNextEpisode();
    if (next) {
      handleEpisodeSelect(next.episode, next.season);
    }
  };

  const currentSeasonData = series.seasons?.find((item) => item.seasonNumber === currentSeason);
  const episodeLanguageSources = currentEpisode?.languageSources || [];
  const availableLanguages = episodeLanguageSources.filter(ls => ls.hlsUrl || ls.embedLink);
  
  const selectedLangSource = selectedLanguage
    ? availableLanguages.find(ls => ls.language === selectedLanguage)
    : null;
  
  const langEmbedLink = langServer === 2 && selectedLangSource?.embedLink?.includes('/embed/') 
    ? selectedLangSource.embedLink.replace('/embed/', '/embed-2/') 
    : selectedLangSource?.embedLink;
  
  const primaryEmbedLink = activeServer === 2 ? currentEpisode?.embedIframeLink2 : currentEpisode?.embedIframeLink;
  const currentHlsUrl = selectedLangSource?.hlsUrl || currentEpisode?.hlsUrl;
  const currentEmbedLink = selectedLangSource ? langEmbedLink : primaryEmbedLink;
  const currentDownloadUrl = normalizeExternalUrl(selectedLangSource?.downloadLink || currentEpisode?.downloadLink);

  const isAudioFile = currentEmbedLink ? isAudioFileUrl(currentEmbedLink) : false;
  const directFileUrl = isAudioFile ? currentEmbedLink : undefined;

  const hasVideo = currentEpisode?.hlsUrl || currentEpisode?.embedIframeLink || availableLanguages.length > 0;

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
        </div>
      </div>

      {/* Player Section */}
      <div className="pt-14 px-2 sm:px-3 lg:px-4 pb-4">
        <WatchPlayerShell
          eyebrow="Now Playing"
          title={`${series.title}`}
          subtitle={`Season ${currentSeason}, Episode ${currentEpisode?.episodeNumber}${currentEpisode?.episodeTitle ? ` - ${currentEpisode.episodeTitle}` : ""}`}
          badges={
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-[#e50914] text-white rounded-sm">
                S{currentSeason}E{currentEpisode?.episodeNumber}
              </span>
              {currentEpisode?.quality && (
                <span className="px-2.5 py-1 text-[10px] font-medium bg-white/10 text-white/70 rounded-sm">
                  {currentEpisode.quality}
                </span>
              )}
              {currentHlsUrl && (
                <span className="px-2.5 py-1 text-[10px] font-medium bg-green-600/20 text-green-400 rounded-sm">
                  HLS
                </span>
              )}
            </div>
          }
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {currentDownloadUrl && (
                <button
                  onClick={() => handleDownload(currentDownloadUrl)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
              {getNextEpisode() && (
                <button
                  onClick={playNextEpisode}
                  className="flex items-center gap-2 px-4 py-2 bg-[#e50914] hover:bg-[#b8070f] text-white rounded-sm text-sm font-medium transition-colors"
                >
                  <SkipForward className="w-4 h-4" />
                  Next Episode
                </button>
              )}
              <button
                onClick={() => setAutoPlayNext(!autoPlayNext)}
                className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                  autoPlayNext 
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Auto-Play: {autoPlayNext ? "On" : "Off"}
              </button>
            </div>
          }
        >
          {currentHlsUrl ? (
            <HlsPlayer 
              src={currentHlsUrl} 
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`} 
              poster={series.poster}
              onEnded={handleVideoEnded}
              onAudioTracksChange={handleAudioTracksChange}
            />
          ) : directFileUrl ? (
            <HlsPlayer 
              src={directFileUrl} 
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`} 
              poster={series.poster}
              onEnded={handleVideoEnded}
              onAudioTracksChange={handleAudioTracksChange}
            />
          ) : currentEmbedLink ? (
            <IframePlayer
              src={currentEmbedLink}
              title={`${series.title} - ${currentEpisode?.episodeTitle || "Episode"}`}
              autoPlay={series.autoPlay}
            />
          ) : hasVideo ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 mb-4">Select a language to play</p>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-black flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/50 mb-4">No stream available</p>
              </div>
            </div>
          )}
        </WatchPlayerShell>
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
          {/* Main Server Selection */}
          {currentEpisode?.embedIframeLink && !selectedLanguage && (
            <>
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
            </>
          )}

          {/* Language Source Server Selection */}
          {selectedLangSource?.embedLink && (
            <>
              <span className="text-white/50 text-sm py-2">{selectedLanguage}:</span>
              <button
                onClick={() => setLangServer(1)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  langServer === 1
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Server 1
              </button>
              <button
                onClick={() => setLangServer(2)}
                className={`px-4 py-2 text-sm font-medium rounded-sm transition-colors ${
                  langServer === 2
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Server 2
              </button>
            </>
          )}

          {currentDownloadUrl && (
            <button
              onClick={() => handleDownload(currentDownloadUrl)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/70 hover:bg-white/20 rounded-sm text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
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

        {/* Language Selection */}
        {availableLanguages.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="text-white/50 text-sm py-2">Audio:</span>
            {(currentEpisode?.hlsUrl || currentEpisode?.embedIframeLink) && (
              <button
                onClick={() => setSelectedLanguage("")}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  !selectedLanguage
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                Default
              </button>
            )}
            {availableLanguages.map((lang) => (
              <button
                key={lang.language}
                onClick={() => {
                  setSelectedLanguage(lang.language);
                  setLangServer(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  selectedLanguage === lang.language
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {lang.language}
              </button>
            ))}
          </div>
        )}

        {/* Embedded Audio Track Selection */}
        {audioTracks.length > 1 && (
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <AudioTrackSelector
              tracks={audioTracks}
              activeTrackId={activeAudioTrackId}
              onTrackChange={setActiveAudioTrackId}
              variant="inline"
              showLabel={true}
            />
          </div>
        )}

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
                        const hasLangSources = episode.languageSources && episode.languageSources.some(ls => ls.hlsUrl || ls.embedLink);
                        
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
                            <div className="flex items-center gap-2">
                              {hasLangSources && (
                                <span className="text-[10px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-sm">
                                  MULTI
                                </span>
                              )}
                              {episode.quality && (
                                <span className="text-[10px] font-bold bg-white/10 text-white/60 px-1.5 py-0.5 rounded-sm">
                                  {episode.quality}
                                </span>
                              )}
                            </div>
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
