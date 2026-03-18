"use client";

import { useState } from "react";
import { LocationData } from "@/hooks/useLocation";

interface LocationPromptProps {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  onRequestLocation: () => void;
  onManualCity: (city: string) => void;
  onClearLocation: () => void;
}

export default function LocationPrompt({
  location,
  loading,
  error,
  onRequestLocation,
  onManualCity,
  onClearLocation,
}: LocationPromptProps) {
  const [cityInput, setCityInput] = useState("");

  // Already have a location — show it with change option
  if (location) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          Showing local news for
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📍 {location.city}
        </p>
        <button
          onClick={onClearLocation}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Change location
        </button>
      </div>
    );
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onManualCity(cityInput.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📍</div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Set your location
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          We&apos;ll find local news for your area. Your location is stored only on
          your device.
        </p>
      </div>

      {/* GPS Button */}
      <button
        onClick={onRequestLocation}
        disabled={loading}
        className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Detecting location…
          </>
        ) : (
          "Use my location"
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
        <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">
          or
        </span>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-700" />
      </div>

      {/* Manual City Input */}
      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          placeholder="Enter city name (e.g., Austin, TX)"
          className="flex-1 px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!cityInput.trim()}
          className="px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Go
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="mt-3 text-sm text-red-500 dark:text-red-400 text-center">
          {error}
        </p>
      )}
    </div>
  );
}
