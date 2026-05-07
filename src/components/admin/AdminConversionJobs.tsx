"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

interface ConversionJob {
  _id: string;
  contentId?: string;
  mp4Url: string;
  status: string;
  progress: number;
  message: string;
  hlsUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  downloading: RefreshCw,
  converting: RefreshCw,
  processing: RefreshCw,
  complete: CheckCircle,
  failed: XCircle,
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  downloading: "text-blue-400",
  converting: "text-blue-400",
  processing: "text-purple-400",
  complete: "text-green-400",
  failed: "text-red-400",
};

export default function AdminConversionJobs() {
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const params = filter ? `?status=${filter}` : "";
      const res = await fetch(`/api/conversion-jobs${params}`, {
        headers: { "x-admin-key": sessionStorage.getItem("adminKey") || "" },
      });
      const data = await res.json();
      if (data.success) setJobs(data.data);
    } catch (e) {
      console.error("Failed to fetch jobs:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  const statuses = ["", "pending", "downloading", "converting", "processing", "complete", "failed"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Conversion Jobs</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
            className="bg-white/5 border border-white/10 rounded py-1.5 px-3 text-sm text-white focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s} value={s} className="bg-[#141414]">
                {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All Status"}
              </option>
            ))}
          </select>
          <button
            onClick={() => { setLoading(true); fetchJobs(); }}
            className="p-2 hover:bg-white/10 rounded text-gray-400"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No conversion jobs found</div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const StatusIcon = statusIcons[job.status] || Clock;
            const statusColor = statusColors[job.status] || "text-gray-400";
            return (
              <div key={job._id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                      <span className={`text-sm font-medium ${statusColor}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                      {job.contentId && (
                        <span className="text-xs text-gray-500">ID: {job.contentId}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mb-2">{job.mp4Url}</p>
                    <div className="w-full bg-zinc-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          job.status === "failed" ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.message} ({job.progress}%)
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    {job.hlsUrl && (
                      <a
                        href={job.hlsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:underline mt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> HLS
                      </a>
                    )}
                    {job.error && (
                      <p className="text-xs text-red-400 mt-1 truncate max-w-[200px]">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {job.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
