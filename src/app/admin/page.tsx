"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminStats from "@/components/admin/AdminStats";
import UploadMovieForm from "@/components/admin/UploadMovieForm";
import UploadSeriesForm from "@/components/admin/UploadSeriesForm";
import AdminContentTable from "@/components/admin/AdminContentTable";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "upload-movie", label: "Upload Movie" },
  { id: "upload-series", label: "Upload Series" },
  { id: "manage", label: "Manage Content" },
];

function AdminPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.find((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/admin?tab=${tabId}`);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleTabChange("manage");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Manage your content and uploads</p>
          </div>
        </div>

        {/* Tabs - Netflix Style */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <AdminStats />
              <div className="bg-[#1f1f1f] rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Welcome to Admin Panel</h2>
                <p className="text-gray-400 mb-6">
                  Use the navigation tabs above to manage your content. You can upload movies and web series,
                  edit existing content, and view statistics about your platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#2a2a2a] rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Upload Movie</h3>
                    <p className="text-sm text-gray-400">Add new movies with streaming and download links</p>
                  </div>
                  <div className="p-4 bg-[#2a2a2a] rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Upload Series</h3>
                    <p className="text-sm text-gray-400">Add web series with seasons and episodes</p>
                  </div>
                  <div className="p-4 bg-[#2a2a2a] rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Manage Content</h3>
                    <p className="text-sm text-gray-400">Edit or delete existing movies and series</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "upload-movie" && (
            <UploadMovieForm onSuccess={handleUploadSuccess} />
          )}

          {activeTab === "upload-series" && (
            <UploadSeriesForm onSuccess={handleUploadSuccess} />
          )}

          {activeTab === "manage" && (
            <AdminContentTable refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#141414] flex items-center justify-center text-white">Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
