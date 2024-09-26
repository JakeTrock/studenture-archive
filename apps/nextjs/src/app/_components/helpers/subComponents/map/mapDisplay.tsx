"use client";

import { Circle, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

interface MapDisplayProps {
  lat: number;
  lng: number;
}

export default function MapDisplay({ lat, lng }: MapDisplayProps) {
  return (
    <div className="h-full w-full border-2 border-yellow-100 backdrop-blur-xl">
      <MapContainer
        center={{
          lat,
          lng,
        }}
        zoom={12}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={[lat, lng]}
          pathOptions={{ color: "red" }}
          radius={1000}
          opacity={0.2}
        />
        <Circle center={[lat, lng]} pathOptions={{ color: "blue" }} radius={10}>
          <Popup minWidth={90}>
            <span>{`latitude: ${lat}, longitude: ${lng}`}</span>
          </Popup>
        </Circle>
      </MapContainer>
    </div>
  );
}
