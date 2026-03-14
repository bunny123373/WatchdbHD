"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Film, Tv, Boxes, ClipboardList, TriangleAlert, Sparkles, BellRing, LayoutDashboard } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminStats from "@/components/admin/AdminStats";
import UploadMovieForm from "@/components/admin/UploadMovieForm";
import UploadSeriesForm from "@/components/admin/UploadSeriesForm";
import AdminContentTable from "@/components/admin/AdminContentTable";
import NotificationForm from "@/components/admin/NotificationForm";
import AdminRequests from "@/components/admin/AdminRequests";
import AdminCollections from "@/components/admin/AdminCollections";
import AdminReports from "@/components/admin/AdminReports";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "upload-movie", label: "Add Movie", icon: Film },
  { id: "upload-series", label: "Add Series", icon: Tv },
  { id: "manage", label: "Manage", icon: Boxes },
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
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="bg-black border-b border-white/10 px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">{activeTabMeta.label}</h1>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white/10 rounded text-white"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Desktop */}
        <div className="hidden md:flex gap-1 px-4 py-3 border-b border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-black"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10">
            <div className="grid grid-cols-2 gap-2 p-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
        )}

        {/* Content */}
        <div className="p-4">
          {activeTab === "dashboard" && (
            <div className="space-y-4">
              <AdminStats />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          )}

          {activeTab === "upload-movie" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Add New Movie</h2>
              <UploadMovieForm onSuccess={handleUploadSuccess} />
            </div>
          )}

          {activeTab === "upload-series" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Add New Series</h2>
              <UploadSeriesForm onSuccess={handleUploadSuccess} />
            </div>
          )}

          {activeTab === "manage" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Manage Content</h2>
              <AdminContentTable refreshTrigger={refreshTrigger} />
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">User Requests</h2>
              <AdminRequests />
            </div>
          )}

          {activeTab === "reports" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Reports</h2>
              <AdminReports />
            </div>
          )}

          {activeTab === "collections" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Collections</h2>
              <AdminCollections />
            </div>
          )}

          {activeTab === "notification" && (
            <div className="bg-white/5 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-4">Send Notification</h2>
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
