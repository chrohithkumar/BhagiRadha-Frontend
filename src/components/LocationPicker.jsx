import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { BaseURL } from "../Utills/baseurl";

/* Fix leaflet marker issue */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* India default */
const INDIA_CENTER = [22.5937, 78.9629];

/* 🔥 Delivery Center Settings */
const DELIVERY_CENTER = {
  lat: 16.531837,
  lng: 81.973862,
  radiusKm: 7,
};

/* Distance Calculator */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function LocationPicker({
  initialPosition,
  onLocationSelect,
  selectedAddress,
}) {
  const [position, setPosition] = useState(initialPosition || null);
  const [displayName, setDisplayName] = useState("");
  const [userSelectedCenter, setUserSelectedCenter] =
    useState(initialPosition || null);

  const [searchAddress, setSearchAddress] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  const [deliveryError, setDeliveryError] = useState("");

  /* Main Location Update Function */
  const updateLocation = async (lat, lng) => {
    const distance = calculateDistance(
      DELIVERY_CENTER.lat,
      DELIVERY_CENTER.lng,
      lat,
      lng
    );

    if (distance > DELIVERY_CENTER.radiusKm) {
      setDeliveryError(
        `Delivery not available. Selected location is ${distance.toFixed(
          2
        )} km away (max ${DELIVERY_CENTER.radiusKm} km).`
      );
      return;
    }

    setDeliveryError("");

    setPosition([lat, lng]);
    setUserSelectedCenter([lat, lng]);

    let address = "";

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(
        `${BaseURL}location/reverse?lat=${lat}&lon=${lng}`,
        {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) throw new Error("Reverse geocoding failed");

      const data = await res.json();
      address = data.display_name || "";
      setDisplayName(address);
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      setDisplayName("");
    }

    onLocationSelect({ lat, lng, address });
  };

  /* Address Search */
  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return;

    try {
      setSearchLoading(true);

      const response = await fetch(
        `${BaseURL}location/search?query=${encodeURIComponent(searchAddress)}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        await updateLocation(lat, lng);
      } else {
        setDeliveryError("Address not found within delivery area.");
      }
    } catch (error) {
      console.error("Address search failed:", error);
      setDeliveryError("Search failed. Try again.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAutoDetect = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => setDeliveryError("Unable to detect your location."),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        updateLocation(e.latlng.lat, e.latlng.lng);
      },
    });
    return position ? <Marker position={position} /> : null;
  }

  useEffect(() => {
    if (
      initialPosition &&
      initialPosition.length === 2 &&
      typeof initialPosition[0] === "number" &&
      typeof initialPosition[1] === "number"
    ) {
      updateLocation(initialPosition[0], initialPosition[1]);
    }
  }, [initialPosition]);



  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-gray-700">
          Choose delivery location
        </p>
        <button
          type="button"
          onClick={handleAutoDetect}
          className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          Auto Detect
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search address (e.g. Peruru)"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleAddressSearch}
          disabled={searchLoading}
          className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </div>

      {deliveryError && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm p-3 rounded-lg">
          {deliveryError}
        </div>
      )}

      <div className="rounded-lg overflow-hidden border">
        <MapContainer
          center={initialPosition || INDIA_CENTER}
          zoom={initialPosition ? 14 : 5}
          style={{ height: "280px", width: "100%" }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          {userSelectedCenter && (
            <RecenterMap center={userSelectedCenter} />
          )}
        </MapContainer>
      </div>


      {position && !deliveryError && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-sky-700 mb-1">
            Selected Location
          </p>
          <p className="text-gray-600">
            {displayName ||
              "Location Not selected or (address unavailable)"}
          </p>
        </div>
      )}
    </div>
  );
}
