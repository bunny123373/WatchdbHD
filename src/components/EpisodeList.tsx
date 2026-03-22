"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISeason, IEpisode } from "@/models/Content";
import { normalizeExternalUrl } from "@/utils/url";
import DownloadButton from "./DownloadButton";

interface EpisodeListProps {
  seasons: ISeason[];
  seriesPoster?: string;
  seriesId?: string;
}

export default function EpisodeList({
  seasons,
  seriesPoster,
  seriesId,
}: EpisodeListProps) {
  const [expandedSeason, setExpandedSeason] = useState<number>(
    seasons[0]?.seasonNumber || 1
  );
  const [hoveredEpisode, setHoveredEpisode] = useState<number | null>(null);
  const episodeRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [autoPlayedEpisode, setAutoPlayedEpisode] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`watched_${seriesId}`);
    if (saved) {
      const watched = new Set(JSON.parse(saved));
      const season = seasons.find(s => s.seasonNumber === expandedSeason);
      if (season) {
        const firstUnwatched = season.episodes.find(
          ep => !watched.has(`${expandedSeason}-${ep.episodeNumber}`)
        );
        if (firstUnwatched && autoPlayedEpisode !== firstUnwatched.episodeNumber) {
          setAutoPlayedEpisode(firstUnwatched.episodeNumber);
          setTimeout(() => {
            const el = episodeRefs.current.get(firstUnwatched.episodeNumber);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            }
          }, 100);
        }
      }
    }
  }, [expandedSeason, seasons, seriesId]);

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeason(seasonNumber);
    setAutoPlayedEpisode(null);
  };

  const currentSeason = seasons.find(s => s.seasonNumber === expandedSeason);
  const watchedCount = (seasonNum: number) => {
    const saved = localStorage.getItem(`watched_${seriesId}`);
    if (!saved) return 0;
    const watched = new Set(JSON.parse(saved));
    const season = seasons.find(s => s.seasonNumber === seasonNum);
    if (!season) return 0;
    return season.episodes.filter(ep => watched.has(`${seasonNum}-${ep.episodeNumber}`)).length;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {seasons.map((season) => (
          <button
            key={season.seasonNumber}
            onClick={() => toggleSeason(season.seasonNumber)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
              expandedSeason === season.seasonNumber
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            <span>Season {season.seasonNumber}</span>
            <span className={`text-xs ${expandedSeason === season.seasonNumber ? 'text-gray-500' : 'text-gray-400'}`}>
              {watchedCount(season.seasonNumber)}/{season.episodes.length}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={expandedSeason}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {currentSeason?.episodes.map((episode) => {
              const episodeId = `${expandedSeason}-${episode.episodeNumber}`;
              const watchLink = seriesId
                ? `/verify?id=${seriesId}&type=series&season=${expandedSeason}&episode=${episode.episodeNumber}`
                : "#";
              const episodeDownloadUrl = normalizeExternalUrl(episode.downloadLink);
              const isAutoPlayed = autoPlayedEpisode === episode.episodeNumber;

              return (
                <div
                  key={episodeId}
                  ref={(el) => {
                    if (el) episodeRefs.current.set(episode.episodeNumber, el);
                  }}
                  className={`flex-shrink-0 w-48 snap-start group relative transition-all ${
                    isAutoPlayed ? "scale-105" : "opacity-70 hover:opacity-100"
                  }`}
                  onMouseEnter={() => setHoveredEpisode(episode.episodeNumber)}
                  onMouseLeave={() => setHoveredEpisode(null)}
                >
                  <Link href={watchLink} className="block w-full">
                    <div className={`relative aspect-video rounded-lg overflow-hidden mb-2 ${
                      isAutoPlayed ? "ring-2 ring-white" : "ring-1 ring-white/20 group-hover:ring-white/50"
                    }`}>
                      {episode.episodeThumbnail || seriesPoster ? (
                        <Image
                          src={episode.episodeThumbnail || seriesPoster!}
                          alt={episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
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
                      {isAutoPlayed && (
                        <div className="absolute top-2 right-2">
                          <span className="text-[10px] px-2 py-0.5 bg-[#e50914] text-white rounded font-medium">
                            Playing
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-white truncate text-left flex-1">
                        {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-400 text-left truncate">
                      Season {expandedSeason}
                    </p>
                  </Link>
                  
                  <AnimatePresence>
                    {hoveredEpisode === episode.episodeNumber && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 p-3 bg-[#1a1a1a] rounded-lg border border-gray-700 z-20"
                      >
                        <Link
                          href={watchLink}
                          className="flex items-center justify-center gap-2 w-full mb-2 px-3 py-2 bg-[#e50914] hover:bg-[#f40612] text-white text-sm font-medium rounded transition-colors"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Play
                        </Link>
                        {episodeDownloadUrl && (
                          <DownloadButton
                            url={episodeDownloadUrl}
                            title={`Episode ${episode.episodeNumber}`}
                            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded transition-colors"
                          />
                        )}
                        <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                          {episode.episodeDescription || `Watch Episode ${episode.episodeNumber} of this series online.`}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
