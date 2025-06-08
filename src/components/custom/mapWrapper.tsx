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

const TOKEN = process.env.NEXT_PUBLIC_MAPS_TOKEN;
type Transport = "cycling" | "driving";

enum STYLES {
  SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12",
  OOWT = "mapbox://styles/piotrti89/cm9vbcoe900hc01s05lmc3786",
  STREETS = "mapbox://styles/piotrti89/cm9vb55sw00gk01pg60by1rgf",
  MINIMO = "mapbox://styles/piotrti89/cm9zrwrbf00ml01s543vw21on",
}

export const MapWrapper = ({
  className,
  onPointsChange,
  pointers,
  isDisplayOnly = false,
}: {
  className?: string;
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][])
  ) => void;
  pointers: number[][];
  isDisplayOnly?: boolean;
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

  const mapRef = useRef<MapRef | null>(null);

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
    <div className={className}>
      <Map
        ref={mapRef}
        mapboxAccessToken={TOKEN}
        initialViewState={centerAndZoom}
        style={{ width: "auto", height: 500, borderRadius: "6px" }}
        mapStyle={style}
        attributionControl={false}
        onClick={handleMapClick}
      >
        <FullscreenControl />
        <GeolocateControl />
        <NavigationControl visualizePitch />

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
              <div className="absolute h-9 flex top-3 left-3 rounded shadow-md bg-white border">
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
              style === STYLES.OOWT && "bg-gray-200"
            }`}
            onClick={() => setStyle(STYLES.OOWT)}
          >
            OWT
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
