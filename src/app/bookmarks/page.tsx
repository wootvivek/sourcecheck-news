"use client";

import { useBookmarks } from "@/hooks/useBookmarks";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function BookmarksPage() {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        🔖 Saved Stories
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {bookmarks.length} {bookmarks.length === 1 ? "story" : "stories"} saved
      </p>

      {bookmarks.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📑</div>
          <p className="text-gray-400 dark:text-gray-500 text-lg mb-2">
            No saved stories yet
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            Tap the bookmark icon on any article to save it for later.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="flex gap-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              {b.imageUrl && (
                <img
                  src={b.imageUrl}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase">
                    {b.source}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Saved {timeAgo(b.savedAt)}
                  </span>
                </div>
                <a
                  href={b.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {b.title}
                </a>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                    {b.echoScore} {b.echoScore === 1 ? "source" : "sources"}
                  </span>
                  <button
                    onClick={() => removeBookmark(b.id)}
                    className="text-[10px] text-red-400 hover:text-red-500 transition-colors ml-auto"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
