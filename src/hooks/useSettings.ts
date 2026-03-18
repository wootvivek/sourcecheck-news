"use client";

import { useState, useEffect, useCallback } from "react";
import { Category } from "@/lib/types";
import { SortOption } from "@/components/SortControl";

export interface Settings {
  defaultSort: SortOption;
  minScore: number; // 1 = show all, 2 = 2+, 3 = 3+
  hiddenCategories: Category[];
}

const STORAGE_KEY = "sourcecheck-settings";

const DEFAULT_SETTINGS: Settings = {
  defaultSort: "echo",
  minScore: 1,
  hiddenCategories: [],
};

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettingsState({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Invalid JSON or localStorage unavailable
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage full or unavailable
      }
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
