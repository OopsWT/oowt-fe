"use client";

interface MapDistanceDisplayProps {
  distance: string | null;
}

export const MapDistanceDisplay = ({ distance }: MapDistanceDisplayProps) => {
  return (
    <>
      {distance && (
        <div className="absolute bottom-8 md:bottom-9 left-3 bg-white border border-gray-300 rounded px-2 md:px-4 py-2 shadow-md text-sm">
          <span className="hidden md:inline">Trasa: </span>
          <b>{distance} km</b>
        </div>
      )}
    </>
  );
};
