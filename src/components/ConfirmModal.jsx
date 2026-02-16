import axios from "axios";
import { BaseURL, userOrder } from "../Utills/baseurl";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function ConfirmModal({
  open,
  onClose,
  normal,
  cool,
  name,
  address,
  number,
  total,
  latitude,
  longitude,
  bookingType = "daily",
  deliveryDate,
  onSuccess,
}) 

{
  if (!open) return null;

  const handleConfirm = async () => {
    const orderData = {
      name,
      mobileNumber: number,
      address,
      latitude,
      longitude,
      normalQty: normal,
      coolQty: cool,
      totalAmount: total,
      bookingType,
      bookingDate:
        bookingType === "advance"
          ? deliveryDate
          : new Date().toISOString().split("T")[0],
    };

    const token = localStorage.getItem("token");
  
    try {
      const { data } = await axios.post(
        `${BaseURL}${userOrder}`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.message === "Order placed") {
        Swal.fire({
          title: "Success!",
          text:
            bookingType === "advance"
              ? "Your advance order has been scheduled successfully! 🎉"
              : "Your order has been placed successfully! 🎉",
          icon: "success",
          confirmButtonText: "OK",
        });

        toast.success(
          bookingType === "advance"
            ? "Advance order scheduled successfully! 🎉"
            : "Order placed successfully! 🎉",
          { autoClose: 3000 }
        );

        onSuccess && onSuccess();
        onClose();
      } else {
        Swal.fire({
          title: "Error",
          text: "Order failed. Please try again ❌",
          icon: "error",
        });

        toast.error("Order failed. Please try again ❌");
      }
    } catch (error) {
      toast.error("Something went wrong! 🚨");
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">

        <h2 className="text-2xl font-semibold text-sky-700 mb-4 text-center">
          Confirm Order
        </h2>

        <div className="space-y-3 text-gray-700 text-sm">

          <div className="flex justify-between">
            <span className="font-medium">Booking Type:</span>
            <span className="capitalize">{bookingType}</span>
          </div>

          {bookingType === "advance" && (
            <div className="flex justify-between">
              <span className="font-medium">Delivery Date:</span>
              <span>{deliveryDate}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-medium">Name:</span>
            <span>{name}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Mobile:</span>
            <span>{number}</span>
          </div>

          <div className="flex justify-between items-start">
            <span className="font-medium">Address:</span>
            <span className="break-words max-w-[70%]">{address}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Normal Water:</span>
            <span>{normal}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Cooling Water:</span>
            <span>{cool}</span>
          </div>

          <div className="mt-4 p-3 bg-sky-50 rounded-lg text-center text-lg font-bold text-sky-700">
            Total Cost: ₹{total}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 hover:border-gray-400 rounded-xl py-2 font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="flex-1 bg-sky-600 hover:bg-sky-700 text-white rounded-xl py-2 font-medium transition shadow-md hover:shadow-lg"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}
