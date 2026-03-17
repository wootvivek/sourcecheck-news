"use client";

import { useState, useEffect, useCallback } from "react";
import { ViewMode } from "@/lib/types";

const STORAGE_KEY = "news-app-view-mode";

export function useViewPreference() {
  const [viewMode, setViewModeState] = useState<ViewMode>("grid");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "grid" || stored === "heatmap") {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
