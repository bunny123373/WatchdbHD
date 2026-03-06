"use client";

import { useEffect, useState } from "react";
import { Film, Tv, PlayCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

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
      label: "Movies",
      value: stats.totalMovies,
      icon: Film,
      color: "bg-[#e50914]",
    },
    {
      label: "Series",
      value: stats.totalSeries,
      icon: Tv,
      color: "bg-purple-600",
    },
    {
      label: "Episodes",
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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 sm:p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {loading ? "-" : stat.value.toLocaleString()}
                </h3>
              </div>
              <div className={`w-10 h-10 sm:w-11 sm:h-11 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
