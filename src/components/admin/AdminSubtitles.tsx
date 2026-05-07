"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search, Plus, X, Trash2, ExternalLink, Upload } from "lucide-react";

interface Subtitle {
  _id: string;
  contentId: string | { _id: string; title?: string };
  seasonNumber?: number;
  episodeNumber?: number;
  language: string;
  label: string;
  url: string;
  format: string;
}

export default function AdminSubtitles() {
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    contentId: "",
    language: "",
    label: "",
    url: "",
    format: "vtt" as "srt" | "vtt",
    seasonNumber: "",
    episodeNumber: "",
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminKey = typeof window !== "undefined" ? sessionStorage.getItem("adminKey") || "" : "";

  useEffect(() => {
    fetchSubtitles();
  }, []);

  const fetchSubtitles = async () => {
    try {
      const res = await fetch("/api/subtitles");
      const data = await res.json();
      if (data.success) setSubtitles(data.data);
    } catch (e) {
      console.error("Failed to fetch subtitles:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contentId || !form.language || !form.label || !form.url) return;

    try {
      const res = await fetch("/api/subtitles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey,
        },
        body: JSON.stringify({
          contentId: form.contentId,
          language: form.language,
          label: form.label,
          url: form.url,
          format: form.format,
          seasonNumber: form.seasonNumber ? parseInt(form.seasonNumber) : undefined,
          episodeNumber: form.episodeNumber ? parseInt(form.episodeNumber) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSubtitles((prev) => [data.data, ...prev]);
        setForm({ contentId: "", language: "", label: "", url: "", format: "vtt", seasonNumber: "", episodeNumber: "" });
        setShowForm(false);
      }
    } catch (e) {
      console.error("Failed to add subtitle:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subtitle?")) return;
    try {
      const res = await fetch(`/api/subtitles?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey },
      });
      const data = await res.json();
      if (data.success) {
        setSubtitles((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (e) {
      console.error("Failed to delete subtitle:", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "vtt" && ext !== "srt") {
      alert("Only .vtt and .srt files are allowed");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/subtitles/upload", {
        method: "POST",
        headers: { "x-admin-key": adminKey },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm((prev) => ({ ...prev, url: data.url, format: data.format }));
        alert("File uploaded! Fill in the remaining fields and submit.");
      } else {
        alert(data.error || "Upload failed");
      }
    } catch {
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const filtered = subtitles.filter(
    (s) =>
      s.language.toLowerCase().includes(search.toLowerCase()) ||
      s.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Subtitles ({subtitles.length})</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded py-1.5 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white/5 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Content ID *"
              value={form.contentId}
              onChange={(e) => setForm({ ...form, contentId: e.target.value })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-red-600"
            />
            <input
              type="text"
              placeholder="Language * (e.g. English)"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-red-600"
            />
            <input
              type="text"
              placeholder="Label * (e.g. English (CC))"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-red-600"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="URL * (.vtt or .srt file)"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                className="flex-1 bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none focus:border-red-600"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept=".vtt,.srt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "..." : "Upload"}
              </button>
            </div>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value as "srt" | "vtt" })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none"
            >
              <option value="vtt">VTT</option>
              <option value="srt">SRT</option>
            </select>
            <input
              type="number"
              placeholder="Season (optional)"
              value={form.seasonNumber}
              onChange={(e) => setForm({ ...form, seasonNumber: e.target.value })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none"
            />
            <input
              type="number"
              placeholder="Episode (optional)"
              value={form.episodeNumber}
              onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
              className="bg-[#141414] text-white px-3 py-2 rounded border border-white/10 text-sm focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium"
          >
            Add Subtitle
          </button>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No subtitles found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Label</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Content ID</th>
                <th className="py-3 px-4">Episode</th>
                <th className="py-3 px-4">URL</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-4 text-white">{sub.language}</td>
                  <td className="py-3 px-4 text-gray-400">{sub.label}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs uppercase text-gray-500">{sub.format}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400 font-mono">
                    {typeof sub.contentId === "string" ? sub.contentId.slice(0, 12) : sub.contentId?._id?.slice(0, 12)}...
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {sub.seasonNumber ? `S${sub.seasonNumber}` : "-"}
                    {sub.episodeNumber ? ` E${sub.episodeNumber}` : ""}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={sub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(sub._id)}
                      className="p-1.5 hover:bg-white/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
