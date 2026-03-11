"use client";

import { useState } from "react";
import { Film, Tv, Send, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RequestPage() {
  const [type, setType] = useState<"movie" | "series">("movie");
  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type, year, language, description }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTitle("");
        setYear("");
        setLanguage("");
        setDescription("");
      } else {
        setError("Failed to submit request");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414]">
      <Navbar />
      
      <div className="pt-20 pb-24 lg:pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Request Content</h1>
          <p className="text-gray-400 mb-8">
            Couldn't find what you're looking for? Let us know!
          </p>

          {submitted ? (
            <div className="p-6 bg-[#1a1a1a] rounded-xl border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <h2 className="text-xl font-semibold text-white">Request Submitted!</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Thank you for your request. We'll review it and add the content if available.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-[#e50914] hover:text-[#f40612] font-medium"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 bg-[#1a1a1a] rounded-xl border border-white/5">
              {/* Type Selection */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Content Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setType("movie")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      type === "movie"
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Film className="w-5 h-5" />
                    Movie
                  </button>
                  <button
                    type="button"
                    onClick={() => setType("series")}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      type === "series"
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <Tv className="w-5 h-5" />
                    Series
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Enter ${type} title`}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Year & Language */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Year</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="e.g., 2024"
                    maxLength={10}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g., Telugu, Hindi"
                    maxLength={50}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="text-gray-400 text-sm mb-2 block">Additional Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Any additional information..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] resize-none"
                />
                <span className="text-gray-500 text-xs">{description.length}/500</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#e50914] hover:bg-[#f40612] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
