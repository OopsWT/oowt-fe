"use client";

import Map, { MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { MapControls } from "./Maps/MapControls";
import { MapSearch } from "./Maps/MapSearch";
import { MapMarkers } from "./Maps/MapMarkers";
import { MapRoute } from "./Maps/MapRoute";
import { MapActionButtons } from "./Maps/MapActionButtons";
import { MapDistanceDisplay } from "./Maps/MapDistanceDisplay";
import { MapStyleSelector } from "./Maps/MapStyleSelector";
import { MapTransportSelector } from "./Maps/MapTransportSelector";
import { STYLES } from "./Maps/MapStyleSelector";
import { calculateCenterAndZoom, fetchRoute, Transport } from "./Maps/utils";

const TOKEN = process.env.NEXT_PUBLIC_MAPS_TOKEN;

export const MapWrapper = ({
  className,
  onPointsChange,
  pointers,
  isDisplayOnly = false,
  setDistance: setDistanceProp,
}: {
  className?: string;
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][])
  ) => void;
  pointers: number[][];
  isDisplayOnly?: boolean;
  setDistance?: (distance: number | null) => void;
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
    fetchRoute(pointers, transport, setRouteGeoJSON, setDistance);
  }, [pointers, transport, setRouteGeoJSON, setDistance]);

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
        <MapControls />

        {!isDisplayOnly && <MapSearch mapRef={mapRef} />}

        <MapMarkers
          pointers={pointers}
          isDisplayOnly={isDisplayOnly}
          onPointsChange={onPointsChange}
        />
        <MapRoute routeGeoJSON={routeGeoJSON} pointers={pointers} />
        <MapActionButtons
          onPointsChange={onPointsChange}
          pointers={pointers}
          setDistance={setDistance}
          routeGeoJSON={routeGeoJSON}
          isDisplayOnly={isDisplayOnly}
        />
        <MapDistanceDisplay distance={distance} />
        <MapStyleSelector style={style} setStyle={setStyle} />
        <MapTransportSelector
          transport={transport}
          setTransport={setTransport}
          isDisplayOnly={isDisplayOnly}
        />
      </Map>
    </div>
  );
};
