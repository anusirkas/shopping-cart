"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Store } from "@/data/editorial";

const icon = new L.DivIcon({
  className: "store-marker",
  html: "<span>A</span>",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

function FlyTo({ target }: { target: Store | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target.coords, 13, { duration: 1.4 });
    else map.flyTo([50, -10], 3, { duration: 1 });
  }, [target, map]);
  return null;
}

type Props = { stores: Store[]; selected: Store | null; onSelect: (store: Store) => void };

export default function StoreMap({ stores, selected, onSelect }: Props) {
  return (
    <MapContainer center={[50, -10]} zoom={3} scrollWheelZoom={false} className="store-map">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {stores.map((s) => (
        <Marker key={s.city} position={s.coords} icon={icon} eventHandlers={{ click: () => onSelect(s) }}>
          <Popup>
            <strong>Auro {s.city}</strong>
            <br />
            {s.address}
          </Popup>
        </Marker>
      ))}
      <FlyTo target={selected} />
    </MapContainer>
  );
}
