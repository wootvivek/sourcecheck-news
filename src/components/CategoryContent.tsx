"use client";

import { CATEGORIES, Category, Article } from "@/lib/types";
import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import LocationPrompt from "@/components/LocationPrompt";
import { useArticles } from "@/hooks/useArticles";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useLocation } from "@/hooks/useLocation";

interface CategoryContentProps {
  slug: Category;
  initialArticles: Article[] | null;
}

function RefreshButton({
  isRefreshing,
  onRefresh,
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors disabled:opacity-50"
      title="Refresh stories"
    >
      <svg
        className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
  );
}

export default function CategoryContent({
  slug,
  initialArticles,
}: CategoryContentProps) {
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
    setManualCity,
    clearLocation,
  } = useLocation();

  const isLocal = slug === "local";
  const city = isLocal ? location?.city : undefined;
  const { articles, loading, refreshing, refresh } = useArticles(
    slug,
    city,
    isLocal ? null : initialArticles
  );

  const { pullDistance, refreshing: pullRefreshing, triggerRefresh } =
    usePullToRefresh(refresh);

  const isRefreshing = refreshing || pullRefreshing;

  const categoryInfo = CATEGORIES.find((c) => c.slug === slug);

  return (
    <>
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center overflow-hidden transition-all"
          style={{ height: pullDistance }}
        >
          <div
            className={`text-2xl transition-transform ${
              pullDistance >= 80 ? "scale-125" : ""
            }`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          >
            🔄
          </div>
        </div>
      )}

      {/* Refreshing banner */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-2 py-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Refreshing…
        </div>
      )}

      <CategoryPills />

      {isLocal ? (
        <>
          <div className="flex items-center justify-between mt-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {location ? `📍 Local — ${location.city}` : "📍 Local News"}
            </h1>
            {location && (
              <RefreshButton isRefreshing={isRefreshing} onRefresh={triggerRefresh} />
            )}
          </div>
          {!location ? (
            <LocationPrompt
              location={null}
              loading={locationLoading}
              error={locationError}
              onRequestLocation={requestLocation}
              onManualCity={setManualCity}
              onClearLocation={clearLocation}
            />
          ) : loading ? (
            <LoadingScreen />
          ) : (
            <>
              <div className="mb-4">
                <LocationPrompt
                  location={location}
                  loading={locationLoading}
                  error={locationError}
                  onRequestLocation={requestLocation}
                  onManualCity={setManualCity}
                  onClearLocation={clearLocation}
                />
              </div>
              <ArticleGrid articles={articles} />
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mt-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {categoryInfo?.label || slug}
            </h1>
            <RefreshButton isRefreshing={isRefreshing} onRefresh={triggerRefresh} />
          </div>
          {loading ? (
            <LoadingScreen />
          ) : (
            <ArticleGrid articles={articles} />
          )}
        </>
      )}
    </>
  );
}
