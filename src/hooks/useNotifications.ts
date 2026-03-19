"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sourcecheck-notifications";
const SEEN_KEY = "sourcecheck-seen-breaking";

interface NotifSettings {
  enabled: boolean;
  minScore: number; // Minimum score to trigger notification (default 5)
}

const DEFAULT: NotifSettings = {
  enabled: false,
  minScore: 5,
};

export function useNotifications() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Load settings
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch {
      // ignore
    }

    // Check current permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const enable = useCallback(async () => {
    if (!("Notification" in window)) return false;

    const perm = await Notification.requestPermission();
    setPermission(perm);

    if (perm === "granted") {
      const next = { ...settings, enabled: true };
      setSettings(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return true;
    }
    return false;
  }, [settings]);

  const disable = useCallback(() => {
    const next = { ...settings, enabled: false };
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, [settings]);

  const notifyBreaking = useCallback(
    (title: string, sourceCount: number, url: string) => {
      if (!settings.enabled || permission !== "granted") return;
      if (sourceCount < settings.minScore) return;

      // Check if we already notified about this story
      try {
        const seen: string[] = JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
        const storyKey = title.slice(0, 50).toLowerCase();
        if (seen.includes(storyKey)) return;
        seen.push(storyKey);
        // Keep only last 100
        if (seen.length > 100) seen.splice(0, seen.length - 100);
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
      } catch {
        // ignore
      }

      // Show notification
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "BREAKING_NEWS",
          title: `🔴 ${sourceCount} sources reporting`,
          body: title,
          url,
        });
      } else {
        // Fallback: direct notification
        const n = new Notification(`🔴 ${sourceCount} sources reporting`, {
          body: title,
          icon: "/icon-192x192.png",
          badge: "/icon-96x96.png",
          tag: "breaking-" + title.slice(0, 20),
        });
        n.onclick = () => {
          window.open(url, "_blank");
          n.close();
        };
      }
    },
    [settings.enabled, settings.minScore, permission]
  );

  return {
    enabled: settings.enabled,
    permission,
    minScore: settings.minScore,
    enable,
    disable,
    notifyBreaking,
  };
}
