import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BaseURL, getAllOrders } from "../Utills/baseurl";
import PerformanceChart from "../components/PerfomanceChart";
export default function PerformancePage() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    loadOrders();
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
      setData(result);
    } catch (error) {
      console.error("Failed to load orders:", error);
    }
  };

   const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="m-2">
      <h1 className="text-3xl font-bold mb-6 m-2">Performance Analytics</h1>
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
            <button onClick={() => navigate("/admin/dashboard")} className="hover:text-blue-600">
              Dashboard
            </button>

            <button onClick={() => navigate("/admin/orders")} className="hover:text-blue-600">
              All Orders
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
            <button onClick={() => navigate("/admin/dashboard")}>
              Dashboard
            </button>

            <button onClick={() => navigate("/admin/orders")}>
              All Orders
            </button>
             <button onClick={() => navigate("/admin/user-management")}>
              User Management
            </button>
          

          </div>



        </div>
      </div>

      <PerformanceChart orders={data} />
    </div>
  );
}
