"use client";

import { useState, useEffect, useCallback } from "react";

export interface DownloadedItem {
  id: string;
  title: string;
  poster: string;
  type: "movie" | "series";
  quality: string;
  language: string;
  downloadedAt: string;
  size?: number;
  season?: number;
  episode?: number;
}

const STORAGE_KEY = "watchdb_downloads";

export function useDownloads() {
  const [downloads, setDownloads] = useState<DownloadedItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setDownloads(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse downloads:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveToStorage = useCallback((items: DownloadedItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    setDownloads(items);
  }, []);

  const addDownload = useCallback((item: Omit<DownloadedItem, "downloadedAt">) => {
    const newItem: DownloadedItem = {
      ...item,
      downloadedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...downloads];
    saveToStorage(updated);
    return newItem;
  }, [downloads, saveToStorage]);

  const removeDownload = useCallback((id: string) => {
    const updated = downloads.filter((d) => d.id !== id);
    saveToStorage(updated);
  }, [downloads, saveToStorage]);

  const isDownloaded = useCallback((id: string) => {
    return downloads.some((d) => d.id === id);
  }, [downloads]);

  const getDownload = useCallback((id: string) => {
    return downloads.find((d) => d.id === id);
  }, [downloads]);

  const clearAllDownloads = useCallback(() => {
    saveToStorage([]);
  }, [saveToStorage]);

  return {
    downloads,
    isLoaded,
    addDownload,
    removeDownload,
    isDownloaded,
    getDownload,
    clearAllDownloads,
  };
}
