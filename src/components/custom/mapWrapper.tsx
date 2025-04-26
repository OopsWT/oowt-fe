"use client";

import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  Source,
  Layer,
  Marker,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useState } from "react";
import { MapPin } from "../vectors/mapPin";

const TOKEN = process.env.NEXT_PUBLIC_MAPS_TOKEN;
type Transport = "cycling" | "driving";

export const MapWrapper = ({ className }: { className: string }) => {
  const [points, setPoints] = useState<number[][]>([]);
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

  const handleMapClick = useCallback(
    (event: { lngLat: { lng: number; lat: number } }) => {
      const { lngLat } = event;
      setPoints((prev) => [...prev, [lngLat.lng, lngLat.lat]]);
    },
    []
  );

  useEffect(() => {
    const fetchRoute = async () => {
      if (points.length < 2) return;
      setDistance(null);

      const coords = points.map((p) => `${p[0]},${p[1]}`).join(";");
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
  }, [points, transport]);

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
    if (points.length <= 2) {
      setDistance(null);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setDistance(null);
  };

  const openInGoogleMaps = () => {
    if (points.length < 2) return;
    const [start, ...rest] = points;
    const waypoints = rest.map((p) => `${p[1]},${p[0]}`).join("/");
    const url = `https://www.google.com/maps/dir/${start[1]},${start[0]}/${waypoints}`;
    window.open(url, "_blank");
  };

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

  return (
    <div className={className}>
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{
          longitude: 18.63,
          latitude: 53.0,
          zoom: 12,
        }}
        style={{ width: 740, height: 400, borderRadius: "8px" }}
        // mapStyle="mapbox://styles/piotrti89/cm9vbcoe900hc01s05lmc3786"
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        // mapStyle="mapbox://styles/piotrti89/cm9vb55sw00gk01pg60by1rgf"
        attributionControl={false}
        onClick={handleMapClick}
      >
        <FullscreenControl />
        <GeolocateControl />
        <NavigationControl visualizePitch />

        {points.map((coord, index) => (
          <Marker
            key={index}
            longitude={coord[0]}
            latitude={coord[1]}
            draggable
            onDragEnd={(e) => {
              const { lngLat } = e;
              setPoints((prev) => {
                const updated = [...prev];
                updated[index] = [lngLat.lng, lngLat.lat];
                return updated;
              });
            }}
            anchor="bottom"
          >
            <MapPin />
          </Marker>
        ))}
        {points.length >= 2 && routeGeoJSON && (
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                "line-color": "#ff5500",
                "line-width": 4,
              }}
            />
          </Source>
        )}
        {points.length > 0 && (
          <>
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
            <div className="absolute h-9 flex bottom-3 right-26 rounded shadow-md bg-white border">
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
        <div className="absolute flex bottom-3 right-3 bg-white border rounded border-gray-300 transition cursor-pointer">
          <span
            className={`w-10 h-9 mx-auto text-center text-2xl border-r-2 hover:bg-gray-200 ${
              transport === "cycling" && "bg-gray-200"
            }`}
            onClick={() => setTransport("cycling")}
          >
            🚲
          </span>
          <span
            className={`w-10 h-9 text-2xl text-center mx-auto hover:bg-gray-200 ${
              transport !== "cycling" && "bg-gray-200"
            }`}
            onClick={() => setTransport("driving")}
          >
            🏍️
          </span>
        </div>
      </Map>
    </div>
  );
};
