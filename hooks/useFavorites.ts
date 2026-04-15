"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("football-favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const toggleFavorite = (drillId: string | number, drillTitle?: string) => {
    const idString = String(drillId);
    const isAdding = !favorites.includes(idString);
    const newFavorites = isAdding
      ? [...favorites, idString]
      : favorites.filter((id) => id !== idString);
    
    setFavorites(newFavorites);
    localStorage.setItem("football-favorites", JSON.stringify(newFavorites));

    if (isAdding) {
      toast.success("Added to favorites", {
        description: drillTitle ? `${drillTitle} has been saved.` : "Drill saved to your collection."
      });
    } else {
      toast.error("Removed from favorites", {
        description: drillTitle ? `${drillTitle} has been removed.` : "Drill removed from your collection."
      });
    }
  };

  const isFavorite = (drillId: string | number) => favorites.includes(String(drillId));

  return { favorites, toggleFavorite, isFavorite };
}
