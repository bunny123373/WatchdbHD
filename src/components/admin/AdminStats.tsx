"use client";

import { useEffect, useState } from "react";
import { Film, Tv, PlayCircle, TrendingUp } from "lucide-react";

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
    {
      label: "Total Movies",
      value: stats.totalMovies,
      icon: Film,
      color: "bg-red-600",
    },
    {
      label: "Total Series",
      value: stats.totalSeries,
      icon: Tv,
      color: "bg-purple-600",
    },
    {
      label: "Total Episodes",
      value: stats.totalEpisodes,
      icon: PlayCircle,
      color: "bg-green-600",
    },
    {
      label: "Trending",
      value: stats.trendingCount,
      icon: TrendingUp,
      color: "bg-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-[#1f1f1f] rounded-lg p-4 md:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {loading ? "-" : stat.value}
                </h3>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
