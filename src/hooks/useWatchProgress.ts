"use client";

import { useState, useEffect } from "react";
import { IContent } from "@/models/Content";

interface WatchProgress {
  contentId: string;
  progress: number;
  timestamp: number;
  content: IContent;
}

export function useWatchProgress() {
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("watchProgressFull");
    if (saved) {
      const progressData: WatchProgress[] = JSON.parse(saved);
      progressData.sort((a, b) => b.timestamp - a.timestamp);
      setContinueWatching(progressData.slice(0, 10));
    }
  }, []);

  const saveProgress = (content: IContent, progress: number) => {
    const saved = localStorage.getItem("watchProgressFull");
    let progressData: WatchProgress[] = saved ? JSON.parse(saved) : [];
    
    progressData = progressData.filter(p => p.contentId !== String(content._id));
    progressData.push({
      contentId: String(content._id),
      progress,
      timestamp: Date.now(),
      content
    });
    
    progressData.sort((a, b) => b.timestamp - a.timestamp);
    progressData = progressData.slice(0, 20);
    
    localStorage.setItem("watchProgressFull", JSON.stringify(progressData));
    setContinueWatching(progressData.slice(0, 10));
  };

  return { continueWatching, saveProgress };
}
