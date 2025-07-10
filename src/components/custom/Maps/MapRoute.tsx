"use client";

import { Source, Layer } from "react-map-gl/mapbox";
import { COLORS } from "../../ui/consts";

interface MapRouteProps {
  routeGeoJSON: {
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
  } | null;
  pointers: number[][];
}

export const MapRoute = ({ routeGeoJSON, pointers }: MapRouteProps) => {
  return (
    <>
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
    </>
  );
};
