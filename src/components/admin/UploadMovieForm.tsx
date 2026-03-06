"use client";

import { useState } from "react";
import { Upload, X, Plus, Sparkles, ChevronDown, Check, Link } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LANGUAGES, CATEGORIES, TMDB_GENRES, AUDIO_LANGUAGES } from "@/utils/constants";
import TMDBSearch from "./TMDBSearch";

interface UploadMovieFormProps {
  onSuccess?: () => void;
}

export default function UploadMovieForm({ onSuccess }: UploadMovieFormProps) {
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
      category: "Latest",
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
    slug: "",
    poster: "",
    banner: "",
    description: "",
    year: "",
    language: "Telugu",
    audioLanguages: [] as string[],
    category: "Latest",
    quality: "720p",
    rating: "",
    tags: [] as string[],
    embedIframeLink: "",
    embedIframeLink2: "",
    downloadLink: "",
    trailerUrl: "",
  });
  const [selectedAudioLanguages, setSelectedAudioLanguages] = useState<string[]>([]);
  const [castInput, setCastInput] = useState("");
  const [cast, setCast] = useState<{ name: string; character: string }[]>([]);
  const [crewInput, setCrewInput] = useState("");
  const [crew, setCrew] = useState<{ name: string; job: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [selectedEmbedLang, setSelectedEmbedLang] = useState("en");

  const EMBED_LANGUAGES = [
    { code: "all", name: "All (Default)" },
    { code: "en", name: "English" },
    { code: "te", name: "Telugu" },
    { code: "hi", name: "Hindi" },
    { code: "ta", name: "Tamil" },
    { code: "ml", name: "Malayalam" },
    { code: "kn", name: "Kannada" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "ru", name: "Russian" },
  ];

  const addCast = () => {
    if (castInput.trim()) {
      const [name, character] = castInput.split("|").map(s => s.trim());
      if (name) {
        setCast([...cast, { name, character: character || "" }]);
        setCastInput("");
      }
    }
  };

  const removeCast = (index: number) => {
    setCast(cast.filter((_, i) => i !== index));
  };

  const addCrew = () => {
    if (crewInput.trim()) {
      const [name, job] = crewInput.split("|").map(s => s.trim());
      if (name) {
        setCrew([...crew, { name, job: job || "" }]);
        setCrewInput("");
      }
    }
  };

  const removeCrew = (index: number) => {
    setCrew(crew.filter((_, i) => i !== index));
  };

  const handleAutoFillEmbed = async () => {
    if (!tmdbData.tmdbId) {
      setMessage("Please search and select a movie from TMDB first");
      return;
    }

    setIsAutoFilling(true);
    setMessage("");

    try {
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: tmdbData.tmdbId,
          type: "movie",
          language: selectedEmbedLang,
        }),
      });
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          embedIframeLink: data.embedUrl,
        }));
        setMessage("Embed URL auto-filled successfully!");
      } else {
        setMessage(data.error || "Failed to auto-fill embed URL");
      }
    } catch (error) {
      setMessage("Error auto-filling embed URL");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
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

    try {
      const adminKey = sessionStorage.getItem("adminKey");
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey || "",
        },
        body: JSON.stringify({
          type: "movie",
          ...formData,
          audioLanguages: selectedAudioLanguages.length > 0 ? selectedAudioLanguages : undefined,
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
          tmdbId: tmdbData.tmdbId || undefined,
          tmdbGenreIds: selectedGenres.length > 0 ? selectedGenres.map(g => g.id) : (tmdbData.genreIds.length > 0 ? tmdbData.genreIds : undefined),
          tmdbGenres: selectedGenres.length > 0 ? selectedGenres.map(g => g.name) : (tmdbData.genres.length > 0 ? tmdbData.genres : undefined),
          cast: cast.length > 0 ? cast : undefined,
          crew: crew.length > 0 ? crew : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Movie uploaded successfully!");
        
        const movieTitle = formData.title;
        
        setFormData({
          title: "",
          slug: "",
          poster: "",
          banner: "",
          description: "",
          year: "",
          language: "Telugu",
          audioLanguages: [],
          category: "Latest",
          quality: "720p",
          rating: "",
          tags: [],
          embedIframeLink: "",
          embedIframeLink2: "",
          downloadLink: "",
          trailerUrl: "",
        });
        setSelectedGenres([]);
        setSelectedAudioLanguages([]);
        setTmdbData({ tmdbId: 0, genreIds: [], genres: [] });
        setCast([]);
        setCrew([]);
        
        const notification = {
          id: Date.now().toString(),
          title: "New Movie Added",
          body: `${movieTitle} is now available to watch!`,
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
        setMessage(data.error || "Failed to upload movie");
      }
    } catch (error) {
      setMessage("Something went wrong");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleAutoFillTrailer = async () => {
    if (!tmdbData.tmdbId) {
      setMessage("Please search and select a movie from TMDB first");
      return;
    }

    setIsAutoFilling(true);
    setMessage("");

    try {
      const response = await fetch(`/api/tmdb?action=trailer&tmdbId=${tmdbData.tmdbId}&type=movie`);
      const data = await response.json();

      if (data.success && data.trailerKey) {
        const youtubeUrl = `https://www.youtube.com/watch?v=${data.trailerKey}`;
        setFormData((prev) => ({
          ...prev,
          trailerUrl: youtubeUrl,
        }));
        setMessage("Trailer URL auto-filled successfully!");
      } else {
        setMessage(data.error || "No trailer found for this movie");
      }
    } catch (error) {
      setMessage("Error auto-filling trailer URL");
    } finally {
      setIsAutoFilling(false);
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
          Upload Movie
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
      </div>

      {showTMDBSearch && (
        <div className="p-3 sm:p-4 bg-[#141414] rounded-lg border border-[#333]">
          <TMDBSearch type="movie" onSelect={handleTMDBFill} />
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
          placeholder="Enter movie title"
        />

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Slug URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white focus:outline-none focus:border-[#e50914] text-sm"
              placeholder="movie-title"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-3 py-2 bg-[#333] hover:bg-[#444] text-white rounded-lg text-sm"
            >
              Generate
            </button>
          </div>
        </div>

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

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white focus:outline-none focus:border-[#e50914] text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
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
          placeholder="Enter movie description..."
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

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="relative">
          <Input
            label="Embed Iframe URL (Watch Link)"
            name="embedIframeLink"
            value={formData.embedIframeLink}
            onChange={handleChange}
            placeholder="https://example.com/embed/..."
          />
          <div className="flex items-center gap-2 mt-2">
            <select
              value={selectedEmbedLang}
              onChange={(e) => setSelectedEmbedLang(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-[#141414] border border-[#333] text-white text-xs focus:outline-none focus:border-[#e50914]"
            >
              {EMBED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAutoFillEmbed}
              disabled={isAutoFilling || !tmdbData.tmdbId}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              <Link className="w-3 h-3" />
              {isAutoFilling ? "Filling..." : "Auto Fill"}
            </button>
          </div>
        </div>
        <div>
          <Input
            label="Embed Iframe URL 2 (Backup)"
            name="embedIframeLink2"
            value={formData.embedIframeLink2}
            onChange={handleChange}
            placeholder="https://example.com/embed/backup..."
          />
        </div>
        <div>
          <Input
            label="Download URL"
            name="downloadLink"
            value={formData.downloadLink}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
          />
        </div>
      </div>

      {/* Trailer URL */}
      <div className="relative">
        <Input
          label="Trailer URL (YouTube)"
          name="trailerUrl"
          value={formData.trailerUrl}
          onChange={handleChange}
          placeholder="https://youtube.com/watch?v=..."
        />
        <button
          type="button"
          onClick={handleAutoFillTrailer}
          disabled={isAutoFilling || !tmdbData.tmdbId}
          className="absolute right-2 top-8 flex items-center gap-1 px-2 py-1 bg-amber-500 hover:bg-amber-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
        >
          <Link className="w-3 h-3" />
          {isAutoFilling ? "Filling..." : "Auto"}
        </button>
      </div>

        {/* Cast */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Cast (Name | Character)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCast())}
              placeholder="Actor Name | Character Name"
              className="flex-1 px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white placeholder:text-[#808080]/50 focus:outline-none focus:border-[#e50914] text-sm"
            />
            <Button type="button" onClick={addCast} variant="outline" className="px-3">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {cast.map((c, i) => (
              <Badge key={i} variant="outline" className="flex items-center gap-1 text-white border-[#333]">
                {c.name} {c.character && `as ${c.character}`}
                <button type="button" onClick={() => removeCast(i)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Crew */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Crew (Name | Job)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={crewInput}
              onChange={(e) => setCrewInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCrew())}
              placeholder="Director Name | Director"
              className="flex-1 px-3 py-2 rounded-lg bg-[#141414] border border-[#333] text-white placeholder:text-[#808080]/50 focus:outline-none focus:border-[#e50914] text-sm"
            />
            <Button type="button" onClick={addCrew} variant="outline" className="px-3">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {crew.map((c, i) => (
              <Badge key={i} variant="outline" className="flex items-center gap-1 text-white border-[#333]">
                {c.name} {c.job && `(${c.job})`}
                <button type="button" onClick={() => removeCrew(i)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full bg-[#e50914] hover:bg-[#b2070f]">
        Upload Movie
      </Button>
    </form>
  );
}
