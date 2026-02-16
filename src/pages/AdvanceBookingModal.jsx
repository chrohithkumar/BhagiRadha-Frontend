import { useState } from "react";
import ConfirmModal from "../components/ConfirmModal";
import LocationPicker from "../components/LocationPicker";
import { toast } from "react-toastify";

export default function AdvanceBookingModal({ open, onClose }) {
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [date, setDate] = useState("");
    const [normal, setNormal] = useState("");
    const [cool, setCool] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const NORMAL_PRICE = 20;
    const COOL_PRICE = 40;

    const normalQty = Number(normal) || 0;
    const coolQty = Number(cool) || 0;

    const total = normalQty * NORMAL_PRICE + coolQty * COOL_PRICE;

    if (!open) return null;

    const handleReview = () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (mobile.length !== 10) {
            toast.error("Enter valid 10 digit mobile number");
            return;
        }

        if (!date) {
            toast.error("Please select delivery date");
            return;
        }

        if (normalQty <= 0 && coolQty <= 0) {
            toast.error("Please choose quantity");
            return;
        }

        if (!address.trim()) {
            toast.error("Please provide delivery address");
            return;
        }

        setConfirmOpen(true);
    };

    const resetForm = () => {

        setDate("");
        setNormal("");
        setCool("");
        setAddress("");
        setLatitude(null);
        setLongitude(null);
    };

    // Tomorrow date restriction
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];

    return (
        <>
            <div className="fixed inset-0 z-[9999] bg-black bg-opacity-40 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">

                    <h2 className="text-2xl font-bold text-sky-700 mb-6">
                        Advance Booking
                    </h2>

                    {/* Name */}
                    <label className="block mb-1 font-semibold">Full Name</label>
                    <input
                        className="w-full p-3 border rounded-lg mb-4"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    {/* Mobile */}
                    <label className="block mb-1 font-semibold">Mobile Number</label>
                    <input
                        type="tel"
                        maxLength={10}
                        className="w-full p-3 border rounded-lg mb-4"
                        value={mobile}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (val.length <= 10) setMobile(val);
                        }}
                    />

                    {/* Date */}
                    <label className="block mb-1 font-semibold">Delivery Date</label>
                    <input
                        type="date"
                        min={minDate}
                        className="w-full p-3 border rounded-lg mb-4"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    {/* Quantity */}
                    <label className="block mb-2 font-semibold">Select Quantity</label>

                    <div className="mb-4">
                        <label className="block mb-1 font-medium">
                            Normal Water (20L) - ₹20
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="w-full p-3 border rounded-lg"
                            value={normal}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) >= 0) {
                                    setNormal(value);
                                }
                            }}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-1 font-medium">
                            Cooling Water (20L) - ₹40
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="w-full p-3 border rounded-lg"
                            value={cool}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || Number(value) >= 0) {
                                    setCool(value);
                                }
                            }}
                        />
                    </div>

                    {/* Manual Address */}
                    <label className="block mb-1 font-semibold">
                        Delivery Address
                    </label>
                    <textarea
                        placeholder="Enter full delivery address"
                        className="w-full p-3 border rounded-lg mb-4"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);

                            // If user types manually, clear map selection
                            if (latitude || longitude) {
                                setLatitude(null);
                                setLongitude(null);
                            }
                        }}
                    />

                    <div className="text-center font-semibold text-gray-500 my-3">
                        OR
                    </div>

                    {/* Location Picker */}
                    <LocationPicker
                        initialPosition={
                            latitude && longitude ? [latitude, longitude] : null
                        }
                        selectedAddress={address}
                        onLocationSelect={({ lat, lng, address }) => {
                            setLatitude(lat);
                            setLongitude(lng);
                            setAddress(address); // Auto-fill textarea
                        }}
                    />

                    {/* Review Button */}
                    <button
                        onClick={handleReview}
                        className="w-full mt-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700"
                    >
                        Review Order
                    </button>

                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-500 hover:text-black text-lg"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                normal={normalQty}
                cool={coolQty}
                name={name}
                number={mobile}
                total={total}
                address={address}
                latitude={latitude}
                longitude={longitude}
                bookingType="advance"
                deliveryDate={date}
                onSuccess={() => {
                    resetForm();     // 🔥 Clear all fields
                    setConfirmOpen(false);
                    onClose();       // 🔥 Close AdvanceBookingModal
                }}
            />
        </>
    );
}
