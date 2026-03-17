"use client";

export type SortOption = "latest" | "echo" | "tiered";

interface SortControlProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "echo", label: "SourceCheck" },
  { value: "latest", label: "Latest" },
  { value: "tiered", label: "Tiered" },
];

export default function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === opt.value
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
