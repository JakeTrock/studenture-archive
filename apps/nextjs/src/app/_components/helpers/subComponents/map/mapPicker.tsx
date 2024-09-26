"use client";

import { useMemo, useRef } from "react";
import { icon } from "leaflet";
import type { Marker as MarkerType } from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

export const DefaultLocation = {
  lat: 40.758896,
  lng: -73.98513,
};

const markerIcon = icon({
  iconUrl: `${window.origin}/marker-icon.png`,
  shadowUrl: `${window.origin}/marker-shadow.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapPicker({
  location,
  setLocation,
  radius,
}: {
  radius?: number;
  location: { lat: number; lng: number };
  setLocation: (location: { lat: number; lng: number }) => void;
}) {
  const markerRef = useRef<MarkerType>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setLocation(marker.getLatLng());
        }
      },
    }),
    [setLocation],
  );

  return (
    <div className="h-full w-full overflow-scroll border-2 border-yellow-100 backdrop-blur-xl">
      <MapContainer
        center={DefaultLocation}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {radius && (
          <Circle
            center={location}
            pathOptions={{ color: "blue" }}
            radius={radius * 100}
            opacity={0.2}
          />
        )}
        <Marker
          draggable={true}
          eventHandlers={eventHandlers}
          position={location}
          ref={markerRef}
          icon={markerIcon}
        >
          <Popup minWidth={90}>
            <span>{"click and drag to move marker"}</span>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
