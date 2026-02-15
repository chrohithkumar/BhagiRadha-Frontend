import { Routes, Route, Navigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import AllOrders from "./pages/AllOrders";
import Performance from "./pages/PerformancePage";
import TrackLocation from "./components/TrackLocation";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import OrderHistory from "./pages/UserViewOrder";
import UserManagement from "./pages/UserManagment";
export default function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

     <Routes>
  {/* Public routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/" element={<Navigate to="/login" replace />} />

  {/* User protected route */}
  <Route
    path="/home"
    element={
      <ProtectedRoute allowedTypes={["user"]}>
        <Home />
      </ProtectedRoute>
    }
  />
  <Route
  path="/userorderhistory" 
  element={
    <ProtectedRoute allowedTypes={["user"]}>
      <OrderHistory />
    </ProtectedRoute>
  }
/>

  {/* Track location (admin) */}
  <Route
    path="/track"
    element={
      <ProtectedRoute allowedTypes={["admin"]}>
        <TrackLocation />
      </ProtectedRoute>
    }
  />

 


  {/* Admin protected routes using AdminLayout */}
  <Route
    path="/admin"
    element={
      <ProtectedRoute allowedTypes={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="orders" element={<AllOrders />} />
    <Route path="performance" element={<Performance />} />
    <Route path="user-management" element={<UserManagement />} />
    <Route index element={<Navigate to="dashboard" replace />} />
  </Route>

  {/* Catch-all */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>

    </>
  );
}
