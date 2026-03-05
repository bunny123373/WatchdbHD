"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Download, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISeason, IEpisode } from "@/models/Content";
import { cn } from "@/utils/cn";
import { normalizeExternalUrl } from "@/utils/url";
import AdMobBanner from "./AdMobBanner";

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
                    const watchLink = seriesId
                      ? `/verify?id=${seriesId}&type=series&season=${season.seasonNumber}&episode=${episode.episodeNumber}`
                      : "#";
                    const episodeDownloadUrl = normalizeExternalUrl(episode.downloadLink);

                    return (
                      <motion.div
                        key={episodeId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="flex gap-4 p-4 hover:bg-[#1a1a1a] transition-colors border-b border-[#1a1a1a] last:border-b-0"
                      >
                        {/* Poster */}
                        <div className="flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden bg-[#1a1a1a] relative">
                          {seriesPoster ? (
                            <Image
                              src={seriesPoster}
                              alt={episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-gray-600" />
                            </div>
                          )}
                          <Link
                            href={watchLink}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#e50914] flex items-center justify-center">
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                          </Link>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-500 text-sm">
                              Episode {episode.episodeNumber}
                            </span>
                            {episode.quality && (
                              <span className="text-xs bg-[#e50914] text-white px-1.5 py-0.5 rounded">
                                {episode.quality}
                              </span>
                            )}
                          </div>
                          <h4 className="text-white font-medium mb-1">
                            {episode.episodeTitle || `Episode ${episode.episodeNumber}`}
                          </h4>
                          <p className="text-gray-500 text-sm line-clamp-2">
                            Watch {episode.episodeTitle || `Episode ${episode.episodeNumber}`} of this series online. 
                            Click play to start streaming now.
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-3">
                            <Link
                              href={watchLink}
                              className="flex items-center gap-2 px-3 py-1.5 bg-[#e50914] hover:bg-[#f40612] text-white text-sm rounded transition-colors"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              Play
                            </Link>
                            {episodeDownloadUrl && (
                              <a
                                href={episodeDownloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#333] hover:bg-[#444] text-white text-sm rounded transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </a>
                            )}
                          </div>
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

      <div className="mt-6">
        <AdMobBanner size="MEDIUM_RECTANGLE" />
      </div>
    </div>
  );
}
