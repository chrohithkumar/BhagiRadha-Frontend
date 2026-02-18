import React, { useState } from "react";
import { BaseURL, ordersByMobile, updateuseractivestatus } from "../Utills/baseurl";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserManagement() {
    const [mobile, setMobile] = useState("");
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchUserAndOrders = async () => {
        if (!mobile) return toast.warning("Enter mobile number");
        const token = localStorage.getItem("token");
        setLoading(true);
        try {
            const ordersRes = await fetch(`${BaseURL}${ordersByMobile}=${mobile}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (!ordersRes.ok) throw new Error("Failed to fetch orders");
            let orderData = await ordersRes.json();
            setUser(orderData);
            
            // Apply filters frontend
            if (fromDate) orderData = orderData.filter(o => new Date(o.createdAt) >= new Date(fromDate));
            if (toDate) orderData = orderData.filter(o => new Date(o.createdAt) <= new Date(toDate));
            if (statusFilter !== "all") orderData = orderData.filter(o => o.status === statusFilter);
            if (bookingTypeFilter !== "all") orderData = orderData.filter(o => o.bookingType === bookingTypeFilter);

            setOrders(orderData);
            setCurrentPage(1); // Reset to page 1 on search
        } catch (err) {
            console.error(err);
            toast.error(err.message);
            setUser(null);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (mobileNumber, status) => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BaseURL}${updateuseractivestatus}${mobileNumber}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(status),
            });

            if (res.ok) {
                const result = await res.json();
                toast.success(result.message);
                fetchUserAndOrders(); 
            } else {
                const errorData = await res.json();
                toast.error(errorData.message || "Failed to update status");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Something went wrong");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const Downloadpdf = () => {
        if (orders.length === 0) {
            toast.warning("No orders to download");
            return;
        }

        const doc = new jsPDF();
        
        doc.text(`${user[0]?.name || "User"} Orders Report`, 14, 15);
        doc.text(`Mobile: ${mobile}`, 14, 22);
        doc.text("BhagiRadha SawyamKrushi Water Plant ", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
        autoTable(doc, {
            startY: 30,
            head: [["Date", "Normal Qty", "Cooling Qty", "Total", "Status"]],
            body: orders.map(order => [
                new Date(order.createdAt).toLocaleDateString(),
                order.normalQty,
                order.coolQty,
                order.totalAmount,
                order.status
            ])
        });

        doc.save(`Orders_${mobile}.pdf`);
        toast.success("PDF Downloaded Successfully");
    };

    // --- Pagination Logic ---
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

    return (
        <div className="p-4 max-w-7xl mx-auto overflow-hidden">
            {/* Navigation Header */}
            <h2 className="text-2xl font-bold text-sky-700 mb-4">User Management</h2>
            <div className="bg-white shadow rounded-xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center w-full">
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <button onClick={handleLogout} className="bg-black text-white px-4 py-2 rounded ml-auto">
                            Logout
                        </button>
                    </div>

                    <div className="hidden lg:flex gap-6 font-semibold">
                        <button onClick={() => navigate("/admin/dashboard")} className="hover:text-blue-600">Dashboard</button>
                        <button onClick={() => navigate("/admin/orders")} className="hover:text-blue-600">All Orders</button>
                        <button onClick={() => navigate("/admin/performance")} className="hover:text-blue-600">Performance</button>
                    </div>

                    <div className="flex lg:hidden w-full justify-around border-t pt-3 font-semibold text-sm">
                        <button onClick={() => navigate("/admin/dashboard")}>Dashboard</button>
                        <button onClick={() => navigate("/admin/orders")}>All Orders</button>
                        <button onClick={() => navigate("/admin/performance")}>Performance</button>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <label className="block text-sm font-semibold mb-1">Mobile Number</label>
                    <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="Enter user mobile number"
                        className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-sky-400 shadow-sm"
                    />
                </div>
                <button
                    onClick={fetchUserAndOrders}
                    className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 transition shadow self-end h-[42px]"
                >
                    Search
                </button>
            </div>

            {loading && (
                <div className="flex justify-center items-center my-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-sky-600"></div>
                </div>
            )}

            {/* User Profile Card */}
            {user && orders.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-5 mb-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{user[0]?.name}</h2>
                            <p className="text-gray-600">{user[0]?.mobileNumber}</p>
                            <p className="text-gray-600">{user[0]?.address}</p>
                            <p className="text-yellow-600">Current Status : {user[0]?.userActiveStatus}</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => toggleStatus(user[0]?.mobileNumber, "Block")} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">Block</button>
                            <button onClick={() => toggleStatus(user[0]?.mobileNumber, "Active")} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Activate</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Filter Bar */}
            {user && (
                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div className="flex flex-col flex-1 min-w-[140px]">
                        <label className="text-xs font-bold mb-1">From</label>
                        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-400" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-[140px]">
                        <label className="text-xs font-bold mb-1">To</label>
                        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-400" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-[140px]">
                        <label className="text-xs font-bold mb-1">Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-400">
                            <option value="all">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                     <div className="flex flex-col flex-1 min-w-[140px]">
                        <label className="text-xs font-bold mb-1">Booking Type</label>
                        <select value={bookingTypeFilter} onChange={(e) => setBookingTypeFilter(e.target.value)} className="border rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-sky-400">
                            <option value="all">All</option>
                            <option value="daily">Daily</option>
                            <option value="advance">Advance</option>
                 
                        </select>
                    </div>
                    <button onClick={fetchUserAndOrders} className="bg-sky-600 text-white px-5 py-2 rounded-lg hover:bg-sky-700 shadow">Apply</button>
                    <button onClick={Downloadpdf} className="bg-yellow-600 text-white px-5 py-2 rounded-lg shadow flex items-center gap-2 hover:bg-yellow-700">
                        <Download size={16} /> PDF
                    </button>
                </div>
            )}

            {/* Orders Content */}
            {user && orders.length > 0 && (
                <div className="w-full">
                    {/* Desktop Table View */}
                    <div className="hidden md:block w-full border rounded-xl overflow-hidden shadow-sm bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-700">Date</th>
                                    <th className="p-4 text-sm font-bold text-gray-700">Booking Type</th>
                                    <th className="p-4 text-sm font-bold text-gray-700 text-center">Normal Qty</th>
                                    <th className="p-4 text-sm font-bold text-gray-700 text-center">Cooling Qty</th>
                                    <th className="p-4 text-sm font-bold text-gray-700 text-right">Total</th>
                                    <th className="p-4 text-sm font-bold text-gray-700 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {currentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 text-sm">{order.bookingDate}</td>
                                        <td className="p-4 text-sm">{order.bookingType}</td>
                                        <td className="p-4 text-sm text-center">{order.normalQty}</td>
                                        <td className="p-4 text-sm text-center">{order.coolQty}</td>
                                        <td className="p-4 text-sm text-right font-semibold">₹{order.totalAmount}</td>
                                        <td className="p-4 text-sm text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                order.status === "Completed" ? "text-green-600 bg-green-50" : 
                                                order.status === "Pending" ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {currentOrders.map((order) => (
                            <div key={order.id} className="bg-white border p-4 rounded-xl shadow-sm">
                                <div className="flex justify-between border-b pb-2 mb-2">
                                    <span className="text-gray-500 text-sm font-bold">Date : </span>
                                    <span className="text-sm">{order.bookingDate}  </span>
                                     <span className="text-gray-500 text-sm font-bold">Booking Type : </span>
                                    <span className="text-sm">{order.bookingType}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                    <div><p className="text-gray-500 font-bold">Normal</p><p>{order.normalQty}</p></div>
                                    <div><p className="text-gray-500 font-bold">Cooling</p><p>{order.coolQty}</p></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">₹{order.totalAmount}</span>
                                    <span className={`text-xs font-bold uppercase ${
                                        order.status === "Completed" ? "text-green-600" : order.status === "Pending" ? "text-yellow-600" : "text-red-600"
                                    }`}>{order.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Styled Pagination Bar */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-8 mb-4">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border transition ${
                                currentPage === 1 ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-gray-700 border-gray-200 hover:bg-gray-50 bg-white"
                            }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {pageNumbers.map((number) => (
                            <button
                                key={number}
                                onClick={() => setCurrentPage(number)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-bold transition ${
                                    currentPage === number
                                        ? "bg-black text-white border-black shadow-md"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                }`}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border transition ${
                                currentPage === totalPages ? "text-gray-300 border-gray-100 cursor-not-allowed" : "text-gray-700 border-gray-200 hover:bg-gray-50 bg-white"
                            }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {user && orders.length === 0 && !loading && (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed">
                    <p className="text-gray-500 text-lg font-medium">No orders found for this user.</p>
                </div>
            )}
        </div>
    );
}