"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const DISMISS_KEY = "sourcecheck-notif-banner-dismissed";

export default function NotificationBanner() {
  const { enabled, permission, enable } = useNotifications();
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash
  const [supported, setSupported] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    setSupported("Notification" in window);
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "true");
    } catch {
      setDismissed(false);
    }
  }, []);

  // Don't show if: already enabled, dismissed, not supported, or permission denied
  if (enabled || dismissed || !supported || permission === "denied") return null;

  const handleEnable = async () => {
    setEnabling(true);
    const success = await enable();
    setEnabling(false);
    if (success) {
      // Banner will auto-hide since enabled becomes true
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "true");
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 p-4 mb-4">
      <div className="flex items-start gap-3">
        {/* Bell icon */}
        <div className="shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Never miss breaking news
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Get notified when a story hits 5+ independent sources.
          </p>
          <button
            onClick={handleEnable}
            disabled={enabling}
            className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-60"
          >
            {enabling ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Enabling…
              </>
            ) : (
              <>
                🔔 Turn on notifications
              </>
            )}
          </button>
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
