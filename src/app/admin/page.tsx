"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Film, Tv, Boxes, ClipboardList, TriangleAlert, Sparkles, BellRing, LayoutDashboard, Search, Plus, X, CloudUpload, Users, Video, Subtitles, ListOrdered } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminStats from "@/components/admin/AdminStats";
import UploadMovieForm from "@/components/admin/UploadMovieForm";
import UploadSeriesForm from "@/components/admin/UploadSeriesForm";
import AdminContentTable from "@/components/admin/AdminContentTable";
import NotificationForm from "@/components/admin/NotificationForm";
import AdminRequests from "@/components/admin/AdminRequests";
import AdminCollections from "@/components/admin/AdminCollections";
import AdminReports from "@/components/admin/AdminReports";
import LulustreamManager from "@/components/admin/LulustreamManager";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminConversionJobs from "@/components/admin/AdminConversionJobs";
import VideoConverter from "@/components/admin/VideoConverter";
import AdminSubtitles from "@/components/admin/AdminSubtitles";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload-movie", label: "Add Movie", icon: Film },
  { id: "upload-series", label: "Add Series", icon: Tv },
  { id: "manage", label: "Manage", icon: Boxes },
  { id: "converter", label: "Converter", icon: Video },
  { id: "lulustream", label: "Lulustream", icon: CloudUpload },
  { id: "users", label: "Users", icon: Users },
  { id: "subtitles", label: "Subtitles", icon: Subtitles },
  { id: "conversion-jobs", label: "Jobs", icon: ListOrdered },
  { id: "requests", label: "Requests", icon: ClipboardList },
  { id: "reports", label: "Reports", icon: TriangleAlert },
  { id: "collections", label: "Collections", icon: Sparkles },
  { id: "notification", label: "Notify", icon: BellRing },
];

function AdminPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.find((t) => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    router.push(`/admin?tab=${tabId}`);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    handleTabChange("manage");
  };

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#141414]">
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-[#141414]/95 border-b border-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {activeTabMeta.label}
              </h1>
            </div>

            {/* Search - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 w-48 lg:w-64"
                />
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

          {/* Tab Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-1 px-4 sm:px-6 pb-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b border-white/10">
            <div className="p-3 space-y-1">
              {/* Mobile Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none"
                />
              </div>
              
              {/* Mobile Tabs */}
              <div className="grid grid-cols-2 gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-white text-black"
                          : "bg-white/5 text-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="w-full min-h-screen">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <AdminStats />
              
              {/* Quick Actions */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {tabs.slice(1).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-medium text-white">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Upload Movie */}
          {activeTab === "upload-movie" && (
            <div className="w-full p-4">
              <UploadMovieForm onSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Upload Series */}
          {activeTab === "upload-series" && (
            <div className="w-full p-4">
              <UploadSeriesForm onSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Manage Content */}
          {activeTab === "manage" && (
            <div className="w-full p-4">
              <AdminContentTable refreshTrigger={refreshTrigger} />
            </div>
          )}

          {/* Video Converter */}
          {activeTab === "converter" && (
            <div className="w-full p-4">
              <VideoConverter />
            </div>
          )}

          {/* Lulustream */}
          {activeTab === "lulustream" && (
            <div className="w-full p-4">
              <LulustreamManager />
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="w-full p-4">
              <AdminUsers />
            </div>
          )}

          {/* Subtitles */}
          {activeTab === "subtitles" && (
            <div className="w-full p-4">
              <AdminSubtitles />
            </div>
          )}

          {/* Conversion Jobs */}
          {activeTab === "conversion-jobs" && (
            <div className="w-full p-4">
              <AdminConversionJobs />
            </div>
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            <div className="w-full p-4">
              <AdminRequests />
            </div>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <div className="w-full p-4">
              <AdminReports />
            </div>
          )}

          {/* Collections */}
          {activeTab === "collections" && (
            <div className="w-full p-4">
              <AdminCollections />
            </div>
          )}

          {/* Notification */}
          {activeTab === "notification" && (
            <div className="w-full p-4">
              <NotificationForm />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <AdminPageContent />
    </Suspense>
  );
}
