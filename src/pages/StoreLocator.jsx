import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../StoreLocator.css";

// custom ikoon
const customIcon = new L.DivIcon({
  className: "custom-marker",
  html: '<div style="width:30px;height:30px;border-radius:50%;background:black;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold">L</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// väike komponent auto-zoomiks
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 10, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
}

function StoreLocator() {
  const stores = [
    { city: "Paris", coords: [48.8566, 2.3522], address: "123 Champs-Élysées" },
    { city: "London", coords: [51.5074, -0.1278], address: "45 Regent Street" },
    { city: "New York", coords: [40.7128, -74.006], address: "789 5th Avenue" },
    { city: "Copenhagen", coords: [55.6761, 12.5683], address: "12 Strøget" },
    { city: "Tallinn", coords: [59.437, 24.7536], address: "3 Viru Street" },
  ];

  const [query, setQuery] = useState("");
  const [filteredStores, setFilteredStores] = useState(stores);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);

    if (value.trim() === "") {
      setFilteredStores(stores);
      setSelectedCoords(null);
      return;
    }

    const results = stores.filter((store) =>
      store.city.toLowerCase().includes(value)
    );

    setFilteredStores(results.length > 0 ? results : []);
    if (results.length > 0) {
      setSelectedCoords(results[0].coords); // auto-zoom esimesele tulemusele
    } else {
      setSelectedCoords(null);
    }
  };

  return (
    <div className="store-locator">
      {/* Vasak pool - kaart */}
      <div className="map-section">
        <MapContainer
          center={[48.8566, 2.3522]}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {filteredStores.map((store, i) => (
            <Marker key={i} position={store.coords} icon={customIcon}>
              <Popup>
                <strong>{store.city}</strong>
                <br />
                {store.address}
              </Popup>
            </Marker>
          ))}
          {/* auto-zoom */}
          {selectedCoords && <FlyToLocation coords={selectedCoords} />}
        </MapContainer>
      </div>

      {/* Parem pool - sidebar */}
      <div className="sidebar">
        <h2>Find store</h2>
        <input
          type="text"
          placeholder="Enter city, address"
          className="search-input"
          value={query}
          onChange={handleSearch}
        />
        <div className="store-list">
          {filteredStores.length > 0 ? (
            filteredStores.map((store, i) => (
              <div key={i} className="store-card">
                <h3>{store.city}</h3>
                <p>{store.address}</p>
                <a href="#">See details</a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No stores found for "{query}"</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreLocator;
