"use client";

import { useState } from "react";
import { Upload, X, Plus, Sparkles, ChevronDown, Check, Link } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LANGUAGES, TMDB_GENRES, AUDIO_LANGUAGES } from "@/utils/constants";
import { ISeason } from "@/models/Content";
import SeasonEpisodeBuilder from "./SeasonEpisodeBuilder";
import TMDBSearch from "./TMDBSearch";

interface UploadSeriesFormProps {
  onSuccess?: () => void;
}

export default function UploadSeriesForm({ onSuccess }: UploadSeriesFormProps) {
  const [showTMDBSearch, setShowTMDBSearch] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  const handleTMDBFill = (result: { tmdbId?: number; title: string; poster: string; banner: string; description: string; year: string; rating: number; genreIds?: number[]; genres?: string[]; originalLanguage?: string }) => {
    const selectedGenres = TMDB_GENRES.filter(g => result.genreIds?.includes(g.id));
    setSelectedGenres(selectedGenres);
    
    const languageMap: Record<string, string> = {
      te: "Telugu",
      hi: "Hindi",
      ta: "Tamil",
      ml: "Malayalam",
      kn: "Kannada",
      en: "English",
      ko: "Korean",
      ja: "Japanese",
      zh: "Chinese",
      es: "Spanish",
    };
    
    const detectedLanguage = result.originalLanguage ? languageMap[result.originalLanguage] || "Telugu" : "Telugu";
    
    setFormData((prev) => ({
      ...prev,
      title: result.title || prev.title,
      poster: result.poster || prev.poster,
      banner: result.banner || prev.banner,
      description: result.description || prev.description,
      year: result.year || prev.year,
      rating: result.rating ? String(result.rating) : prev.rating,
      language: detectedLanguage,
      category: "Web Series",
      tags: result.genres && result.genres.length > 0 ? [...new Set([...prev.tags, ...result.genres])] : prev.tags,
    }));
    setTmdbData({
      tmdbId: result.tmdbId || 0,
      genreIds: result.genreIds || [],
      genres: result.genres || [],
    });
    setShowTMDBSearch(false);
  };

  const [tmdbData, setTmdbData] = useState({
    tmdbId: 0,
    genreIds: [] as number[],
    genres: [] as string[],
  });

  const [isAutoFilling, setIsAutoFilling] = useState(false);

  const handleAutoFillEpisodes = async () => {
    if (!tmdbData.tmdbId) {
      setMessage("Please search and select a series from TMDB first");
      return;
    }

    setIsAutoFilling(true);
    setMessage("Fetching series details...");

    try {
      const newSeasons: ISeason[] = [];
      
      // Fetch TV show details to get number of seasons
      const response = await fetch(`/api/tmdb?action=details&type=series&id=${tmdbData.tmdbId}`);
      const data = await response.json();
      
      if (!data.success) {
        setMessage("Could not fetch series details from TMDB");
        setIsAutoFilling(false);
        return;
      }
      
      // Get seasons from the series data
      const seasonsData = data.data?.seasons || [];
      const validSeasons = seasonsData.filter((s: any) => s.season_number > 0);
      
      if (validSeasons.length === 0) {
        setMessage("No seasons found for this series");
        setIsAutoFilling(false);
        return;
      }
      
      setMessage(`Auto-filling episodes for ${validSeasons.length} seasons...`);
      
      for (const season of validSeasons.slice(0, 5)) {
        const s = season.season_number;
        const epCount = season.episode_count || 6;
        
        // Fetch season details to get episode titles
        let seasonDetails: any = null;
        try {
          const seasonRes = await fetch(`/api/tmdb?action=season&seriesId=${tmdbData.tmdbId}&seasonNumber=${s}`);
          const seasonData = await seasonRes.json();
          if (seasonData.success) {
            seasonDetails = seasonData.data;
          }
        } catch (e) {
          console.log("Could not fetch season details");
        }
        
        const episodes = [];
        
        for (let e = 1; e <= Math.min(epCount, 12); e++) {
          const episodeInfo = seasonDetails?.episodes?.find((ep: any) => ep.episode_number === e);
          
          const embedResponse = await fetch("/api/embed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tmdbId: tmdbData.tmdbId,
              type: "series",
              season: s,
              episode: e,
            }),
          });
          const embedData = await embedResponse.json();
          
          episodes.push({
            episodeNumber: e,
            episodeTitle: episodeInfo?.name || `Episode ${e}`,
            embedIframeLink: embedData.success ? embedData.embedUrl : "",
            embedIframeLink2: "",
            downloadLink: "",
          });
        }
        
        newSeasons.push({
          seasonNumber: s,
          episodes,
        });
      }
      
      setSeasons(newSeasons);
      setMessage(`Auto-filled ${newSeasons.length} seasons with episode titles and embed links!`);
    } catch (error) {
      console.error("Auto-fill error:", error);
      setMessage("Error auto-filling episodes");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const [selectedGenres, setSelectedGenres] = useState<{ id: number; name: string }[]>([]);

  const toggleGenre = (genre: { id: number; name: string }) => {
    setSelectedGenres(prev => {
      const exists = prev.find(g => g.id === genre.id);
      if (exists) {
        return prev.filter(g => g.id !== genre.id);
      }
      return [...prev, genre];
    });
  };

  const [formData, setFormData] = useState({
    title: "",
    poster: "",
    banner: "",
    description: "",
    year: "",
    language: "Telugu",
    audioLanguages: [] as string[],
    rating: "",
    tags: [] as string[],
  });
  const [selectedAudioLanguages, setSelectedAudioLanguages] = useState<string[]>([]);
  const [seasons, setSeasons] = useState<ISeason[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (seasons.length === 0) {
      setMessage("Please add at least one season with episodes");
      setIsLoading(false);
      return;
    }

    try {
      const adminKey = sessionStorage.getItem("adminKey");
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey || "",
        },
        body: JSON.stringify({
          type: "series",
          ...formData,
          audioLanguages: selectedAudioLanguages.length > 0 ? selectedAudioLanguages : undefined,
          category: "Web Series",
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
          seasons,
          tmdbId: tmdbData.tmdbId || undefined,
          tmdbGenreIds: selectedGenres.length > 0 ? selectedGenres.map(g => g.id) : (tmdbData.genreIds.length > 0 ? tmdbData.genreIds : undefined),
          tmdbGenres: selectedGenres.length > 0 ? selectedGenres.map(g => g.name) : (tmdbData.genres.length > 0 ? tmdbData.genres : undefined),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Series uploaded successfully!");
        
        const seriesTitle = formData.title;
        
        setFormData({
          title: "",
          poster: "",
          banner: "",
          description: "",
          year: "",
          language: "Telugu",
          audioLanguages: [],
          rating: "",
          tags: [],
        });
        setSeasons([]);
        setSelectedGenres([]);
        setSelectedAudioLanguages([]);
        setTmdbData({ tmdbId: 0, genreIds: [], genres: [] });
        
        const notification = {
          id: Date.now().toString(),
          title: "New Series Added",
          body: `${seriesTitle} is now available to watch!`,
          time: "Just now",
        };
        const saved = localStorage.getItem("notifications");
        let notifications = saved ? JSON.parse(saved) : [];
        notifications.unshift(notification);
        notifications = notifications.slice(0, 50);
        localStorage.setItem("notifications", JSON.stringify(notifications));
        
        window.dispatchEvent(new CustomEvent("watchdb-notification", { detail: notification }));
        
        onSuccess?.();
      } else {
        setMessage(data.error || "Failed to upload series");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1f1f1f] rounded-lg p-3 sm:p-4 lg:p-6 space-y-4 lg:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#e50914]" />
          Upload Web Series
        </h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowTMDBSearch(!showTMDBSearch)}
          className="flex items-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          Auto Fill
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoFillEpisodes}
          disabled={isAutoFilling || !tmdbData.tmdbId}
          className="flex items-center gap-2 text-sm"
        >
          <Link className="w-4 h-4" />
          {isAutoFilling ? "Filling..." : "Auto Fill Episodes"}
        </Button>
      </div>

      {showTMDBSearch && (
        <div className="p-3 sm:p-4 bg-[#141414] rounded-lg border border-[#333]">
          <TMDBSearch type="series" onSelect={handleTMDBFill} />
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-lg ${message.includes("success") ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Title */}
        <Input
          label="Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter series title"
        />

        {/* Year */}
        <Input
          label="Year"
          name="year"
          value={formData.year}
          onChange={handleChange}
          placeholder="e.g., 2024"
        />

        {/* Poster URL */}
        <Input
          label="Poster URL *"
          name="poster"
          value={formData.poster}
          onChange={handleChange}
          required
          placeholder="https://example.com/poster.jpg"
        />

        {/* Banner URL */}
        <Input
          label="Banner URL"
          name="banner"
          value={formData.banner}
          onChange={handleChange}
          placeholder="https://example.com/banner.jpg"
        />

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white focus:outline-none focus:border-[#e50914] text-sm"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        {/* Audio Languages */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Audio Languages</label>
          <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-[#141414] border border-[#333] min-h-[42px]">
            {AUDIO_LANGUAGES.map((lang) => {
              const isSelected = selectedAudioLanguages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    setSelectedAudioLanguages(prev => 
                      isSelected 
                        ? prev.filter(l => l !== lang)
                        : [...prev, lang]
                    );
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    isSelected 
                      ? "bg-[#e50914] text-white" 
                      : "bg-[#333] text-gray-400 hover:bg-[#444]"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
          {selectedAudioLanguages.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">Selected: {selectedAudioLanguages.join(", ")}</p>
          )}
        </div>

        {/* Rating */}
        <Input
          label="Rating (0-10)"
          name="rating"
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          placeholder="e.g., 8.5"
        />

        {/* TMDB Genre Selection */}
        <div className="relative">
          <label className="block text-sm font-medium text-[#808080] mb-1.5">TMDB Genres</label>
          <button
            type="button"
            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white focus:outline-none focus:border-[#e50914] text-sm flex items-center justify-between"
          >
            <span className={selectedGenres.length > 0 ? "text-white" : "text-[#808080]"}>
              {selectedGenres.length > 0 ? selectedGenres.map(g => g.name).join(", ") : "Select genres..."}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showGenreDropdown ? "rotate-180" : ""}`} />
          </button>
          {showGenreDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-[#1f1f1f] border border-[#333] rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {TMDB_GENRES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className="w-full px-3 py-2 text-left text-sm text-white hover:bg-[#333] flex items-center justify-between"
                >
                  {genre.name}
                  {selectedGenres.find(g => g.id === genre.id) && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#808080] mb-1.5">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white placeholder:text-[#808080]/50 focus:outline-none focus:border-[#e50914] resize-none text-sm"
          placeholder="Enter series description..."
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-[#808080] mb-1.5">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a tag"
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white placeholder:text-[#808080]/50 focus:outline-none focus:border-[#e50914] text-sm"
          />
          <Button type="button" onClick={addTag} variant="outline" className="px-3">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="flex items-center gap-1 text-white border-[#333]">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Season & Episode Builder */}
      <SeasonEpisodeBuilder seasons={seasons} onChange={setSeasons} />

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full bg-[#e50914] hover:bg-[#b2070f]">
        Upload Series
      </Button>
    </form>
  );
}
