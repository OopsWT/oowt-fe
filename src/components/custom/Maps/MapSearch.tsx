"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "../../ui/input";
import { useDebounce } from "../../../hooks/useDebounce";
import { MapRef } from "react-map-gl/mapbox";
import { TOKEN } from "./utils";

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}

interface MapSearchProps {
  mapRef: React.RefObject<MapRef | null>;
}

export const MapSearch = ({ mapRef }: MapSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchRef = useRef<HTMLDivElement | null>(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchLocations = async (query: string): Promise<SearchResult[]> => {
    if (!query || query.length < 2) return [];

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${TOKEN}&types=place,locality,neighborhood&limit=5`;

      const response = await fetch(url);
      const data = await response.json();

      return (
        data.features?.map(
          (feature: {
            id: string;
            place_name: string;
            center: [number, number];
            bbox?: [number, number, number, number];
          }) => ({
            id: feature.id,
            place_name: feature.place_name,
            center: feature.center,
            bbox: feature.bbox,
          })
        ) || []
      );
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  };

  const centerMapOnLocation = (result: SearchResult) => {
    if (!mapRef.current) return;

    if (result.bbox) {
      const [minLng, minLat, maxLng, maxLat] = result.bbox;
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 50, duration: 1000 }
      );
    } else {
      mapRef.current.flyTo({
        center: result.center,
        zoom: 12,
        duration: 1000,
      });
    }
  };

  const handleLocationSelect = (result: SearchResult) => {
    centerMapOnLocation(result);
    setSearchQuery(result.place_name);
    setShowResults(false);
  };

  useEffect(() => {
    if (debouncedSearchQuery.length >= 2) {
      setIsSearching(true);
      searchLocations(debouncedSearchQuery)
        .then((results) => {
          setSearchResults(results);
          setShowResults(true);
          setIsSearching(false);
        })
        .catch(() => {
          setSearchResults([]);
          setShowResults(false);
          setIsSearching(false);
        });
    } else {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  return (
    <div ref={searchRef} className="absolute top-3 left-3 w-80 z-10">
      <div className="relative">
        <Input
          type="text"
          placeholder="Szukaj miejscowości..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-60 md:w-full bg-white shadow-md border border-gray-300"
          onFocus={() => setSearchQuery("")}
        />
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto z-20">
          {searchResults.map((result) => (
            <button
              key={result.id}
              onClick={() => handleLocationSelect(result)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 truncate">
                {result.place_name}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        searchResults.length === 0 &&
        debouncedSearchQuery.length >= 2 &&
        !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
            <div className="px-4 py-2 text-sm text-gray-500">
              Nie znaleziono wyników
            </div>
          </div>
        )}
    </div>
  );
};
