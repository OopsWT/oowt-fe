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
  featureType?: string;
}

interface MapSearchProps {
  mapRef: React.RefObject<MapRef | null>;
  onSelectLocation?: (coords: [number, number]) => void;
}

const getZoomForFeatureType = (featureType?: string) => {
  const zoomByType: Record<string, number> = {
    country: 4,
    region: 6,
    postcode: 8,
    district: 9,
    place: 10,
    locality: 11,
    neighborhood: 12,
    block: 12,
    street: 15,
    address: 16,
    poi: 18,
    category: 13,
  };

  return zoomByType[featureType || ""] ?? 12;
};

export const MapSearch = ({ mapRef, onSelectLocation }: MapSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const sessionTokenRef = useRef<string>("");

  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    sessionTokenRef.current = crypto.randomUUID();
  }, []);

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
    if (!query || query.length < 2 || !TOKEN) return [];

    try {
      const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
      const params = new URLSearchParams();
      params.set("q", query);
      params.set("access_token", TOKEN);
      params.set("language", "pl");
      params.set("limit", "5");
      params.set("session_token", sessionTokenRef.current);
      url.search = params.toString();

      const response = await fetch(url);
      const data = await response.json();

      return (
        data.suggestions?.map(
          (suggestion: {
            mapbox_id: string;
            name: string;
            place_formatted?: string;
            full_address?: string;
            feature_type?: string;
            context?: {
              place?: {
                name?: string;
              };
            };
          }) => {
            const placeContext = suggestion.context?.place?.name;
            const placeName =
              [suggestion.name, placeContext].filter(Boolean).join(", ") ||
              suggestion.place_formatted ||
              suggestion.full_address ||
              suggestion.name;

            return {
              id: suggestion.mapbox_id,
              place_name: placeName,
              center: [0, 0],
              featureType: suggestion.feature_type,
            };
          },
        ) || []
      );
    } catch (error) {
      console.error("Error searching locations:", error);
      return [];
    }
  };

  const retrieveLocationDetails = async (
    mapboxId: string,
  ): Promise<SearchResult> => {
    if (!TOKEN) {
      throw new Error("Mapbox token is missing");
    }

    const url = new URL(
      `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(mapboxId)}`,
    );
    const params = new URLSearchParams();
    params.set("access_token", TOKEN);
    params.set("language", "pl");
    params.set("session_token", sessionTokenRef.current);
    url.search = params.toString();

    const response = await fetch(url);
    const data = await response.json();
    const feature = data.features?.[0];
    const coords = feature?.geometry?.coordinates;
    const properties = feature?.properties || {};
    const bbox = properties.bbox;

    return {
      id: properties.mapbox_id || mapboxId,
      place_name:
        properties.place_formatted ||
        properties.full_address ||
        properties.name ||
        "Wybrane miejsce",
      center: coords ? [coords[0], coords[1]] : [0, 0],
      bbox: bbox ? [bbox[0], bbox[1], bbox[2], bbox[3]] : undefined,
      featureType: properties.feature_type,
    };
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
        { padding: 50, duration: 1000 },
      );
      return;
    }

    mapRef.current.flyTo({
      center: result.center,
      zoom: getZoomForFeatureType(result.featureType),
      duration: 1000,
    });
  };

  const handleLocationSelect = async (result: SearchResult) => {
    setShowResults(false);
    setSearchQuery("");

    try {
      const selectedLocation = await retrieveLocationDetails(result.id);
      onSelectLocation?.([
        selectedLocation.center[0],
        selectedLocation.center[1],
      ]);
      centerMapOnLocation(selectedLocation);
    } catch (error) {
      console.error("Error retrieving location details:", error);
      onSelectLocation?.([result.center[0], result.center[1]]);
      centerMapOnLocation(result);
    }
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
          placeholder="Szukaj miejsca..."
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
