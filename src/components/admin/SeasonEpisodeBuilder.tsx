"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Play, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISeason, IEpisode } from "@/models/Content";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

interface SeasonEpisodeBuilderProps {
  seasons: ISeason[];
  onChange: (seasons: ISeason[]) => void;
}

export default function SeasonEpisodeBuilder({ seasons, onChange }: SeasonEpisodeBuilderProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  const addSeason = () => {
    const newSeason: ISeason = {
      seasonNumber: seasons.length + 1,
      episodes: [],
    };
    onChange([...seasons, newSeason]);
    setExpandedSeason(newSeason.seasonNumber);
  };

  const removeSeason = (seasonNumber: number) => {
    const updated = seasons
      .filter((s) => s.seasonNumber !== seasonNumber)
      .map((s, index) => ({ ...s, seasonNumber: index + 1 }));
    onChange(updated);
  };

  const addEpisode = (seasonNumber: number) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        const newEpisode: IEpisode = {
          episodeNumber: season.episodes.length + 1,
          episodeTitle: `Episode ${season.episodes.length + 1}`,
          embedIframeLink: "",
          embedIframeLink2: "",
          downloadLink: "",
          quality: "720p",
        };
        return { ...season, episodes: [...season.episodes, newEpisode] };
      }
      return season;
    });
    onChange(updated);
  };

  const removeEpisode = (seasonNumber: number, episodeNumber: number) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        const filtered = season.episodes.filter((e) => e.episodeNumber !== episodeNumber);
        return {
          ...season,
          episodes: filtered.map((e, index) => ({ ...e, episodeNumber: index + 1 })),
        };
      }
      return season;
    });
    onChange(updated);
  };

  const updateEpisode = (
    seasonNumber: number,
    episodeNumber: number,
    field: keyof IEpisode,
    value: string
  ) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        return {
          ...season,
          episodes: season.episodes.map((episode) =>
            episode.episodeNumber === episodeNumber ? { ...episode, [field]: value } : episode
          ),
        };
      }
      return season;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Seasons & Episodes</h3>
        <Button type="button" onClick={addSeason} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Season
        </Button>
      </div>

      {seasons.length === 0 && (
        <div className="text-center py-8 bg-card rounded-xl border border-dashed border-border">
          <p className="text-text-muted">No seasons added yet. Click "Add Season" to start.</p>
        </div>
      )}

      <div className="space-y-3">
        {seasons.map((season) => (
          <div
            key={season.seasonNumber}
            className="bg-card rounded-xl border border-border overflow-hidden"
          >
            {/* Season Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-border/30 transition-colors"
              onClick={() =>
                setExpandedSeason(expandedSeason === season.seasonNumber ? null : season.seasonNumber)
              }
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-text-primary">
                  Season {season.seasonNumber}
                </span>
                <span className="text-sm text-text-muted">
                  ({season.episodes.length} {season.episodes.length === 1 ? "episode" : "episodes"})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSeason(season.seasonNumber);
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedSeason === season.seasonNumber ? (
                  <ChevronUp className="w-5 h-5 text-text-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-text-muted" />
                )}
              </div>
            </div>

            {/* Episodes */}
            <AnimatePresence>
              {expandedSeason === season.seasonNumber && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border p-4 space-y-4">
                    {season.episodes.map((episode) => (
                      <div
                        key={episode.episodeNumber}
                        className="bg-background rounded-xl p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-text-primary">
                            Episode {episode.episodeNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeEpisode(season.seasonNumber, episode.episodeNumber)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <Input
                          placeholder="Episode Title"
                          value={episode.episodeTitle}
                          onChange={(e) =>
                            updateEpisode(
                              season.seasonNumber,
                              episode.episodeNumber,
                              "episodeTitle",
                              e.target.value
                            )
                          }
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                          <div className="relative">
                            <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type="text"
                              placeholder="Embed URL 1"
                              value={episode.embedIframeLink}
                              onChange={(e) =>
                                updateEpisode(
                                  season.seasonNumber,
                                  episode.episodeNumber,
                                  "embedIframeLink",
                                  e.target.value
                                )
                              }
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary-gold text-sm"
                            />
                          </div>
                          <div className="relative">
                            <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type="text"
                              placeholder="Embed URL 2 (Backup)"
                              value={episode.embedIframeLink2 || ""}
                              onChange={(e) =>
                                updateEpisode(
                                  season.seasonNumber,
                                  episode.episodeNumber,
                                  "embedIframeLink2",
                                  e.target.value
                                )
                              }
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary-gold text-sm"
                            />
                          </div>
                          <div className="relative">
                            <Download className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                              type="text"
                              placeholder="Download URL"
                              value={episode.downloadLink}
                              onChange={(e) =>
                                updateEpisode(
                                  season.seasonNumber,
                                  episode.episodeNumber,
                                  "downloadLink",
                                  e.target.value
                                )
                              }
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-primary-gold text-sm"
                            />
                          </div>
                          <select
                            value={episode.quality}
                            onChange={(e) =>
                              updateEpisode(
                                season.seasonNumber,
                                episode.episodeNumber,
                                "quality",
                                e.target.value
                              )
                            }
                            className="px-4 py-2.5 rounded-xl bg-card border border-border text-text-primary focus:outline-none focus:border-primary-gold text-sm"
                          >
                            <option value="480p">480p</option>
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                            <option value="4K">4K</option>
                          </select>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => addEpisode(season.seasonNumber)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Episode
                    </Button>
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
