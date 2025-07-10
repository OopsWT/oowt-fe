"use client";

interface MapDistanceDisplayProps {
  distance: string | null;
}

export const MapDistanceDisplay = ({ distance }: MapDistanceDisplayProps) => {
  return (
    <>
      {distance && (
        <div className="absolute bottom-9 left-3 bg-white border border-gray-300 rounded px-4 py-2 shadow-md text-sm">
          Trasa: <strong>{distance} km</strong>
        </div>
      )}
    </>
  );
};
