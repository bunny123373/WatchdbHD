"use client";

import { useState, useEffect } from "react";
import { IContent } from "@/models/Content";

export function useFavorites() {
  const [favorites, setFavorites] = useState<IContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const addToFavorites = (content: IContent) => {
    const newFavorites = [...favorites, content];
    setFavorites(newFavorites);
    localStorage.setItem("watchlist", JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (contentId: string) => {
    const newFavorites = favorites.filter((f) => String(f._id) !== contentId);
    setFavorites(newFavorites);
    localStorage.setItem("watchlist", JSON.stringify(newFavorites));
  };

  const isFavorite = (contentId: string) => {
    return favorites.some((f) => String(f._id) === contentId);
  };

  return { favorites, addToFavorites, removeFromFavorites, isFavorite, loading };
}
