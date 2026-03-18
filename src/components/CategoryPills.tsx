"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "@/lib/types";

export default function CategoryPills() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/"
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          pathname === "/"
            ? "bg-blue-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => {
        const active = pathname === `/category/${cat.slug}`;
        const isLocal = cat.slug === "local";
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active
                ? isLocal
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {isLocal ? "📍 " : ""}{cat.label}
          </Link>
        );
      })}
      {/* Spacer to push Quiet Corner right */}
      <div className="flex-1" />
      <Link
        href="/quiet-corner"
        className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          pathname === "/quiet-corner"
            ? "bg-purple-600 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        Quiet Corner
      </Link>
    </div>
  );
}
