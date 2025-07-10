"use client";

import {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

export const MapControls = () => {
  return (
    <>
      <FullscreenControl />
      <GeolocateControl />
      <NavigationControl visualizePitch />
    </>
  );
};
