"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gdp_favorites_v1";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setFavorites(JSON.parse(raw));
      }
    } catch (err) {
      console.error("Failed to read favorites from localStorage", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (err) {
      console.error("Failed to write favorites to localStorage", err);
    }
  }, [favorites]);

  function toggleFavorite(id: number | string, _title?: string) {
    const sid = String(id);
    setFavorites((prev) => {
      if (prev.includes(sid)) return prev.filter((p) => p !== sid);
      return [...prev, sid];
    });
  }

  function isFavorite(id: number | string) {
    return favorites.includes(String(id));
  }

  return { favorites, toggleFavorite, isFavorite } as const;
}
