"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Edit2, Trash2, Film, Tv, Search } from "lucide-react";
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

  useEffect(() => {
    fetchContent();
  }, [refreshTrigger]);

  const fetchContent = async () => {
    try {
      const response = await fetch("/api/content");
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

  if (loading) {
    return (
      <div className="bg-[#1f1f1f] rounded-lg p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#333] rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1f1f] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#333] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-white">Manage Content</h2>
          <div className="flex items-center gap-2 text-sm text-[#808080]">
            <span>Total: {filteredContent.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#808080]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2.5 rounded bg-[#141414] border border-[#333] text-white placeholder:text-[#808080]/50 focus:outline-none focus:border-[#e50914]"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "movie", "series"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-4 py-2.5 rounded text-sm font-medium transition-all ${
                  typeFilter === type
                    ? "bg-[#e50914] text-white"
                    : "bg-[#141414] text-[#808080] border border-[#333] hover:text-white"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#141414]/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#808080]">Content</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#808080]">Type</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#808080]">Language</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#808080]">Category</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-[#808080]">Date</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-[#808080]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333]">
            {filteredContent.map((item) => (
              <tr
                key={String(item._id)}
                className="hover:bg-[#141414]/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-white line-clamp-1">{item.title}</h4>
                      {item.year && <p className="text-sm text-[#808080]">{item.year}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={item.type === "movie" ? "gold" : "purple"} className="flex items-center gap-1 w-fit">
                    {item.type === "movie" ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                    {item.type === "movie" ? "Movie" : "Series"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-[#808080]">{item.language || "-"}</td>
                <td className="px-6 py-4 text-[#808080]">{item.category || "-"}</td>
                <td className="px-6 py-4 text-[#808080] text-sm">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 rounded hover:bg-[#e50914]/10 text-[#808080] hover:text-[#e50914] transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="p-2 rounded hover:bg-red-500/10 text-[#808080] hover:text-red-500 transition-colors"
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

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[#808080]">No content found</p>
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
    </div>
  );
}
