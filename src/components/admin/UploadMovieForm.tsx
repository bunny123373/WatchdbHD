"use client";

import { useState } from "react";
import { Upload, X, Plus, Sparkles } from "lucide-react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { LANGUAGES, CATEGORIES, QUALITIES } from "@/utils/constants";
import TMDBSearch from "./TMDBSearch";

interface UploadMovieFormProps {
  onSuccess?: () => void;
}

export default function UploadMovieForm({ onSuccess }: UploadMovieFormProps) {
  const [showTMDBSearch, setShowTMDBSearch] = useState(false);

  const handleTMDBFill = (result: { title: string; poster: string; banner: string; description: string; year: string; rating: number }) => {
    setFormData((prev) => ({
      ...prev,
      title: result.title || prev.title,
      poster: result.poster || prev.poster,
      banner: result.banner || prev.banner,
      description: result.description || prev.description,
      year: result.year || prev.year,
      rating: result.rating ? String(result.rating) : prev.rating,
    }));
    setShowTMDBSearch(false);
  };

  const [formData, setFormData] = useState({
    title: "",
    poster: "",
    banner: "",
    description: "",
    year: "",
    language: "Telugu",
    category: "Latest",
    quality: "720p",
    rating: "",
    tags: [] as string[],
    embedIframeLink: "",
    downloadLink: "",
  });
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
          rating: formData.rating ? parseFloat(formData.rating) : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Movie uploaded successfully!");
        setFormData({
          title: "",
          poster: "",
          banner: "",
          description: "",
          year: "",
          language: "Telugu",
          category: "Latest",
          quality: "720p",
          rating: "",
          tags: [],
          embedIframeLink: "",
          downloadLink: "",
        });
        onSuccess?.();
      } else {
        setMessage(data.error || "Failed to upload movie");
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

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-[#808080] mb-1.5">Quality</label>
          <select
            name="quality"
            value={formData.quality}
            onChange={handleChange}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-[#141414] border border-[#333] text-white focus:outline-none focus:border-[#e50914] text-sm"
          >
            {QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
        <Input
          label="Embed Iframe URL (Watch Link)"
          name="embedIframeLink"
          value={formData.embedIframeLink}
          onChange={handleChange}
          placeholder="https://example.com/embed/..."
        />
        <Input
          label="Download URL *"
          name="downloadLink"
          value={formData.downloadLink}
          onChange={handleChange}
          required
          placeholder="https://drive.google.com/..."
        />
      </div>

      <Button type="submit" size="lg" isLoading={isLoading} className="w-full bg-[#e50914] hover:bg-[#b2070f]">
        Upload Movie
      </Button>
    </form>
  );
}
