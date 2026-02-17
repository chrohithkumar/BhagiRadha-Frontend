import { useEffect, useState, useRef } from "react";
import Card from "../components/Card";
import ConfirmModal from "../components/ConfirmModal";
import LocationPicker from "../components/LocationPicker";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { PhoneCall } from 'lucide-react';
import AdvanceBookingModal from "../pages/AdvanceBookingModal";

// 🌍 Plant Location
const PLANT_LAT = 16.531837;
const PLANT_LON = 81.973862;

// 📏 Distance utility (Haversine formula)
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Home() {
  const [normal, setNormal] = useState(0);
  const [cool, setCool] = useState(0);
  const [bookingType, setBookingType] = useState("daily");
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [defaultAddress, setDefaultAddress] = useState("");

  const [address, setAddress] = useState(""); // final address used for order
  const [manualAddress, setManualAddress] = useState("");
  const [selectedAddressOption, setSelectedAddressOption] = useState("default");

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [initialPosition, setInitialPosition] = useState({ lat: 17.385044, lng: 78.486671 });

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setName(localStorage.getItem("userName") || "");
    setMobileNumber(localStorage.getItem("userMobile") || "");
    const storedAddress = localStorage.getItem("address") || "";
    setDefaultAddress(storedAddress);
    setAddress(storedAddress);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setInitialPosition({ lat, lng });
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);



  const NORMAL_PRICE = 20;
  const COOL_PRICE = 40;
  const totalCost = normal * NORMAL_PRICE + cool * COOL_PRICE;
  const fullAddress = address || manualAddress || "";

  const canReview =
    name &&
    mobileNumber &&
    latitude &&
    longitude &&
    address &&
    (normal > 0 || cool > 0);

  const handleLogout = () => {
    toast.success("Logged out successfully!", { autoClose: 3000 });
    setTimeout(() => {
      localStorage.clear();
      navigate("/login");
    }, 1000);
  };

  const resetForm = () => {
    setNormal(0);
    setCool(0);
  };

  // ✅ New: handle review click with distance check
  const handleReviewClick = () => {
    if (!latitude || !longitude) {
      toast.error("Please select a delivery location on the map");
      return;
    }

    const distance = getDistanceInKm(PLANT_LAT, PLANT_LON, latitude, longitude);
    if (distance > 5) {
      Swal.fire({
        icon: 'error',
        title: 'Out of Range',
        text: 'You are out of range to book order (5 km limit)',
      });
      toast.error("You are out of range to book order (5 km limit)");
      return;
    }

    setOpen(true);
  };

  const handleOrders = () => {
    navigate("/userorderhistory");
  }

  const handlePhoneCall = () => {
    window.location.href = `tel:+919951062449`;
  };

  const handleAdvanceOrders = () => {
    setBookingType("advance");
    setAdvanceModalOpen(true);
  };
  return (
    <div className="min-h-screen bg-sky-50 p-6">
      {/* Logout Button */}
      <div className="flex justify-end mb-6 gap-x-4">
        <button
          onClick={handlePhoneCall}
          className="inline-flex items-center justify-center px-1 py-1 rounded-xl bg-white text-sky-700 font-semibold border border-sky-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <PhoneCall size={24} />
        </button>
        <button
          onClick={handleOrders}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-sky-700 font-semibold border border-sky-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          View Orders
        </button>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-sky-700 font-semibold border border-sky-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Log Out
        </button>
      </div>
      <div className="flex justify-end mb-6 gap-x-4">
        <button
          onClick={handleAdvanceOrders}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-sky-700 font-semibold border border-yellow-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          AdvanceBooking
        </button>

      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-sky-700">PureDrop</h1>
        <p className="text-gray-500 mb-6">Fresh water delivered</p>

        {/* Products */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card icon="🌊" title="Normal Water" desc="20L Can" price="₹20" value={normal} setValue={setNormal} />
          <Card icon="❄️" title="Cooling Water" desc="20L Can" price="₹40" value={cool} setValue={setCool} />
        </div>

        {/* User Info */}
        <input
          className="w-full p-3 border rounded-lg mt-6 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          className="w-full p-3 border rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
          placeholder="Your Mobile Number"
          value={mobileNumber}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) setMobileNumber(value);
          }}
        />

        {/* Map Picker */}
        <div className="mt-6">
          <label className="font-semibold block mb-2">Select Location on Map</label>
          <LocationPicker
            initialPosition={initialPosition}
            selectedAddress={address}
            onLocationSelect={(loc) => {
              setLatitude(loc.lat);
              setLongitude(loc.lng);
              setAddress(loc.address || "");
              setManualAddress("");
              setSelectedAddressOption("default");
            }}
          />
          {address && (
            <div className="mt-2 p-2 bg-white border rounded-lg text-sm">
              <strong>Area:</strong> {address}
            </div>
          )}
        </div>

        {/* Review Button */}
        <button
          onClick={handleReviewClick}
          disabled={!canReview}
          className={`w-full py-4 mt-6 rounded-xl text-white font-semibold transition
            ${canReview ? "bg-sky-600 hover:bg-sky-700" : "bg-gray-400 cursor-not-allowed"}`}
        >
          Review Order
        </button>
        <AdvanceBookingModal
          open={advanceModalOpen}
          onClose={() => setAdvanceModalOpen(false)}
        />

        {/* Confirm Modal */}
        <ConfirmModal
          open={open}
          onClose={() => setOpen(false)}
          normal={normal}
          cool={cool}
          name={name}
          onSuccess={resetForm}
          number={mobileNumber}
          total={totalCost}
          address={fullAddress}
          latitude={latitude}
          longitude={longitude}
          bookingType="daily"
        />
      </div>
    </div>
  );
}
