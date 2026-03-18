"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "sourcecheck-location";

export interface LocationData {
  city: string;
  lat?: number;
  lng?: number;
  source: "gps" | "manual";
}

export function useLocation() {
  const [location, setLocationState] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLocationState(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveLocation = useCallback((data: LocationData) => {
    setLocationState(data);
    setError(null);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, []);

  /**
   * Request location via browser Geolocation API,
   * then reverse geocode to city name via Nominatim.
   */
  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000, // 5 min cache
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocode via OpenStreetMap Nominatim (free, no API key)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
        {
          headers: {
            "User-Agent": "SourceCheckNews/1.0",
          },
        }
      );

      if (!res.ok) throw new Error("Reverse geocoding failed");

      const data = await res.json();
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        "Unknown";
      const state = address.state || "";
      const cityDisplay = state ? `${city}, ${state}` : city;

      saveLocation({
        city: cityDisplay,
        lat: latitude,
        lng: longitude,
        source: "gps",
      });
    } catch (err) {
      const msg =
        err instanceof GeolocationPositionError
          ? err.code === 1
            ? "Location permission denied. Please enter your city manually."
            : "Could not determine location. Please enter your city manually."
          : "Location lookup failed. Please enter your city manually.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [saveLocation]);

  const setManualCity = useCallback(
    (city: string) => {
      saveLocation({ city: city.trim(), source: "manual" });
    },
    [saveLocation]
  );

  const clearLocation = useCallback(() => {
    setLocationState(null);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    setManualCity,
    clearLocation,
  };
}
