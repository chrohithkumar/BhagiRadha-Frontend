
import { useState, useEffect, useRef } from "react";
import { BaseURL, getAllOrders, orderupdatedstatus } from "../Utills/baseurl";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import notificationsound from "../assests/notification.mp3";
export default function AdminDashboard() {
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
  const audioRef = useRef(null);
  const navigate = useNavigate();
  const prevLastIdRef = useRef(null);
  const isFirstLoad = useRef(true);
  // useEffect(() => {
  //   const fetchOrders = async () => {
  //     try {
  //       const response = await orderApi();
  //       const orders = response.data;

  //       if (orders && orders.length > 0) {
  //         // Sort by latest (important if API not sorted)
  //         const sortedOrders = [...orders].sort(
  //           (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //         );

  //         const latestOrder = sortedOrders[0];
  //         const latestId = latestOrder.id;

  //         if (!isFirstLoad.current && latestId !== prevLastIdRef.current) {
  //           playNotificationSound(); // 🔔 play sound here
  //         }

  //         prevLastIdRef.current = latestId;
  //         isFirstLoad.current = false;
  //       }
  //     } catch (error) {
  //       console.error("Error fetching orders:", error);
  //     }
  //   };

  //   fetchOrders();

  //   // If you are polling:
  //   const interval = setInterval(fetchOrders, 5000); // every 5 sec

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${BaseURL}${getAllOrders}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      const today = new Date().toISOString().split("T")[0];

      const todayOrders = result.filter(
        (order) => order.createdAt?.split("T")[0] === today
      );

      if (todayOrders.length > 0) {
        const sortedOrders = [...todayOrders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const latestId = sortedOrders[0].id;

        if (prevLastIdRef.current !== null && latestId > prevLastIdRef.current) {
          audioRef.current?.play().catch(() => { });
        }

        prevLastIdRef.current = latestId;
      }

      isFirstLoad.current = false;


      // keep your existing count logic
      setPreviousOrderCount(todayOrders.length);
      setData(todayOrders);

    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };


  const updateStatus = async (id, status, name) => {
    if (status === "Completed") {
      status = 1;
    } else if (status === "Cancelled") {
      status = 2;
    } else {
      toast.error("Invalid status");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${BaseURL}${orderupdatedstatus}${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(status),
        }
      );

      const data = await response.json(); // ✅ THIS WAS MISSING

      if (response.ok && data.message === "Status updated successfully") {

        if (status === 1) {

          Swal.fire({
            title: "Status updated successfully",
            text: `${name} order has completed`,
            icon: "success"
          });
          toast.success(`${name} order has completed`);
        } else if (status === 2) {
          Swal.fire({
            title: "Status updated successfully",
            text: `${name} order has cancelled`,
            icon: "success"
          });
          toast.error(`${name} order has cancelled`);
        }

        loadOrders();
      } else {
        toast.error(data.message || "Failed to update status");
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleViewAll = () => {
    navigate("/admin/orders");
  };

  function Stat({ title, value }) {
    return (
      <div className="bg-white shadow rounded-xl p-6 text-center">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
    );
  }

 const filteredOrders =
  statusFilter === "all" && bookingTypeFilter === "all"
    ? data
    : data.filter((o) => {
        const statusMatch = statusFilter === "all" || o.status.toLowerCase() === statusFilter.toLowerCase();
        const bookingTypeMatch =
          bookingTypeFilter === "all" ||
          o.bookingType.trim().toLowerCase() === bookingTypeFilter.trim().toLowerCase();
        return statusMatch && bookingTypeMatch;
      });


  /* ================= PAGINATION ================= */
  const indexOfLast = currentPage * ordersPerPage;
  const indexOfFirst = indexOfLast - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  /* ================= STATS ================= */
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    return order.status === "Completed" ? sum + order.totalAmount : sum;
  }, 0);

  const pendingCount = filteredOrders.filter((o) => o.status === "Pending").length;
  const completedCount = filteredOrders.filter((o) => o.status === "Completed").length;
  const cancelledCount = filteredOrders.filter((o) => o.status === "Cancelled").length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ================= HEADER ================= */}
      <div className="bg-white shadow rounded-xl p-4 mb-6 web-view">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center w-full">
            <h1 className="text-2xl font-bold">Admin Panel</h1>

            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded ml-auto web-view-logout"
            >
              Logout
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex gap-6 font-semibold">
            <button onClick={() => navigate("/admin/orders")} className="hover:text-blue-600">
              All Orders
            </button>
            <button onClick={() => navigate("/admin/performance")} className="hover:text-blue-600">
              Performance
            </button>
            <button onClick={() => navigate("/admin/user-management")} className="hover:text-blue-600">
              User Management
            </button>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>

          {/* Mobile + Tablet Navigation */}
          <div className="flex lg:hidden w-full justify-around border-t pt-3 font-semibold text-sm">
            <button onClick={() => navigate("/admin/orders")}>All Orders</button>
            <button onClick={() => navigate("/admin/performance")}>Performance</button>
            <button onClick={() => navigate("/admin/user-management")}>User Management</button>
          </div>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <div className="mb-6">
        <h2 className="text-xl font-bold">Today Orders</h2>
      </div>

      <div className="mb-6 web-view">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-60"
        >
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          value={bookingTypeFilter}
          onChange={(e) => setBookingTypeFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-60"
        >
          <option value="all">Booking Type</option>
          <option value="daily">Daily</option>
          <option value="advance">Advance</option>
        </select>
      </div>

      <div className="mobile-view mb-4">
        <div className="flex justify-between items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-2 py-1 rounded text-sm h-9"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

           <select
          value={bookingTypeFilter}
          onChange={(e) => setBookingTypeFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-60"
        >
          <option value="all">Booking Type</option>
          <option value="daily">Daily</option>
          <option value="advance">Advance</option>
        </select>

          <div className="flex gap-2">
            <button
              onClick={handleViewAll}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm h-9"
            >
              View All Orders
            </button>

            <button
              onClick={handleLogout}
              className="bg-black text-white px-3 py-1 rounded text-sm h-9"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* ================= STATS ================= */}
      <div className="mb-6">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Stat title="Revenue Today" value={`₹${totalRevenue}`} />
          <Stat title="Pending Orders" value={pendingCount} />
          <Stat title="Completed Orders" value={completedCount} />
          <Stat title="Cancelled Orders" value={cancelledCount} />
        </div>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden lg:block bg-white rounded-xl shadow p-6">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th>Name</th>
              <th>Mobile</th>
              <th>Normal</th>
              <th>Cool</th>
              <th>Total</th>
              <th>Booking Type</th>
              <th>Status</th>
              <th className="text-center w-60">Actions</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length > 0 ? (
              currentOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-3">{order.name}</td>
                  <td>{order.mobileNumber}</td>
                  <td>{order.normalQty}</td>
                  <td>{order.coolQty}</td>
                  <td>₹{order.totalAmount}</td>
                  <td className="capitalize">{order.bookingType}</td>
                  <td>
                    {order.status === "Pending" && <span className="text-yellow-600 font-semibold">Pending</span>}
                    {order.status === "Completed" && <span className="text-green-600 font-semibold">Completed</span>}
                    {order.status === "Cancelled" && <span className="text-red-600 font-semibold">Cancelled</span>}
                  </td>
                  <td className="text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => updateStatus(order.id, 'Completed', order.name)}
                        disabled={order.status !== 'Pending'}
                        className={`px-3 py-1 rounded text-sm text-white ${order.status === "Pending"
                          ? "bg-green-500"
                          : "bg-green-300 cursor-not-allowed"
                          }`}
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, 'Cancelled', order.name)}
                        disabled={order.status !== "Pending"}
                        className={`px-3 py-1 rounded text-sm text-white ${order.status === "Pending"
                          ? "bg-red-500"
                          : "bg-red-300 cursor-not-allowed"
                          }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))) : (
              <tr>
                <td colSpan="9" className="text-center py-6 text-gray-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE & TABLET CARDS ================= */}
      <div className="grid gap-4 lg:hidden">
        {currentOrders.length > 0 ? (
          currentOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{order.name}</h3>
                {order.status === "Pending" && <span className="text-yellow-600">Pending</span>}
                {order.status === "Completed" && <span className="text-green-600">Completed</span>}
                {order.status === "Cancelled" && <span className="text-red-600">Cancelled</span>}
              </div>

              <p><strong>Mobile:</strong> {order.mobileNumber}</p>
              <p><strong>Normal Qty:</strong> {order.normalQty}</p>
              <p><strong>Cool Qty:</strong> {order.coolQty}</p>
              <p><strong>Total:</strong> ₹{order.totalAmount}</p>
              <p className="capitalize">Booking Type {order.bookingType}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {order.status == "Pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(order.id, 'Completed', order.name)}
                      className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'Cancelled', order.name)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  View
                </button>
              </div>
            </div>
          ))) : (
          <div className="text-center py-6 text-gray-500">
            No orders found.
          </div>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-3 right-3 text-xl"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedOrder.name}</p>
              <p><strong>Mobile:</strong> {selectedOrder.mobileNumber}</p>
              <p><strong>Normal Qty:</strong> {selectedOrder.normalQty}</p>
              <p><strong>Cool Qty:</strong> {selectedOrder.coolQty}</p>
              <p><strong>Booking Type:</strong> {selectedOrder.bookingType}</p>
              <p><strong>Booking Date:</strong> {selectedOrder.bookingDate}</p>
              <p><strong>Address:</strong> {selectedOrder.address}</p>
              <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() =>
                  navigate("/track", {
                    state: { userLat: selectedOrder.latitude, userLng: selectedOrder.longitude, orderId: selectedOrder.id },
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Track Location
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-300 px-4 py-2 rounded w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded border ${currentPage === index + 1 ? "bg-black text-white" : "bg-white"}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* 🔔 AUDIO */}
      <audio ref={audioRef} src={notificationsound} preload="auto" />
    </div>
  );
}
