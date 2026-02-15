// import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import L from "leaflet";

// // Component to auto move map when admin moves
// function RecenterMap({ lat, lng }) {
//   const map = useMap();

//   useEffect(() => {
//     if (lat && lng) {
//       map.setView([lat, lng]);
//     }
//   }, [lat, lng, map]);

//   return null;
// }

// export default function TrackLocation() {
//   const { state } = useLocation();
//   const navigate = useNavigate(); // ✅ For back navigation
//   const userLat = state?.userLat;
//   const userLng = state?.userLng;

//   const [adminLocation, setAdminLocation] = useState(null);
//   const [routeCoords, setRouteCoords] = useState([]);

//   // ✅ Get Admin Live Location
//   useEffect(() => {
//     const watchId = navigator.geolocation.watchPosition(
//       (pos) => {
//         setAdminLocation({
//           lat: pos.coords.latitude,
//           lng: pos.coords.longitude,
//         });
//       },
//       (err) => console.log(err),
//       { enableHighAccuracy: true }
//     );

//     return () => navigator.geolocation.clearWatch(watchId);
//   }, []);

//   // ✅ Fetch Route from OSRM every 8 seconds
//   useEffect(() => {
//     if (!adminLocation || !userLat || !userLng) return;

//     const interval = setInterval(() => {
//       const url = `https://router.project-osrm.org/route/v1/driving/${adminLocation.lng},${adminLocation.lat};${userLng},${userLat}?overview=full&geometries=geojson`;

//       fetch(url)
//         .then((res) => res.json())
//         .then((data) => {
//           if (data.routes && data.routes.length > 0) {
//             const coords = data.routes[0].geometry.coordinates.map((c) => [
//               c[1],
//               c[0],
//             ]);
//             setRouteCoords(coords);
//           }
//         })
//         .catch((err) => console.log("Route error:", err));
//     }, 8000);

//     return () => clearInterval(interval);
//   }, [adminLocation, userLat, userLng]);

//   if (!adminLocation) return <div>Getting admin location...</div>;

//   return (
//     <div style={{ position: "relative", height: "100vh", width: "100%" }}>
//       {/* ✅ Back Button */}
//       <button
//         onClick={() => navigate(-1)} // go back to previous page
//         style={{
//           position: "absolute",
//           top: 10,
//           left: 10,
//           zIndex: 1000,
//           padding: "8px 12px",
//           background: "white",
//           borderRadius: "6px",
//           border: "1px solid #ccc",
//           boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
//         }}
//       >
//         ← Back
//       </button>

//       <MapContainer
//         center={[adminLocation.lat, adminLocation.lng]}
//         zoom={15}
//         style={{ height: "100%", width: "100%" }}
//       >
//         <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//         {/* Auto Follow Admin */}
//         <RecenterMap lat={adminLocation.lat} lng={adminLocation.lng} />

//         {/* Admin Marker */}
//         <Marker position={[adminLocation.lat, adminLocation.lng]} />

//         {/* User Marker */}
//         <Marker position={[userLat, userLng]} />

//         {/* Route Line */}
//         {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
//       </MapContainer>
//     </div>
//   );
// }
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom"; // Added useLocation
import { BaseURL } from "../Utills/baseurl";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom() || 15);
    }
  }, [center, map]);
  return null;
}

export default function TrackLocation() {
  const navigate = useNavigate();
  const { orderId: paramOrderId } = useParams(); 
  const location = useLocation(); // Hook to access state passed from navigate

  // 1. Logic to get OrderID and Initial Location from Navigation State
  // This prioritizes the state passed by the button, but falls back to URL params if refreshing
  const orderId = location.state?.orderId || paramOrderId;
  
  const [adminLocation, setAdminLocation] = useState(null);
  
  // Initialize userLocation directly from state if available (Instant load!)
  const [userLocation, setUserLocation] = useState(
    location.state?.userLat && location.state?.userLng
      ? { lat: parseFloat(location.state.userLat), lng: parseFloat(location.state.userLng) }
      : null
  );

  const [routeCoords, setRouteCoords] = useState([]);
  const [statusMessage, setStatusMessage] = useState("Initializing...");
  const [error, setError] = useState(null);

  // 2. Fetch User Location (Only if not passed in state, or to refresh it)
  useEffect(() => {
    if (!orderId) {
      setError("No Order ID found. Please go back and select an order.");
      return;
    }

    // If we already have location from state, we don't strictly *need* to fetch immediately,
    // but we can do it silently to ensure data is fresh.
    const fetchUserLocation = async () => {
      if (!userLocation) setStatusMessage(`Fetching location for Order #${orderId}...`);
      
      try {
        const res = await fetch(`${BaseURL}location/order-location/${orderId}`);
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        
        const data = await res.json();
        
        if (!data.lat || !data.lng) throw new Error("Invalid location data");

        // Only update if different to avoid re-renders
        setUserLocation((prev) => {
            const newLat = parseFloat(data.lat);
            const newLng = parseFloat(data.lng);
            if (!prev || prev.lat !== newLat || prev.lng !== newLng) {
                return { lat: newLat, lng: newLng };
            }
            return prev;
        });
      } catch (err) {
        console.error("Fetch error:", err);
        // Only show error if we don't have a fallback location from state
        if (!userLocation) setError(err.message);
      }
    };

    fetchUserLocation();
  }, [orderId]); // Removed userLocation dependency to prevent loops

  // 3. Get Admin Live Location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    const success = (pos) => {
      setAdminLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    };

    const errorCallback = (err) => {
      console.warn("Geo Error:", err);
      // Optional: Set a default admin location for testing if GPS fails
      // setAdminLocation({ lat: 26.85, lng: 80.94 }); 
    };

    const watchId = navigator.geolocation.watchPosition(success, errorCallback, {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 10000
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 4. Fetch Route (OSRM)
  useEffect(() => {
    if (!adminLocation || !userLocation) return;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${adminLocation.lng},${adminLocation.lat};${userLocation.lng},${userLocation.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.routes?.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
          setRouteCoords((prev) => (JSON.stringify(prev) !== JSON.stringify(coords) ? coords : prev));
        }
      } catch (err) {
        console.error("Route fetch error:", err);
      }
    };

    fetchRoute();
    // Fetch route updates less frequently (every 10s) to be polite to OSRM API
    const interval = setInterval(fetchRoute, 10000);
    return () => clearInterval(interval);
  }, [adminLocation, userLocation]);

  // --- RENDER ---

  if (error) {
    return (
      <div style={{ padding: 20, color: "red", textAlign: "center" }}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="bg-gray-300 px-4 py-2 rounded mt-4">Go Back</button>
      </div>
    );
  }

  // If we have userLocation from state, we only wait for Admin Location (GPS)
  if (!userLocation) return <div style={{ padding: 20 }}>{statusMessage}</div>;
  if (!adminLocation) return <div style={{ padding: 20 }}>Acquiring GPS...</div>;

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute", top: 10, left: 10, zIndex: 1000,
          padding: "8px 12px", background: "white", borderRadius: 6,
          border: "1px solid #ccc", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          cursor: "pointer"
        }}
      >
        ← Back
      </button>

      <MapContainer center={[adminLocation.lat, adminLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <RecenterMap center={[adminLocation.lat, adminLocation.lng]} />
        
        <Marker position={[adminLocation.lat, adminLocation.lng]} title="You" />
        <Marker position={[userLocation.lat, userLocation.lng]} title="Order Location" />
        
        {routeCoords.length > 0 && <Polyline positions={routeCoords} color="blue" />}
      </MapContainer>
    </div>
  );
}