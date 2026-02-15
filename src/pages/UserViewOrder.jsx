import React, { useEffect, useState } from "react";
import { BaseURL, ordersByMobile } from "../Utills/baseurl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // ✅ Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const navigate = useNavigate();
  const mobileNumber = localStorage.getItem("userMobile");

  const fetchOrders = async () => {
    if (!mobileNumber) return;
    setLoading(true);
    try {
      const res = await fetch(`${BaseURL}${ordersByMobile}=${mobileNumber}`, {
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      let data = await res.json();

      if (fromDate)
        data = data.filter(
          (o) => new Date(o.createdAt) >= new Date(fromDate)
        );

      if (toDate)
        data = data.filter(
          (o) => new Date(o.createdAt) <= new Date(toDate)
        );

      if (statusFilter !== "all")
        data = data.filter((o) => o.status === parseInt(statusFilter));

      setOrders(data);
      setCurrentPage(1); // reset page on filter change
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fromDate, toDate, statusFilter]);

  // ✅ Pagination Logic
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-sky-700">My Order History</h1>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-sky-700 font-semibold border border-sky-600 shadow-sm hover:bg-sky-50 hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          Back
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
        {[
          { label: "From", value: fromDate, set: setFromDate, type: "date" },
          { label: "To", value: toDate, set: setToDate, type: "date" },
          { label: "Status", value: statusFilter, set: setStatusFilter, type: "select" },
        ].map((filter, idx) => (
          <div key={idx} className="flex flex-col w-full md:w-1/4">
            <label className="block text-sm font-semibold mb-1">
              {filter.label}
            </label>
            {filter.type === "select" ? (
              <select
                value={filter.value}
                onChange={(e) => filter.set(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-sky-400 shadow-sm"
              >
                <option value="all">All</option>
                <option value="0">Pending</option>
                <option value="1">Completed</option>
                <option value="2">Cancelled</option>
              </select>
            ) : (
              <input
                type={filter.type}
                value={filter.value}
                onChange={(e) => filter.set(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-sky-400 shadow-sm"
              />
            )}
          </div>
        ))}
        <button
          onClick={fetchOrders}
          className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition w-full md:w-auto shadow"
        >
          Apply
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center my-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && currentOrders.length > 0 && (
        <div className="hidden md:block overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Normal Qty</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Cooling Qty</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Total</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-sky-50 transition">
                  <td className="px-6 py-3 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 text-center">{order.normalQty}</td>
                  <td className="px-6 py-3 text-center">{order.coolQty}</td>
                  <td className="px-6 py-3 text-right">₹{order.totalAmount}</td>
                  <td className="px-6 py-3 text-center">{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && currentOrders.length > 0 && (
        <div className="md:hidden flex flex-col gap-4">
          {currentOrders.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-xl shadow-md">
              <div className="flex justify-between mb-2">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Normal Qty:</span>
                <span>{order.normalQty}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Cooling Qty:</span>
                <span>{order.coolQty}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Total:</span>
                <span className="font-bold">₹{order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{order.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && orders.length > ordersPerPage && (
        <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 rounded ${
                currentPage === index + 1
                  ? "bg-sky-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-center text-gray-500 my-6 text-lg font-medium">
          No orders found.
        </p>
      )}
    </div>
  );
}
