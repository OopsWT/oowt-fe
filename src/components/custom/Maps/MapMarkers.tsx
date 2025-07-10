"use client";

import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "../../vectors/mapPin";

interface MapMarkersProps {
  pointers: number[][];
  isDisplayOnly: boolean;
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][])
  ) => void;
}

export const MapMarkers = ({
  pointers,
  isDisplayOnly,
  onPointsChange,
}: MapMarkersProps) => {
  return (
    <>
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
    </>
  );
};
