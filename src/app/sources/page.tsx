"use client";

import Link from "next/link";
import { FEED_SOURCES } from "@/lib/feeds";
import { SOURCE_BIAS, BiasRating, getSourceBias } from "@/lib/bias";
import { CATEGORIES, Category } from "@/lib/types";

const BIAS_COLORS: Record<BiasRating, string> = {
  [-2]: "bg-blue-500 text-white",
  [-1]: "bg-sky-400 text-white",
  [0]: "bg-gray-400 text-white",
  [1]: "bg-orange-400 text-white",
  [2]: "bg-red-500 text-white",
};

const BIAS_LABELS: Record<BiasRating, string> = {
  [-2]: "Left",
  [-1]: "Left-Center",
  [0]: "Center",
  [1]: "Right-Center",
  [2]: "Right",
};

// Deduplicate sources by name (same outlet may appear in multiple categories)
function getUniqueSources() {
  const seen = new Map<string, { name: string; categories: Category[] }>();
  for (const source of FEED_SOURCES) {
    if (seen.has(source.name)) {
      const existing = seen.get(source.name)!;
      if (!existing.categories.includes(source.category)) {
        existing.categories.push(source.category);
      }
    } else {
      seen.set(source.name, { name: source.name, categories: [source.category] });
    }
  }
  return Array.from(seen.values());
}

export default function SourcesPage() {
  const uniqueSources = getUniqueSources();

  // Group by category (use primary category = first one)
  const byCategory = new Map<Category, typeof uniqueSources>();
  for (const cat of CATEGORIES) {
    byCategory.set(cat.slug, []);
  }
  for (const source of uniqueSources) {
    const primary = source.categories[0];
    byCategory.get(primary)?.push(source);
  }

  // Count by bias
  const biasCounts: Record<BiasRating, number> = { [-2]: 0, [-1]: 0, [0]: 0, [1]: 0, [2]: 0 };
  for (const source of uniqueSources) {
    const info = getSourceBias(source.name);
    biasCounts[info.rating]++;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Our Sources
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {uniqueSources.length} outlets across {CATEGORIES.length} categories. Political bias ratings from AllSides and Media Bias/Fact Check.
      </p>

      {/* Bias distribution summary */}
      <div className="flex flex-wrap gap-2 mb-8">
        {([-2, -1, 0, 1, 2] as BiasRating[]).map((rating) => (
          <div
            key={rating}
            className={`${BIAS_COLORS[rating]} px-3 py-1.5 rounded-full text-xs font-semibold`}
          >
            {BIAS_LABELS[rating]}: {biasCounts[rating]}
          </div>
        ))}
      </div>

      {/* Sources by category */}
      {CATEGORIES.map((cat) => {
        const sources = byCategory.get(cat.slug) || [];
        if (sources.length === 0) return null;

        return (
          <section key={cat.slug} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {cat.label} ({sources.length})
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
              {sources
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((source) => {
                  const bias = getSourceBias(source.name);
                  return (
                    <div
                      key={source.name}
                      className="flex items-center justify-between px-4 py-2.5"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {source.name}
                      </span>
                      <span
                        className={`${BIAS_COLORS[bias.rating]} text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap`}
                      >
                        {BIAS_LABELS[bias.rating]}
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>
        );
      })}

      <div className="text-center mt-6">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          &larr; Back to settings
        </Link>
      </div>
    </div>
  );
}
