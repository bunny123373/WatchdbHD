"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, Film, Tv, RefreshCw, Pencil, Check } from "lucide-react";

interface ContentItem {
  _id: string;
  title: string;
  poster: string;
  type: string;
}

interface CollectionData {
  _id: string;
  name: string;
  description?: string;
  contentIds: string[];
  isTopTen?: boolean;
}

export default function AdminCollections() {
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCollection, setNewCollection] = useState({ name: "", description: "", contentIds: [] as string[], isTopTen: false });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collRes, contentRes] = await Promise.all([
        fetch("/api/collections").then((r) => r.json()),
        fetch("/api/content?limit=100").then((r) => r.json()),
      ]);
      if (collRes.collections) setCollections(collRes.collections);
      if (contentRes.success) setAllContent(contentRes.data || []);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveCollection = async () => {
    if (!newCollection.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollection),
      });
      if (res.ok) {
        setNewCollection({ name: "", description: "", contentIds: [], isTopTen: false });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateCollection = async (id: string) => {
    if (!newCollection.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...newCollection }),
      });
      if (res.ok) {
        setEditingId(null);
        setNewCollection({ name: "", description: "", contentIds: [], isTopTen: false });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;
    try {
      const res = await fetch(`/api/collections?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const startEdit = (coll: CollectionData) => {
    setEditingId(coll._id);
    setNewCollection({
      name: coll.name,
      description: coll.description || "",
      contentIds: coll.contentIds || [],
      isTopTen: coll.isTopTen || false,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCollection({ name: "", description: "", contentIds: [], isTopTen: false });
  };

  const toggleContent = (id: string) => {
    setNewCollection((prev) => ({
      ...prev,
      contentIds: prev.contentIds.includes(id)
        ? prev.contentIds.filter((c) => c !== id)
        : [...prev.contentIds, id],
    }));
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
      {/* Create New Collection */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Create New Collection</h2>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Collection Name</label>
            <input
              type="text"
              value={newCollection.name}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Top 10 Action Movies"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={newCollection.description}
              onChange={(e) => setNewCollection((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Short description..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newCollection.isTopTen}
                onChange={(e) => setNewCollection((prev) => ({ ...prev, isTopTen: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-white/5 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-0"
              />
              <span className="text-white text-sm">Top 10 Collection</span>
            </label>
            {newCollection.isTopTen && (
              <span className="text-yellow-500 text-xs">(Shows numbers 1-10 on items)</span>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Select Content ({newCollection.contentIds.length} selected)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-2 bg-[#141414] rounded-lg">
              {allContent.map((item) => (
                <button
                  key={item._id}
                  onClick={() => toggleContent(item._id)}
                  className={`relative aspect-[2/3] rounded-lg overflow-hidden border-2 transition-colors ${
                    newCollection.contentIds.includes(item._id)
                      ? "border-yellow-500"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.poster ? (
                    <img src={item.poster} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      {item.type === "series" ? <Tv className="w-6 h-6 text-gray-600" /> : <Film className="w-6 h-6 text-gray-600" />}
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1">
                    <p className="text-white text-xs truncate">{item.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => (editingId ? updateCollection(editingId) : saveCollection())}
            disabled={saving || !newCollection.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {editingId ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : editingId ? "Update Collection" : "Create Collection"}
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Existing Collections */}
      <div className="bg-[#1a1a1a] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Existing Collections</h2>
          <button onClick={fetchData} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-[#353b4a] text-white rounded-lg text-sm">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {collections.length === 0 ? (
          <p className="text-gray-400">No collections yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((coll) => (
              <div key={coll._id} className="bg-[#141414] rounded-lg p-4 border border-[#2a2f3d]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{coll.name}</h3>
                    {coll.description && <p className="text-gray-400 text-sm mt-1">{coll.description}</p>}
                    <p className="text-gray-500 text-xs mt-2">{coll.contentIds?.length || 0} items</p>
                    {coll.isTopTen && <span className="inline-block mt-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded">Top 10</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(coll)}
                      className="p-2 bg-white/5 hover:bg-[#353b4a] text-white rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteCollection(coll._id)}
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
