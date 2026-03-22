"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Play, Download, Globe, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ISeason, IEpisode, ILanguageSource } from "@/models/Content";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { LANGUAGES } from "@/utils/constants";

interface SeasonEpisodeBuilderProps {
  seasons: ISeason[];
  onChange: (seasons: ISeason[]) => void;
}

export default function SeasonEpisodeBuilder({ seasons, onChange }: SeasonEpisodeBuilderProps) {
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);

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
          languageSources: [],
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

  const updateEpisodeLanguageSource = (
    seasonNumber: number,
    episodeNumber: number,
    langIndex: number,
    field: keyof ILanguageSource,
    value: string
  ) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        return {
          ...season,
          episodes: season.episodes.map((episode) => {
            if (episode.episodeNumber === episodeNumber) {
              const langSources = [...(episode.languageSources || [])];
              langSources[langIndex] = { ...langSources[langIndex], [field]: value };
              return { ...episode, languageSources: langSources };
            }
            return episode;
          }),
        };
      }
      return season;
    });
    onChange(updated);
  };

  const addEpisodeLanguageSource = (seasonNumber: number, episodeNumber: number) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        return {
          ...season,
          episodes: season.episodes.map((episode) => {
            if (episode.episodeNumber === episodeNumber) {
              return {
                ...episode,
                languageSources: [...(episode.languageSources || []), { language: "", hlsUrl: "", embedLink: "", downloadLink: "" }]
              };
            }
            return episode;
          }),
        };
      }
      return season;
    });
    onChange(updated);
  };

  const removeEpisodeLanguageSource = (seasonNumber: number, episodeNumber: number, langIndex: number) => {
    const updated = seasons.map((season) => {
      if (season.seasonNumber === seasonNumber) {
        return {
          ...season,
          episodes: season.episodes.map((episode) => {
            if (episode.episodeNumber === episodeNumber) {
              const langSources = (episode.languageSources || []).filter((_, i) => i !== langIndex);
              return { ...episode, languageSources: langSources };
            }
            return episode;
          }),
        };
      }
      return season;
    });
    onChange(updated);
  };

  const getEpisodeKey = (seasonNumber: number, episodeNumber: number) => `${seasonNumber}-${episodeNumber}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Seasons & Episodes</h3>
        <Button type="button" onClick={addSeason} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Add Season
        </Button>
      </div>

      {seasons.length === 0 && (
        <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
          <p className="text-gray-500">No seasons added yet. Click "Add Season" to start.</p>
        </div>
      )}

      <div className="space-y-3">
        {seasons.map((season) => (
          <div
            key={season.seasonNumber}
            className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
          >
            {/* Season Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() =>
                setExpandedSeason(expandedSeason === season.seasonNumber ? null : season.seasonNumber)
              }
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-white">
                  Season {season.seasonNumber}
                </span>
                <span className="text-sm text-gray-500">
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
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {expandedSeason === season.seasonNumber ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
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
                  <div className="border-t border-white/10 p-4 space-y-4">
                    {season.episodes.map((episode) => {
                      const episodeKey = getEpisodeKey(season.seasonNumber, episode.episodeNumber);
                      return (
                        <div key={episodeKey} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                          {/* Episode Header */}
                          <div
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedEpisode(expandedEpisode === episodeKey ? null : episodeKey)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-white text-sm">
                                E{episode.episodeNumber}: {episode.episodeTitle}
                              </span>
                              {episode.quality && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-gray-400 rounded">
                                  {episode.quality}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeEpisode(season.seasonNumber, episode.episodeNumber);
                                }}
                                className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              {expandedEpisode === episodeKey ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Episode Details */}
                          <AnimatePresence>
                            {expandedEpisode === episodeKey && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-white/10"
                              >
                                <div className="p-4 space-y-4">
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
                                      <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
                                      />
                                    </div>
                                    <div className="relative">
                                      <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                      <input
                                        type="text"
                                        placeholder="Embed URL 2"
                                        value={episode.embedIframeLink2}
                                        onChange={(e) =>
                                          updateEpisode(
                                            season.seasonNumber,
                                            episode.episodeNumber,
                                            "embedIframeLink2",
                                            e.target.value
                                          )
                                        }
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
                                      />
                                    </div>
                                    <div className="relative">
                                      <Download className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914] text-sm"
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
                                      className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#e50914] text-sm"
                                    >
                                      <option value="480p">480p</option>
                                      <option value="720p">720p</option>
                                      <option value="1080p">1080p</option>
                                      <option value="4K">4K</option>
                                    </select>
                                  </div>

                                  {/* Language-wise Sources */}
                                  <div className="border-t border-white/10 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        Language Sources
                                      </h4>
                                      <button
                                        type="button"
                                        onClick={() => addEpisodeLanguageSource(season.seasonNumber, episode.episodeNumber)}
                                        className="text-xs text-[#e50914] hover:text-[#b2070f] flex items-center gap-1"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add Language
                                      </button>
                                    </div>

                                    {(episode.languageSources || []).map((langSource, langIndex) => (
                                      <div key={langIndex} className="p-3 bg-white/5 rounded-lg space-y-2 mb-2">
                                        <div className="flex items-center gap-2">
                                          <select
                                            value={langSource.language}
                                            onChange={(e) =>
                                              updateEpisodeLanguageSource(
                                                season.seasonNumber,
                                                episode.episodeNumber,
                                                langIndex,
                                                "language",
                                                e.target.value
                                              )
                                            }
                                            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm focus:outline-none focus:border-[#e50914]"
                                          >
                                            <option value="">Select Language</option>
                                            {LANGUAGES.map((lang) => (
                                              <option key={lang} value={lang}>{lang}</option>
                                            ))}
                                          </select>
                                          <button
                                            type="button"
                                            onClick={() => removeEpisodeLanguageSource(season.seasonNumber, episode.episodeNumber, langIndex)}
                                            className="p-1.5 text-gray-500 hover:text-red-500 transition-colors ml-auto"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <input
                                          type="text"
                                          placeholder="HLS/MP4 URL"
                                          value={langSource.hlsUrl}
                                          onChange={(e) =>
                                            updateEpisodeLanguageSource(
                                              season.seasonNumber,
                                              episode.episodeNumber,
                                              langIndex,
                                              "hlsUrl",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#e50914]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Embed URL"
                                          value={langSource.embedLink}
                                          onChange={(e) =>
                                            updateEpisodeLanguageSource(
                                              season.seasonNumber,
                                              episode.episodeNumber,
                                              langIndex,
                                              "embedLink",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#e50914]"
                                        />
                                        <input
                                          type="text"
                                          placeholder="Download URL"
                                          value={langSource.downloadLink}
                                          onChange={(e) =>
                                            updateEpisodeLanguageSource(
                                              season.seasonNumber,
                                              episode.episodeNumber,
                                              langIndex,
                                              "downloadLink",
                                              e.target.value
                                            )
                                          }
                                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#e50914]"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}

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
