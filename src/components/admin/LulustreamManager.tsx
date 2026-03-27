"use client";

import { useState, useEffect } from "react";
import { Upload, FileVideo, Trash2, RefreshCw, ExternalLink, Search, Copy, Check } from "lucide-react";

interface LulustreamFile {
  file_code: string;
  title: string;
  link: string;
  thumbnail: string;
  length: number;
  uploaded: string;
  views: number;
  canplay: number;
}

interface LulustreamAccountInfo {
  login?: string;
  files_total?: number;
  storage_used?: number;
  premium?: number;
  premium_expire?: string;
}

export default function LulustreamManager() {
  const [accountInfo, setAccountInfo] = useState<LulustreamAccountInfo | null>(null);
  const [files, setFiles] = useState<LulustreamFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [accountRes, filesRes] = await Promise.all([
        fetch("/api/lulustream?action=account"),
        fetch("/api/lulustream?action=files"),
      ]);
      const accountData = await accountRes.json();
      const filesData = await filesRes.json();
      
      if (!accountData.success) {
        setMessage(accountData.error || "Failed to connect to Lulustream");
      }
      if (accountData.success && accountData.data) {
        setAccountInfo(accountData.data);
      }
      if (filesData.success && filesData.data) {
        const filesArray = Array.isArray(filesData.data) ? filesData.data : [];
        setFiles(filesArray);
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setMessage("Failed to connect to Lulustream");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoteUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrl) return;

    setUploading(true);
    setMessage("");
    try {
      const response = await fetch("/api/lulustream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remote-upload",
          url: remoteUrl,
          title: videoTitle,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage("Upload started successfully!");
        setRemoteUrl("");
        setVideoTitle("");
        setTimeout(fetchData, 3000);
      } else {
        setMessage(data.error || "Upload failed");
      }
    } catch (error) {
      setMessage("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileCode: string) => {
    if (!confirm("Delete this file from Lulustream?")) return;

    try {
      const response = await fetch("/api/lulustream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", fileCode }),
      });
      const data = await response.json();
      if (data.success) {
        setFiles(Array.isArray(files) ? files.filter((f) => f.file_code !== fileCode) : []);
        setMessage("File deleted");
      } else {
        setMessage(data.error || "Delete failed");
      }
    } catch (error) {
      setMessage("Delete failed");
    }
  };

  const copyEmbedLink = async (fileCode: string) => {
    const embedUrl = `https://lulustream.com/embed/${fileCode}`;
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopiedId(fileCode);
      setMessage("Embed link copied!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      setMessage("Failed to copy");
    }
  };

  const filteredFiles = Array.isArray(files) ? files.filter(
    (f) =>
      f.title?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  const formatLength = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/4"></div>
          <div className="h-20 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-[#e50914]" />
            Lulustream Account
          </h3>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {accountInfo && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">User</p>
              <p className="text-white font-medium">{accountInfo.login}</p>
            </div>
            <div>
              <p className="text-gray-500">Files</p>
              <p className="text-white font-medium">{accountInfo.files_total}</p>
            </div>
            <div>
              <p className="text-gray-500">Storage Used</p>
              <p className="text-white font-medium">{formatSize(accountInfo.storage_used || 0)}</p>
            </div>
            <div>
              <p className="text-gray-500">Premium</p>
              <p className={`font-medium ${accountInfo.premium ? "text-green-400" : "text-gray-400"}`}>
                {accountInfo.premium ? "Active" : "Free"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Remote Upload */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/5">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#e50914]" />
          Remote Upload
        </h3>
        <form onSubmit={handleRemoteUpload} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={videoTitle}
              onChange={(e) => setVideoTitle(e.target.value)}
              placeholder="Video title (optional)"
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914]"
            />
            <input
              type="url"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
              placeholder="Direct video URL to upload"
              required
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914]"
            />
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 bg-[#e50914] text-white rounded-lg font-medium hover:bg-[#d40812] transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {message && (
            <p className={`text-sm ${message.includes("failed") || message.includes("error") ? "text-red-400" : "text-green-400"}`}>
              {message}
            </p>
          )}
        </form>
      </div>

      {/* Files List */}
      <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">Your Videos ({files.length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos..."
                className="pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914] text-sm w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? "No videos found" : "No videos uploaded yet"}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredFiles.map((file) => (
              <div
                key={file.file_code}
                className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="relative w-20 h-14 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                  {file.thumbnail ? (
                    <img src={file.thumbnail} alt={file.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <FileVideo className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{file.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{formatLength(file.length)}</span>
                    <span>{formatDate(file.uploaded)}</span>
                    <span className={file.canplay ? "text-green-400" : "text-yellow-400"}>
                      {file.canplay ? "Ready" : "Processing"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyEmbedLink(file.file_code)}
                    className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Copy embed link"
                  >
                    {copiedId === file.file_code ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={`https://lulustream.com/embed/${file.file_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(file.file_code)}
                    className="p-2 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
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
