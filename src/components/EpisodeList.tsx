"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Download, ChevronDown, Clock } from "lucide-react";
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
    <div className="space-y-3">
      {seasons.map((season) => (
        <div
          key={season.seasonNumber}
          className="bg-[#0f0f0f] rounded-lg overflow-hidden"
        >
          {/* Season Header */}
          <button
            onClick={() => toggleSeason(season.seasonNumber)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">
                Season {season.seasonNumber}
              </span>
              <span className="text-xs text-gray-500 bg-[#1a1a1a] px-2 py-1 rounded">
                {season.episodes.length} eps
              </span>
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
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-[#1a1a1a]">
                  {season.episodes.map((episode, index) => {
                    const episodeId = `${season.seasonNumber}-${episode.episodeNumber}`;
                    const isActive = currentEpisodeId === episodeId;
                    const watchLink = seriesId
                      ? `/verify?id=${seriesId}&type=series&season=${season.seasonNumber}&episode=${episode.episodeNumber}`
                      : "#";

                    return (
                      <motion.div
                        key={episodeId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          "flex items-center gap-4 p-3 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] last:border-b-0",
                          isActive && "bg-[#e50914]/10"
                        )}
                      >
                        {/* Episode Number */}
                        <div className="flex-shrink-0 w-8 flex items-center justify-center">
                          <span className="text-gray-500 font-medium text-sm">
                            {episode.episodeNumber}
                          </span>
                        </div>

                        {/* Episode Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium truncate">
                            {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            {episode.quality && (
                              <span className="text-gray-600">{episode.quality}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Link
                            href={watchLink}
                            className={cn(
                              "p-2 rounded transition-colors",
                              isActive
                                ? "bg-[#e50914] text-white"
                                : "text-gray-400 hover:text-white hover:bg-[#333]"
                            )}
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </Link>
                          {episode.downloadLink && (
                            <a
                              href={episode.downloadLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded text-gray-400 hover:text-white hover:bg-[#333] transition-colors"
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
  );
}
