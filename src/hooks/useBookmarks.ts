"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sourcecheck-bookmarks";

export interface BookmarkedArticle {
  id: string;
  title: string;
  source: string;
  link: string;
  imageUrl?: string;
  echoScore: number;
  savedAt: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedArticle[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const save = (stored: BookmarkedArticle[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore
    }
  };

  const addBookmark = useCallback(
    (article: { id: string; title: string; source: string; link: string; imageUrl?: string; echoScore: number }) => {
      setBookmarks((prev) => {
        if (prev.some((b) => b.id === article.id)) return prev;
        const next = [{ ...article, savedAt: new Date().toISOString() }, ...prev];
        save(next);
        return next;
      });
    },
    []
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      save(next);
      return next;
    });
  }, []);

  const isBookmarked = useCallback(
    (id: string) => bookmarks.some((b) => b.id === id),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
