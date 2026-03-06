"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, RefreshCw, Film, Tv } from "lucide-react";

interface Request {
  _id: string;
  title: string;
  type: "movie" | "series";
  year?: string;
  language?: string;
  description?: string;
  status: "pending" | "completed" | "rejected";
  createdAt: string;
}

interface Requests {
  requests: Request[];
  stats: {
    total: number;
    pending: number;
    completed: number;
    rejected: number;
  };
}

export default function AdminRequests() {
  const [data, setData] = useState<Requests | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests?admin=true");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, status: "completed" | "rejected") => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdating(null);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setUpdating(null);
    }
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{data?.stats.total || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-500">{data?.stats.pending || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
          <p className="text-gray-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-500">{data?.stats.completed || 0}</p>
        </div>
        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5">
          <p className="text-gray-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-500">{data?.stats.rejected || 0}</p>
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchRequests}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Refresh
      </button>

      {/* Requests List */}
      <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
        {data?.requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No requests yet
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data?.requests.map((request) => (
              <div key={request._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {request.type === "movie" ? (
                      <Film className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Tv className="w-4 h-4 text-purple-400" />
                    )}
                    <span className="font-medium text-white">{request.title}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      request.status === "pending" ? "bg-yellow-500/20 text-yellow-500" :
                      request.status === "completed" ? "bg-green-500/20 text-green-500" :
                      "bg-red-500/20 text-red-500"
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {request.year && <span>{request.year}</span>}
                    {request.year && request.language && <span> • </span>}
                    {request.language && <span>{request.language}</span>}
                    {(request.year || request.language) && <span> • </span>}
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  {request.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{request.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(request._id, "completed")}
                        disabled={updating === request._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Done
                      </button>
                      <button
                        onClick={() => updateStatus(request._id, "rejected")}
                        disabled={updating === request._id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteRequest(request._id)}
                    disabled={updating === request._id}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-colors disabled:opacity-50"
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
