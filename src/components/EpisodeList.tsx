"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Download, ChevronDown, Tv, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISeason, IEpisode } from "@/models/Content";
import { cn } from "@/utils/cn";

interface EpisodeListProps {
  seasons: ISeason[];
  currentEpisodeId?: string;
  seriesId?: string;
}

export default function EpisodeList({
  seasons,
  currentEpisodeId,
  seriesId,
}: EpisodeListProps) {
  const [expandedSeason, setExpandedSeason] = useState<number>(
    seasons[0]?.seasonNumber || 1
  );

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeason(expandedSeason === seasonNumber ? 0 : seasonNumber);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        Episodes
        <span className="text-sm font-normal text-gray-400">
          ({seasons.reduce((acc, s) => acc + s.episodes.length, 0)} total)
        </span>
      </h3>

      <div className="space-y-3">
        {seasons.map((season) => (
          <div
            key={season.seasonNumber}
            className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden"
          >
            {/* Season Header */}
            <button
              onClick={() => toggleSeason(season.seasonNumber)}
              className="w-full flex items-center justify-between p-4 hover:bg-[#252525] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#e50914] flex items-center justify-center">
                  <Tv className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <span className="text-lg font-semibold text-white">
                    Season {season.seasonNumber}
                  </span>
                  <p className="text-xs text-gray-400">
                    {season.episodes.length}{" "}
                    {season.episodes.length === 1 ? "Episode" : "Episodes"}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-gray-400 transition-transform duration-300",
                  expandedSeason === season.seasonNumber && "rotate-180"
                )}
              />
            </button>

            {/* Episodes */}
            <AnimatePresence>
              {expandedSeason === season.seasonNumber && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-[#2a2a2a]">
                    {season.episodes.map((episode, index) => {
                      const episodeId = `${season.seasonNumber}-${episode.episodeNumber}`;
                      const isActive = currentEpisodeId === episodeId;
                      const watchLink = seriesId
                        ? `/verify?id=${seriesId}&type=series&season=${season.seasonNumber}&episode=${episode.episodeNumber}`
                        : "#";

                      return (
                        <motion.div
                          key={episodeId}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className={cn(
                            "flex items-center gap-3 p-3 hover:bg-[#252525] transition-colors border-b border-[#2a2a2a] last:border-b-0",
                            isActive && "bg-[#e50914]/10 border-l-4 border-l-[#e50914]"
                          )}
                        >
                          {/* Episode Number */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#333] flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-300">
                              {episode.episodeNumber}
                            </span>
                          </div>

                          {/* Episode Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white truncate text-sm">
                              {episode.episodeTitle}
                            </h4>
                            {episode.quality && (
                              <span className="text-xs text-gray-500">
                                {episode.quality}
                              </span>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={watchLink}
                              className={cn(
                                "p-2 rounded-lg transition-all",
                                isActive
                                  ? "bg-[#e50914] text-white"
                                  : "bg-[#333] text-gray-300 hover:bg-[#e50914] hover:text-white"
                              )}
                            >
                              <Play className="w-4 h-4 fill-current" />
                            </Link>
                            {episode.downloadLink && (
                              <a
                                href={episode.downloadLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[#333] text-gray-300 hover:bg-[#e50914] hover:text-white transition-all"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
