"use client";

interface MapStyleSelectorProps {
  style: STYLES;
  setStyle: (style: STYLES) => void;
}

export enum STYLES {
  SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12",
  STREETS = "mapbox://styles/piotrti89/cm9vb55sw00gk01pg60by1rgf",
  MINIMO = "mapbox://styles/piotrti89/cm9zrwrbf00ml01s543vw21on",
}

export const MapStyleSelector = ({
  style,
  setStyle,
}: MapStyleSelectorProps) => {
  return (
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
  );
};
