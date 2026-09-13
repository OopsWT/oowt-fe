"use client";

import { Marker } from "react-map-gl/mapbox";
import { MapPin } from "../../vectors/mapPin";

interface MapMarkersProps {
  pointers: number[][];
  isDisplayOnly: boolean;
  selectedSearchMarker?: [number, number] | null;
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][]),
  ) => void;
}

export const MapMarkers = ({
  pointers,
  isDisplayOnly,
  selectedSearchMarker,
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

      {selectedSearchMarker && (
        <Marker
          longitude={selectedSearchMarker[0]}
          latitude={selectedSearchMarker[1]}
          anchor="bottom"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-amber-500 shadow-lg">
            <div className="h-2.5 w-2.5 rounded-full bg-white" />
          </div>
        </Marker>
      )}
    </>
  );
};
