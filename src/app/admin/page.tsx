"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BellRing, Boxes, ClipboardList, Film, LayoutDashboard, ShieldCheck, Sparkles, Tv, TriangleAlert } from "lucide-react";
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
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, blurb: "Overview and stats" },
  { id: "upload-movie", label: "Upload Movie", icon: Film, blurb: "Add new movies" },
  { id: "upload-series", label: "Upload Series", icon: Tv, blurb: "Publish seasons and episodes" },
  { id: "manage", label: "Manage Content", icon: Boxes, blurb: "Edit existing entries" },
  { id: "requests", label: "Requests", icon: ClipboardList, blurb: "Review user asks" },
  { id: "reports", label: "Reports", icon: TriangleAlert, blurb: "Moderation queue" },
  { id: "collections", label: "Collections", icon: Sparkles, blurb: "Curated rows" },
  { id: "notification", label: "Send Notification", icon: BellRing, blurb: "Broadcast updates" },
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

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(229,9,20,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-5 sm:p-6 lg:p-8">
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-red-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin Workspace
              </div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Control content operations from one responsive dashboard.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
                Switch between uploads, moderation, collections, and platform updates without losing context on smaller screens.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[420px]">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Current View</p>
                <p className="mt-2 text-sm font-semibold text-white">{activeTabMeta.label}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Focus</p>
                <p className="mt-2 text-sm font-semibold text-white">Fast mobile access</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500">Workflow</p>
                <p className="mt-2 text-sm font-semibold text-white">Publish, review, notify</p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`group flex min-h-[92px] items-start gap-3 rounded-[24px] border p-4 text-left transition-all ${
                activeTab === tab.id
                  ? "border-red-500/30 bg-red-500/10 text-white shadow-[0_16px_40px_rgba(229,9,20,0.12)]"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.05]"
              }`}
            >
              <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${
                activeTab === tab.id ? "bg-red-600 text-white" : "bg-white/5 text-gray-300"
              }`}>
                <tab.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{tab.label}</p>
                <p className={`mt-1 text-xs ${activeTab === tab.id ? "text-red-100/90" : "text-gray-400"}`}>
                  {tab.blurb}
                </p>
              </div>
            </button>
          ))}
        </div>

        <section className="rounded-[32px] border border-white/10 bg-[#111111]/90 p-4 sm:p-5 lg:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <AdminStats />
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <h2 className="text-xl font-bold text-white">Welcome to Admin Panel</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                    Use the navigation cards above to move between uploads, moderation, requests, and collection management.
                    The layout is tuned for quick switching on all device sizes.
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <h3 className="mb-2 font-semibold text-white">Upload Movie</h3>
                      <p className="text-sm text-gray-400">Add new movies with streaming and download links.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <h3 className="mb-2 font-semibold text-white">Upload Series</h3>
                      <p className="text-sm text-gray-400">Add full season structures with episode links.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <h3 className="mb-2 font-semibold text-white">Manage Content</h3>
                      <p className="text-sm text-gray-400">Review and update existing movies or series.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(229,9,20,0.12),rgba(255,255,255,0.03))] p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-white">Quick Guidance</h2>
                  <div className="mt-4 space-y-4 text-sm text-gray-200">
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="font-medium text-white">1. Publish</p>
                      <p className="mt-1 text-gray-300">Add movies or series first, then jump to Manage Content for verification.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="font-medium text-white">2. Moderate</p>
                      <p className="mt-1 text-gray-300">Check Requests and Reports regularly to keep the catalog healthy.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                      <p className="font-medium text-white">3. Notify</p>
                      <p className="mt-1 text-gray-300">Use notifications after major uploads or collection refreshes.</p>
                    </div>
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

          {activeTab === "requests" && (
            <AdminRequests />
          )}

          {activeTab === "reports" && (
            <AdminReports />
          )}

          {activeTab === "collections" && (
            <AdminCollections />
          )}

          {activeTab === "notification" && (
            <div className="max-w-3xl">
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <h2 className="mb-4 text-xl font-bold text-white">Send Notification</h2>
                <NotificationForm />
              </div>
            </div>
          )}
        </section>
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
