export const TOKEN = process.env.NEXT_PUBLIC_MAPS_TOKEN;
export type Transport = "cycling" | "driving";

export const calculateCenterAndZoom = (points: number[][]) => {
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
    },
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

interface RouteGeoJSON {
  type: "FeatureCollection";
  features: [
    {
      type: "Feature";
      geometry: {
        type: "LineString";
        coordinates: number[][];
      };
      properties: object;
    },
  ];
}

export const fetchRoute = async (
  pointers: number[][],
  transport: Transport,
  setRouteGeoJSON: (data: RouteGeoJSON | null) => void,
  setDistance: (distance: string | null) => void,
) => {
  if (pointers.length < 2) return;
  setDistance(null);

  const coords = pointers.map((p) => `${p[0]},${p[1]}`).join(";");
  const url = `https://api.mapbox.com/directions/v5/mapbox/${transport}/${coords}?geometries=geojson&overview=full&steps=true&alternatives=false&access_token=${TOKEN}`;

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
