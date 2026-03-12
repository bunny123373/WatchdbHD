"use client";

import { useEffect, useState } from "react";
import { Film, Tv, PlayCircle, TrendingUp, ArrowUpRight } from "lucide-react";
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
      color: "from-[#e50914] to-[#b20710]",
      accent: "text-red-300",
    },
    {
      label: "Series",
      value: stats.totalSeries,
      icon: Tv,
      color: "from-sky-500 to-cyan-500",
      accent: "text-sky-300",
    },
    {
      label: "Episodes",
      value: stats.totalEpisodes,
      icon: PlayCircle,
      color: "from-emerald-500 to-green-500",
      accent: "text-emerald-300",
    },
    {
      label: "Trending",
      value: stats.trendingCount,
      icon: TrendingUp,
      color: "from-amber-500 to-orange-500",
      accent: "text-amber-300",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-4 sm:p-5 transition-colors hover:border-white/20"
          >
            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.color}`} />
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/[0.03] blur-2xl transition-transform duration-300 group-hover:scale-125" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-gray-500">{stat.label}</p>
                <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                  {loading ? "-" : stat.value.toLocaleString()}
                </h3>
                <div className={`mt-3 inline-flex items-center gap-1 text-xs ${stat.accent}`}>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Live platform count
                </div>
              </div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-[0_12px_30px_rgba(0,0,0,0.25)]`}>
                <Icon className="h-5 w-5 text-white sm:h-6 sm:w-6" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
