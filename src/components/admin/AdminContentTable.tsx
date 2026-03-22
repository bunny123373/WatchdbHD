"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit2, Trash2, Film, Tv, Search, Check, X } from "lucide-react";
import { IContent } from "@/models/Content";
import { formatDate } from "@/utils/formatDate";
import Badge from "@/components/ui/Badge";
import EditContentModal from "./EditContentModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface AdminContentTableProps {
  refreshTrigger?: number;
}

export default function AdminContentTable({ refreshTrigger = 0 }: AdminContentTableProps) {
  const [content, setContent] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "series">("all");
  const [editingItem, setEditingItem] = useState<IContent | null>(null);
  const [deletingItem, setDeletingItem] = useState<IContent | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [refreshTrigger]);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content?noLimit=true");
      const data = await response.json();
      if (data.success) {
        setContent(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleDelete = async () => {
    if (!deletingItem) return;

    try {
      const adminKey = sessionStorage.getItem("adminKey");
      const response = await fetch(`/api/content/${deletingItem._id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey || "" },
      });

      const data = await response.json();
      if (data.success) {
        setContent(content.filter((c) => String(c._id) !== String(deletingItem._id)));
        setDeletingItem(null);
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContent.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContent.map((c) => String(c._id))));
    }
  };

  const handleBulkDelete = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    setShowBulkDeleteConfirm(false);
    try {
      const adminKey = sessionStorage.getItem("adminKey");
      const response = await fetch("/api/content/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey || "",
        },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      const data = await response.json();
      if (data.success) {
        setContent(content.filter((c) => !selectedIds.has(String(c._id))));
        setSelectedIds(new Set());
      }
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-xl border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">Manage Content</h2>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="px-3 py-1.5 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedIds.size})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{filteredContent.length} items</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e50914] focus:bg-white/10 transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "movie", "series"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  typeFilter === type
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/[0.02]">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left">
                <button
                  onClick={toggleSelectAll}
                  className={`p-1 rounded transition-colors ${
                    selectedIds.size === filteredContent.length && filteredContent.length > 0
                      ? "bg-[#e50914] text-white"
                      : "bg-white/10 text-gray-400 hover:bg-white/20"
                  }`}
                >
                  {selectedIds.size === filteredContent.length && filteredContent.length > 0 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Language</th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 sm:px-6 py-4 text-right text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredContent.map((item) => (
              <tr
                key={String(item._id)}
                className={`hover:bg-white/[0.02] transition-colors ${
                  selectedIds.has(String(item._id)) ? "bg-[#e50914]/5" : ""
                }`}
              >
                <td className="px-4 sm:px-6 py-4">
                  <button
                    onClick={() => toggleSelect(String(item._id))}
                    className={`p-1 rounded transition-colors ${
                      selectedIds.has(String(item._id))
                        ? "bg-[#e50914] text-white"
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                    }`}
                  >
                    {selectedIds.has(String(item._id)) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </button>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-white line-clamp-1">{item.title}</h4>
                      {item.year && <p className="text-sm text-gray-500">{item.year}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <Badge variant={item.type === "movie" ? "gold" : "purple"} className="flex items-center gap-1 w-fit">
                    {item.type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                    {item.type === "movie" ? "Movie" : "Series"}
                  </Badge>
                </td>
                <td className="px-4 sm:px-6 py-4 text-gray-400">{item.language || "-"}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-400">{item.category || "-"}</td>
                <td className="px-4 sm:px-6 py-4 text-gray-400 text-sm">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded hover:bg-[#e50914]/10 text-gray-500 hover:text-[#e50914] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-2 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-white/5">
        {filteredContent.map((item) => (
          <div
            key={String(item._id)}
            className={`p-4 hover:bg-white/[0.02] transition-colors ${
              selectedIds.has(String(item._id)) ? "bg-[#e50914]/5" : ""
            }`}
          >
            <div className="flex gap-3 items-start">
              <button
                onClick={() => toggleSelect(String(item._id))}
                className={`mt-1 p-1 rounded transition-colors flex-shrink-0 ${
                  selectedIds.has(String(item._id))
                    ? "bg-[#e50914] text-white"
                    : "bg-white/10 text-gray-400 hover:bg-white/20"
                }`}
              >
                {selectedIds.has(String(item._id)) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </button>
              <div className="relative w-16 h-24 rounded overflow-hidden flex-shrink-0 bg-gray-800">
                <Image
                  src={item.poster}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white line-clamp-2">{item.title}</h4>
                {item.year && <p className="text-sm text-gray-500 mt-0.5">{item.year}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={item.type === "movie" ? "gold" : "purple"} className="flex items-center gap-1 text-xs">
                    {item.type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                    {item.type === "movie" ? "Movie" : "Series"}
                  </Badge>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{item.language || "-"}</span>
                  <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{item.category || "-"}</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">{formatDate(item.createdAt)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setEditingItem(item)}
                  className="p-2 rounded hover:bg-[#e50914]/10 text-gray-500 hover:text-[#e50914] transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingItem(item)}
                  className="p-2 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found</p>
        </div>
      )}

      {/* Modals */}
      {editingItem && (
        <EditContentModal
          content={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            fetchContent();
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirmModal
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title={deletingItem.title}
        />
      )}

      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Bulk Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete {selectedIds.size} item{selectedIds.size > 1 ? "s" : ""}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isBulkDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
