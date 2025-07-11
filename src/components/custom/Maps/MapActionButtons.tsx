"use client";

interface MapActionButtonsProps {
  onPointsChange?: (
    value: number[][] | ((prevState: number[][]) => number[][])
  ) => void;
  pointers: number[][];
  setDistance: (distance: string | null) => void;
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
  isDisplayOnly: boolean;
}

export const MapActionButtons = ({
  onPointsChange,
  pointers,
  setDistance,
  routeGeoJSON,
  isDisplayOnly,
}: MapActionButtonsProps) => {
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
    <>
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
              isDisplayOnly ? "right-3" : "right-24 md:right-26"
            } rounded shadow-md bg-white border`}
          >
            <button
              onClick={openInGoogleMaps}
              className="border-r-2 hover:bg-gray-200 transition px-2 md:px-4 py-2 cursor-pointer"
            >
              GM 🌍
            </button>
            <button
              onClick={exportGPX}
              className="hover:bg-gray-200 transition px-2 md:px-4 py-2 cursor-pointer"
            >
              GPX 🧭
            </button>
          </div>
        </>
      )}
    </>
  );
};
