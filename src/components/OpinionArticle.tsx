"use client";

import { OpinionPiece } from "@/lib/types";
import { SOURCE_BIAS } from "@/lib/bias";
import type { BiasRating } from "@/lib/bias";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CATEGORY_BG: Record<string, string> = {
  world: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  politics: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  tech: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  business: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  health: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  sports: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  science: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  entertainment: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  opinion: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  local: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const BIAS_COLORS: Record<BiasRating, string> = {
  [-2]: "#3b82f6", // blue-500
  [-1]: "#0ea5e9", // sky-500
  [0]: "#6b7280",  // gray-500
  [1]: "#f97316",  // orange-500
  [2]: "#ef4444",  // red-500
};

const BIAS_LABELS: Record<BiasRating, string> = {
  [-2]: "Left",
  [-1]: "Left-Center",
  [0]: "Center",
  [1]: "Right-Center",
  [2]: "Right",
};

// ── Bias Spectrum Bar ─────────────────────────────────────────────

function BiasSpectrumBar({ sources }: { sources: { source: string; link: string }[] }) {
  // Map sources to their bias positions
  const dots = sources
    .map((s) => {
      const rating = (SOURCE_BIAS[s.source] ?? 0) as BiasRating;
      return { source: s.source, rating, color: BIAS_COLORS[rating] };
    })
    // Sort left to right
    .sort((a, b) => a.rating - b.rating);

  // Count per position for stacking
  const positionCounts: Record<number, number> = {};

  return (
    <div className="relative">
      {/* Labels */}
      <div className="flex justify-between text-[9px] text-gray-400 dark:text-gray-500 mb-1.5 px-1">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
      {/* Track */}
      <div className="relative h-8 rounded-full bg-gradient-to-r from-blue-500/10 via-gray-200/30 to-red-500/10 dark:from-blue-500/20 dark:via-gray-700/30 dark:to-red-500/20 border border-gray-200/50 dark:border-gray-700/50">
        {/* Center line */}
        <div className="absolute left-1/2 top-1 bottom-1 w-px bg-gray-300 dark:bg-gray-600" />
        {/* Dots */}
        {dots.map((dot, i) => {
          // Map rating (-2 to 2) to percentage (5% to 95%)
          const pct = ((dot.rating + 2) / 4) * 90 + 5;
          // Stack dots at same position
          const key = dot.rating;
          positionCounts[key] = (positionCounts[key] || 0);
          const stackOffset = positionCounts[key] * 14;
          positionCounts[key]++;

          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 group/dot"
              style={{ left: `${pct}%`, marginLeft: `${stackOffset - (((positionCounts[key] || 1) - 1) * 7)}px` }}
              title={`${dot.source} (${BIAS_LABELS[dot.rating]})`}
            >
              <div
                className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 shadow-sm flex items-center justify-center text-[7px] font-bold text-white cursor-default transition-transform hover:scale-125"
                style={{ backgroundColor: dot.color }}
              >
                {dot.source.charAt(0)}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 bg-gray-900 dark:bg-gray-700 text-white text-[9px] rounded whitespace-nowrap opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none z-10">
                {dot.source}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Confidence Gauge ──────────────────────────────────────────────

function ConfidenceGauge({ confidence }: { confidence: number }) {
  const clamped = Math.max(0, Math.min(100, confidence));

  // Color based on confidence level
  let color: string;
  let label: string;
  if (clamped >= 80) {
    color = "#22c55e"; // green-500
    label = "High confidence";
  } else if (clamped >= 60) {
    color = "#eab308"; // yellow-500
    label = "Moderate confidence";
  } else if (clamped >= 40) {
    color = "#f97316"; // orange-500
    label = "Mixed signals";
  } else {
    color = "#ef4444"; // red-500
    label = "Low confidence";
  }

  // SVG arc calculation for semicircle gauge
  const radius = 40;
  const circumference = Math.PI * radius; // half circle
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-14">
        <svg viewBox="0 0 100 55" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Filled arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Percentage text */}
          <text x="50" y="48" textAnchor="middle" className="text-sm font-bold fill-gray-900 dark:fill-white" fontSize="16">
            {clamped}%
          </text>
        </svg>
      </div>
      <span className="text-[10px] font-medium mt-0.5" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────

export default function OpinionArticle({ opinion }: { opinion: OpinionPiece }) {
  const catBg = CATEGORY_BG[opinion.category] || CATEGORY_BG.world;

  return (
    <article className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 sm:px-6 sm:pt-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${catBg}`}>
            {opinion.category}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            AI Analysis
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
          {opinion.headline}
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">
          {opinion.summary}
        </p>
      </div>

      {/* Visuals: Bias Spectrum + Confidence Gauge */}
      <div className="px-5 pb-4 sm:px-6 flex flex-col sm:flex-row gap-4 items-stretch">
        {/* Bias Spectrum */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Source Spectrum
          </div>
          <BiasSpectrumBar sources={opinion.sourceArticles} />
        </div>
        {/* Confidence Gauge */}
        <div className="flex flex-col items-center justify-center sm:border-l sm:border-gray-200 sm:dark:border-gray-700/50 sm:pl-4">
          <div className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            Prediction
          </div>
          <ConfidenceGauge confidence={opinion.confidence} />
        </div>
      </div>

      {/* Markdown body */}
      <div className="px-5 pb-4 sm:px-6">
        <div className="opinion-prose text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-5 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => <p className="mb-3">{children}</p>,
              ul: ({ children }) => (
                <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900 dark:text-white">
                  {children}
                </strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-3 border-blue-500 pl-3 my-3 text-gray-600 dark:text-gray-400 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {opinion.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Sources footer */}
      <div className="px-5 py-4 sm:px-6 border-t border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30">
        <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Sources ({opinion.sourceArticles.length})
        </div>
        <div className="flex flex-wrap gap-1.5">
          {opinion.sourceArticles.map((src, i) => (
            <a
              key={i}
              href={src.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-[11px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
              title={src.title}
            >
              {src.source}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
