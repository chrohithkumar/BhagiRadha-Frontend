
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-200 p-6 mobile-view">

        <h2 className="text-2xl font-extrabold mb-8 text-gray-800 tracking-wide">
          Admin Panel
        </h2>

        <nav className="space-y-3 text-gray-600 font-medium">

          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200 ease-in-out"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/orders"
            className="block px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200 ease-in-out"
          >
            All Orders
          </Link>

          <Link
            to="/admin/performance"
            className="block px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200 ease-in-out"
          >
            Performance
          </Link>

          
          <Link
            to="/admin/user-management"
            className="block px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition duration-200 ease-in-out"
          >
            User Management
          </Link>


          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 mt-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition duration-200 ease-in-out"
          >
            Logout
          </button>

        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8">
        <Outlet />
      </div>

    </div>
  );
}
