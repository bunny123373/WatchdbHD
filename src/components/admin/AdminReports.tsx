"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, RefreshCw, AlertTriangle, Film, Tv } from "lucide-react";

interface Report {
  _id: string;
  contentTitle: string;
  type: "movie" | "series";
  issueType: "broken" | "no-play" | "slow" | "other";
  description?: string;
  status: "pending" | "fixed" | "rejected";
  createdAt: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, fixed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/reports?admin=true");
      const json = await res.json();
      setReports(json.reports || []);
      setStats(json.stats || { total: 0, pending: 0, fixed: 0, rejected: 0 });
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const updateStatus = async (id: string, status: "fixed" | "rejected") => {
    setUpdating(id);
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchReports();
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    setUpdating(id);
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" });
      fetchReports();
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setUpdating(null);
    }
  };

  const issueLabels: Record<string, string> = {
    broken: "Broken Link",
    "no-play": "Won't Play",
    slow: "Too Slow",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1F232D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#1F232D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-[#1F232D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Fixed</p>
          <p className="text-2xl font-bold text-green-500">{stats.fixed}</p>
        </div>
        <div className="bg-[#1F232D] p-4 rounded-lg">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
        </div>
      </div>

      <button
        onClick={fetchReports}
        className="flex items-center gap-2 px-4 py-2 bg-[#1F232D] hover:bg-[#2a2f3d] text-white rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>

      {/* Reports List */}
      <div className="bg-[#0E1015] rounded-lg border border-[#1F232D] overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No reports yet
          </div>
        ) : (
          <div className="divide-y divide-[#1F232D]">
            {reports.map((report) => (
              <div key={report._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {report.type === "movie" ? (
                      <Film className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Tv className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="font-medium text-white">{report.contentTitle}</span>
                    <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-500">
                      {issueLabels[report.issueType]}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      report.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                      report.status === "fixed" ? "bg-green-500/20 text-green-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  {report.description && (
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(report._id, "fixed")}
                        disabled={updating === report._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Fixed
                      </button>
                      <button
                        onClick={() => updateStatus(report._id, "rejected")}
                        disabled={updating === report._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteReport(report._id)}
                    disabled={updating === report._id}
                    className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
