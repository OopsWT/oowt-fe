"use client";

import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  Source,
  Layer,
  Marker,
  MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin } from "../vectors/mapPin";
import { COLORS } from "../ui/consts";
import { Input } from "../ui/input";
import { useDebounce } from "../../hooks/useDebounce";

const TOKEN = process.env.NEXT_PUBLIC_MAPS_TOKEN;
type Transport = "cycling" | "driving";

interface SearchResult {
  id: string;
  place_name: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}

enum STYLES {
  SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12",
  STREETS = "mapbox://styles/piotrti89/cm9vb55sw00gk01pg60by1rgf",
  MINIMO = "mapbox://styles/piotrti89/cm9zrwrbf00ml01s543vw21on",
}

export const MapWrapper = ({
  className,
  onPointsChange,
  pointers,
  isDisplayOnly = false,
  setDistance: setDistanceProp, // <-- Add prop
}: {
  className?: string;
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][])
  ) => void;
  pointers: number[][];
  isDisplayOnly?: boolean;
  setDistance?: (distance: number | null) => void; // <-- Add prop type
}) => {
  const [style, setStyle] = useState<STYLES>(STYLES.MINIMO);
  const [transport, setTransport] = useState<Transport>("driving");
  const [routeGeoJSON, setRouteGeoJSON] = useState<{
    type: "FeatureCollection";
    features: [
      {
        type: "Feature";
        geometry: {
          type: "LineString";
          coordinates: number[][];
        };
        properties: object;
      }
    ];
  } | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  // Sync local distance state with parent when it changes
  useEffect(() => {
    if (setDistanceProp) {
      setDistanceProp(distance ? Number(distance) : null);
    }
  }, [distance, setDistanceProp]);

  // Search functionality state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const mapRef = useRef<MapRef | null>(null);
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

  const handleMapClick = useCallback(
    (event: { lngLat: { lng: number; lat: number } }) => {
      const { lngLat } = event;
      if (onPointsChange) {
        onPointsChange((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
      }
    },
    [onPointsChange]
  );

  useEffect(() => {
    const fetchRoute = async () => {
      if (pointers.length < 2) return;
      setDistance(null);

      const coords = pointers.map((p) => `${p[0]},${p[1]}`).join(";");
      const url = `https://api.mapbox.com/directions/v5/mapbox/${transport}/${coords}?geometries=geojson&access_token=${TOKEN}`;

      const res = await fetch(url);
      const data = await res.json();
      const route = data.routes[0];

      if (route?.geometry) {
        setRouteGeoJSON({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: route.geometry,
              properties: {},
            },
          ],
        });
        setDistance((route.distance / 1000).toFixed(2));
      }
    };

    fetchRoute();
  }, [pointers, transport]);

  const handleUndo = () => {
    if (onPointsChange) {
      onPointsChange(pointers?.slice(0, -1));
      if (pointers?.length <= 2) {
        setDistance(null);
      }
    }
  };

  const handleClear = () => {
    if (onPointsChange) {
      onPointsChange([]);
      setDistance(null);
    }
  };

  const openInGoogleMaps = () => {
    if (pointers?.length < 2) return;
    const [start, ...rest] = pointers;
    const waypoints = rest.map((p) => `${p[1]},${p[0]}`).join("/");
    const url = `https://www.google.com/maps/dir/${start[1]},${start[0]}/${waypoints}`;
    window.open(url, "_blank");
  };

  // TODO: move to separate component
  const exportGPX = () => {
    if (!routeGeoJSON) return;

    const gpx = `
      <?xml version="1.0" encoding="UTF-8"?>
      <gpx version="1.1" creator="ReactMapApp" xmlns="http://www.topografix.com/GPX/1/1">
        <trk>
          <name>Eksportowana Trasa</name>
          <trkseg>
            ${routeGeoJSON.features[0].geometry.coordinates
              .map(([lon, lat]) => `<trkpt lat="${lat}" lon="${lon}"></trkpt>`)
              .join("\n")}
          </trkseg>
        </trk>
      </gpx>
    `;

    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trasa.gpx";
    a.click();
  };

  // Search functionality
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
      // If bbox is available, fit bounds to it
      const [minLng, minLat, maxLng, maxLat] = result.bbox;
      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 50, duration: 1000 }
      );
    } else {
      // Otherwise, fly to the center coordinates
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

  // Search effect
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

  const calculateCenterAndZoom = (points: number[][]) => {
    if (points.length === 0) {
      return { longitude: 18.63, latitude: 53.0, zoom: 12 }; // Default center and zoom
    }

    // Calculate bounding box
    const bounds = points.reduce(
      (acc, [lng, lat]) => {
        acc.minLng = Math.min(acc.minLng, lng);
        acc.minLat = Math.min(acc.minLat, lat);
        acc.maxLng = Math.max(acc.maxLng, lng);
        acc.maxLat = Math.max(acc.maxLat, lat);
        return acc;
      },
      {
        minLng: Infinity,
        minLat: Infinity,
        maxLng: -Infinity,
        maxLat: -Infinity,
      }
    );

    // Calculate center
    const center = {
      longitude: (bounds.minLng + bounds.maxLng) / 2,
      latitude: (bounds.minLat + bounds.maxLat) / 2,
    };

    // Calculate zoom level based on the bounding box size
    const WORLD_DIM = { width: 1024, height: 512 }; // Map dimensions in pixels
    const ZOOM_MAX = 20;

    const latDiff = bounds.maxLat - bounds.minLat;
    const lngDiff = bounds.maxLng - bounds.minLng;

    const latZoom = Math.log2(WORLD_DIM.height / latDiff);
    const lngZoom = Math.log2(WORLD_DIM.width / lngDiff);

    const zoom = Math.min(latZoom, lngZoom, ZOOM_MAX) - 2;

    return { ...center, zoom: Math.floor(zoom) };
  };

  if (!pointers) return;

  const centerAndZoom = calculateCenterAndZoom(pointers);

  return (
    <div className={`h-[350px] md:h-[500px] ${className}`}>
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={centerAndZoom}
        mapStyle={style}
        attributionControl={false}
        onClick={handleMapClick}
      >
        <FullscreenControl />
        <GeolocateControl />
        <NavigationControl visualizePitch />

        {/* Location Search */}
        {!isDisplayOnly && (
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

            {/* Search Results Dropdown */}
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

            {/* No Results Message */}
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
        )}

        {pointers?.map((coord, index) => (
          <Marker
            key={index}
            longitude={coord[0]}
            latitude={coord[1]}
            draggable={!isDisplayOnly}
            onDragEnd={(e) => {
              if (onPointsChange) {
                const { lngLat } = e;
                onPointsChange((prev) => {
                  const updated = [...prev];
                  updated[index] = [lngLat.lng, lngLat.lat];
                  return updated;
                });
              }
            }}
            anchor="bottom"
          >
            <MapPin />
          </Marker>
        ))}
        {pointers?.length >= 2 && routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": COLORS.PRIMARY,
                "line-width": 4,
              }}
            />
          </Source>
        )}
        {pointers?.length > 0 && (
          <>
            {!isDisplayOnly && (
              <div className="absolute h-9 flex top-16 left-3 rounded shadow-md bg-white border">
                <button
                  onClick={handleUndo}
                  className="border-gray-300 border-r-2 px-4 py-2 hover:bg-gray-100 transition cursor-pointer"
                >
                  🔙
                </button>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 hover:bg-gray-100 transition cursor-pointer"
                >
                  Wyczyść
                </button>
              </div>
            )}
            <div
              className={`absolute h-9 flex bottom-3 ${
                isDisplayOnly ? "right-3" : "right-26"
              } rounded shadow-md bg-white border`}
            >
              <button
                onClick={openInGoogleMaps}
                className="border-r-2 hover:bg-gray-200 transition px-4 py-2 cursor-pointer"
              >
                GM 🌍
              </button>
              <button
                onClick={exportGPX}
                className="hover:bg-gray-200 transition px-4 py-2 cursor-pointer"
              >
                GPX 🧭
              </button>
            </div>
          </>
        )}
        {distance && (
          <div className="absolute bottom-9 left-3 bg-white border border-gray-300 rounded px-4 py-2 shadow-md text-sm">
            Trasa: <strong>{distance} km</strong>
          </div>
        )}
        <div className="absolute text-xs flex flex-col bottom-15 right-3 bg-white shadow-md border rounded border-gray-300 transition cursor-pointer">
          <button
            className={`w-7 h-7 border-b-1 cursor-pointer ${
              style === STYLES.SATELLITE && "bg-gray-200"
            }`}
            onClick={() => setStyle(STYLES.SATELLITE)}
          >
            SAT
          </button>
          <button
            className={`w-7 h-7 border-b-1 cursor-pointer ${
              style === STYLES.STREETS && "bg-gray-200"
            }`}
            onClick={() => setStyle(STYLES.STREETS)}
          >
            STR
          </button>
          <button
            className={`w-7 h-7 border-b-1 cursor-pointer ${
              style === STYLES.MINIMO && "bg-gray-200"
            }`}
            onClick={() => setStyle(STYLES.MINIMO)}
          >
            MIN
          </button>
        </div>
        {!isDisplayOnly && (
          <div className="absolute flex bottom-3 right-3 bg-white shadow-md border rounded border-gray-300 transition cursor-pointer">
            <span
              className={`w-9 h-9 mx-auto text-center text-2xl border-r-2 hover:bg-gray-200 ${
                transport === "cycling" && "bg-gray-200"
              }`}
              onClick={() => setTransport("cycling")}
            >
              🚲
            </span>
            <span
              className={`w-9 h-9 text-2xl text-center mx-auto hover:bg-gray-200 ${
                transport !== "cycling" && "bg-gray-200"
              }`}
              onClick={() => setTransport("driving")}
            >
              🏍️
            </span>
          </div>
        )}
      </Map>
    </div>
  );
};
