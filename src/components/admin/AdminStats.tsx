"use client";

import { useEffect, useState } from "react";
import { Film, Tv, PlayCircle, TrendingUp, ArrowUpRight } from "lucide-react";

interface Stats {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  trendingCount: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<Stats>({
    totalMovies: 0,
    totalSeries: 0,
    totalEpisodes: 0,
    trendingCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const adminKey = sessionStorage.getItem("adminKey");
      const response = await fetch("/api/admin/stats", {
        headers: { "x-admin-key": adminKey || "" },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: "Movies", value: stats.totalMovies, icon: Film, color: "bg-red-600" },
    { label: "Series", value: stats.totalSeries, icon: Tv, color: "bg-sky-600" },
    { label: "Episodes", value: stats.totalEpisodes, icon: PlayCircle, color: "bg-emerald-600" },
    { label: "Trending", value: stats.trendingCount, icon: TrendingUp, color: "bg-amber-600" },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:block">
      <div className="flex gap-3 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex-shrink-0 w-36 sm:w-auto relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-4"
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${stat.color}`} />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {loading ? "-" : stat.value}
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-1">Live count</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
