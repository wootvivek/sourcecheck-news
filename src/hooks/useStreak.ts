"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "sourcecheck-streak";

interface StreakData {
  currentStreak: number;
  lastVisit: string; // YYYY-MM-DD
  longestStreak: number;
  totalVisits: number;
}

const DEFAULT: StreakData = {
  currentStreak: 0,
  lastVisit: "",
  longestStreak: 0,
  totalVisits: 0,
};

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useStreak() {
  const [streak, setStreak] = useState<StreakData>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let data: StreakData = stored ? JSON.parse(stored) : { ...DEFAULT };

      const today = getToday();
      const yesterday = getYesterday();

      if (data.lastVisit === today) {
        // Already visited today — just load
        setStreak(data);
        return;
      }

      // New day visit
      if (data.lastVisit === yesterday) {
        // Consecutive day — extend streak
        data.currentStreak += 1;
      } else if (data.lastVisit === "") {
        // First ever visit
        data.currentStreak = 1;
      } else {
        // Streak broken — reset to 1
        data.currentStreak = 1;
      }

      data.lastVisit = today;
      data.totalVisits += 1;
      if (data.currentStreak > data.longestStreak) {
        data.longestStreak = data.currentStreak;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStreak(data);
    } catch {
      // ignore
    }
  }, []);

  return streak;
}
