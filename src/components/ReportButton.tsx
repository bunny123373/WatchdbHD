"use client";

import { useState } from "react";
import { AlertTriangle, Send, CheckCircle } from "lucide-react";

interface ReportButtonProps {
  contentId: string;
  contentTitle: string;
  type: "movie" | "series";
  episodeNumber?: number;
  seasonNumber?: number;
}

export default function ReportButton({ contentId, contentTitle, type, episodeNumber, seasonNumber }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] = useState<"broken" | "no-play" | "slow" | "other">("broken");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentTitle,
          type,
          episodeNumber,
          seasonNumber,
          issueType,
          description,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitted(false);
          setDescription("");
        }, 2000);
      } else {
        setError("Failed to submit report");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/80 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
      >
        <AlertTriangle className="w-4 h-4" />
        Report
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#1F232D] rounded-xl p-6 w-full max-w-md border border-[#2a2f3d]">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">Report Submitted!</h3>
            <p className="text-gray-400 mt-2">We'll review and fix the issue.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Report Issue</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">{contentTitle}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Issue Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "broken", label: "Broken Link" },
                    { value: "no-play", label: "Won't Play" },
                    { value: "slow", label: "Too Slow" },
                    { value: "other", label: "Other" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIssueType(opt.value as typeof issueType)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        issueType === opt.value
                          ? "bg-yellow-500 text-black"
                          : "bg-[#2a2f3d] text-gray-300 hover:bg-[#353b4a]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#2a2f3d] border border-[#3a3f4d] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
