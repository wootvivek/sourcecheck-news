"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/useSettings";
import { useViewPreference } from "@/hooks/useViewPreference";
import { CATEGORIES, ViewMode } from "@/lib/types";
import { SortOption } from "@/components/SortControl";

const SORT_OPTIONS: { value: SortOption; label: string; desc: string }[] = [
  { value: "echo", label: "SourceCheck", desc: "Highest source count first" },
  { value: "latest", label: "Latest", desc: "Most recent first" },
  { value: "tiered", label: "Tiered", desc: "Grouped by importance" },
];

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "grid", label: "Grid" },
  { value: "heatmap", label: "Heat Map" },
];

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

const MIN_SCORE_OPTIONS = [
  { value: 1, label: "Show all stories" },
  { value: 2, label: "2+ sources only" },
  { value: 3, label: "3+ sources only" },
];

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { viewMode, setViewMode } = useViewPreference();
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Settings
      </h1>

      {/* Display Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Display
        </h2>
        <div className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Default View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default View
            </label>
            <div className="flex gap-2">
              {VIEW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setViewMode(opt.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    viewMode === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Default Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Sort
            </label>
            <div className="flex gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ defaultSort: opt.value })}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    settings.defaultSort === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Theme
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  theme === opt.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feed Filters Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          Feed Filters
        </h2>
        <div className="space-y-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Minimum Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Source Score
            </label>
            <div className="flex flex-wrap gap-2">
              {MIN_SCORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ minScore: opt.value })}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    settings.minScore === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const hidden = settings.hiddenCategories.includes(cat.slug);
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      const next = hidden
                        ? settings.hiddenCategories.filter((c) => c !== cat.slug)
                        : [...settings.hiddenCategories, cat.slug];
                      updateSettings({ hiddenCategories: next });
                    }}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                      !hidden
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Tap to hide/show categories in your feed.
            </p>
          </div>
        </div>
      </section>

      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          &larr; Back to news
        </Link>
      </div>
    </div>
  );
}
