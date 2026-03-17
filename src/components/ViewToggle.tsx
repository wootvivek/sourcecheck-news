"use client";

import { ViewMode } from "@/lib/types";

interface ViewToggleProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const MODES: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    value: "grid",
    label: "Grid",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    value: "heatmap",
    label: "Heat Map",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="9" height="6" rx="1" />
        <rect x="12" y="1" width="3" height="6" rx="1" />
        <rect x="1" y="9" width="5" height="6" rx="1" />
        <rect x="8" y="9" width="7" height="6" rx="1" />
      </svg>
    ),
  },
];

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {MODES.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          title={mode.label}
          className={`p-1.5 rounded-md transition-colors ${
            value === mode.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          }`}
        >
          {mode.icon}
        </button>
      ))}
    </div>
  );
}
