"use client";

import { computeSpectrum, BiasRating, BIAS_LABELS } from "@/lib/bias";

interface BiasSpectrumProps {
  sources: string[];
  compact?: boolean;
}

// Maps bias rating to position on 0-100% scale
function ratingToPercent(rating: BiasRating): number {
  // -2 → 0%, -1 → 25%, 0 → 50%, 1 → 75%, 2 → 100%
  return ((rating + 2) / 4) * 100;
}

export default function BiasSpectrum({ sources, compact = false }: BiasSpectrumProps) {
  const spectrum = computeSpectrum(sources);

  if (sources.length <= 1) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-32 h-2 rounded-full bg-gradient-to-r from-blue-400 via-gray-300 to-red-400">
          {spectrum.positions.map((p, i) => (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${ratingToPercent(p.rating)}%`,
                transform: `translate(-50%, -50%)`,
                backgroundColor: getColorForRating(p.rating),
              }}
              title={`${p.source}: ${p.info.label}`}
            />
          ))}
        </div>
        <span className="text-[11px] text-white/80 font-medium shrink-0">
          {spectrum.label}
        </span>
      </div>
    );
  }

  // Group sources by rating to avoid label overlap
  const grouped = new Map<BiasRating, string[]>();
  for (const p of spectrum.positions) {
    const existing = grouped.get(p.rating) || [];
    existing.push(p.source);
    grouped.set(p.rating, existing);
  }

  return (
    <div className="space-y-3">
      {/* Spectrum bar with dots only (no labels on the bar) */}
      <div>
        <div className="relative">
          <div className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-gray-300 to-red-500 dark:from-blue-400 dark:via-gray-600 dark:to-red-400" />
          {/* Dots for each unique rating position */}
          {Array.from(grouped.entries()).map(([rating, srcs]) => (
            <div
              key={rating}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${ratingToPercent(rating)}%` }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow-md"
                style={{ backgroundColor: getColorForRating(rating) }}
                title={srcs.join(", ")}
              />
              {srcs.length > 1 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[7px] font-bold flex items-center justify-center">
                  {srcs.length}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 mt-1.5">
          <span>Left</span>
          <span>Center</span>
          <span>Right</span>
        </div>
      </div>

      {/* Source list below the bar — no overlap possible */}
      <div className="flex flex-wrap gap-1.5">
        {spectrum.positions.map((p, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: getColorForRating(p.rating) }}
            />
            {p.source}
          </span>
        ))}
      </div>

      {/* Spread label */}
      <div className="flex items-center gap-1.5">
        <SpreadBadge spread={spectrum.spread} />
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {spectrum.label}
        </span>
      </div>
    </div>
  );
}

function SpreadBadge({ spread }: { spread: number }) {
  let color = "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400";
  if (spread >= 3) color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
  else if (spread >= 2) color = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  else if (spread >= 1) color = "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {spread >= 3 ? "◆◆◆" : spread >= 2 ? "◆◆" : spread >= 1 ? "◆" : "—"}
    </span>
  );
}

function getColorForRating(rating: BiasRating): string {
  const colors: Record<BiasRating, string> = {
    [-2]: "#3b82f6",
    [-1]: "#38bdf8",
    [0]: "#9ca3af",
    [1]: "#fb923c",
    [2]: "#ef4444",
  };
  return colors[rating];
}
