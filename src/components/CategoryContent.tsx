"use client";

import { CATEGORIES, Category, Article } from "@/lib/types";
import ArticleGrid from "@/components/ArticleGrid";
import CategoryPills from "@/components/CategoryPills";
import LoadingScreen from "@/components/LoadingScreen";
import LocationPrompt from "@/components/LocationPrompt";
import { useArticles } from "@/hooks/useArticles";
import { useLocation } from "@/hooks/useLocation";

interface CategoryContentProps {
  slug: Category;
  initialArticles: Article[] | null;
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
  const { articles, loading } = useArticles(
    slug,
    city,
    isLocal ? null : initialArticles
  );

  const categoryInfo = CATEGORIES.find((c) => c.slug === slug);

  return (
    <>
      <CategoryPills />

      {isLocal ? (
        <>
          <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
            {location ? `📍 Local — ${location.city}` : "📍 Local News"}
          </h1>
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
          <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
            {categoryInfo?.label || slug}
          </h1>
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
