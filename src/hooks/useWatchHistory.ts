"use client";

import { useEffect } from "react";
import { IContent } from "@/models/Content";

export function useWatchHistory() {
  useEffect(() => {
    // Initialize watch history storage if not exists
    if (typeof window !== "undefined" && !localStorage.getItem("watchHistory")) {
      localStorage.setItem("watchHistory", JSON.stringify([]));
    }
  }, []);

  const addToHistory = (content: IContent, progress: number = 0) => {
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem("watchHistory");
    let history: {content: IContent, watchedAt: number, progress: number}[] = saved ? JSON.parse(saved) : [];
    
    // Remove if already exists
    history = history.filter(h => String(h.content._id) !== String(content._id));
    
    // Add to beginning
    history.unshift({
      content,
      watchedAt: Date.now(),
      progress
    });
    
    // Keep only last 50
    history = history.slice(0, 50);
    
    localStorage.setItem("watchHistory", JSON.stringify(history));
  };

  const updateProgress = (contentId: string, progress: number) => {
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem("watchHistory");
    let history: {content: IContent, watchedAt: number, progress: number}[] = saved ? JSON.parse(saved) : [];
    
    const index = history.findIndex(h => String(h.content._id) === String(contentId));
    if (index !== -1) {
      history[index].progress = progress;
      history[index].watchedAt = Date.now();
      localStorage.setItem("watchHistory", JSON.stringify(history));
    }
  };

  const removeFromHistory = (contentId: string) => {
    if (typeof window === "undefined") return;
    
    const saved = localStorage.getItem("watchHistory");
    let history: {content: IContent, watchedAt: number, progress: number}[] = saved ? JSON.parse(saved) : [];
    
    history = history.filter(h => String(h.content._id) !== String(contentId));
    localStorage.setItem("watchHistory", JSON.stringify(history));
  };

  return { addToHistory, updateProgress, removeFromHistory };
}
