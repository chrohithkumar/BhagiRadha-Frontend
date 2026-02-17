import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";
import { BaseURL, userLogin } from "../../Utills/baseurl";

export default function Login() {
    const navigate = useNavigate();

    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false); // loader state

useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userType");

    if (token) {
        if (role?.toLowerCase() === "admin") {
            navigate("/admin/dashboard", { replace: true });
        } else {
            navigate("/home", { replace: true });
        }

    }
}, []);



    // Basic validation
    const validate = () => {
        const newErrors = {};
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            newErrors.mobile = "Enter valid 10-digit mobile number";
        }
        if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true); // start loader
        try {
            const response = await fetch(`${BaseURL}${userLogin}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile, password }),
            });

            const data = await response.json();


            if (data.message === "Login successful") {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userType", data.role);
                localStorage.setItem("userName", data.userName);
                localStorage.setItem("userMobile", data.mobile);
                localStorage.setItem("address", data.address);
                localStorage.setItem("activeStatus", data.activeStatus);
                toast.success("Login successful!", { autoClose: 4000 });

                setTimeout(() => {
                    if (data.role.toLowerCase() === "admin") {
                        navigate("/admin/dashboard");
                    } else {
                        navigate("/home");
                    }
                }, 1000);
            } else {
                toast.error(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false); // stop loader
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-600 px-4">
            {/* Toast container */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="w-full max-w-md p-8 relative">
                {/* Loader */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center rounded-2xl z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-4"></div>
                        <p className="text-blue-600 font-bold text-lg">PureDrop...</p>
                    </div>
                )}

                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                        💧
                    </div>
                    <h1 className="text-3xl font-bold text-blue-600 mt-3">PureDrop</h1>
                    <p className="text-gray-500 text-sm">Fresh water delivered</p>
                    <div className="bg-lightblue-600 rounded-lg px-4 py-2 mt-2">
                        <p className="text-red-500 font-extrabold text-center text-lg">
                            భగీరధ స్వయం క్రుషి వాటర్ ప్లాంట్
                        </p>
                    </div>
                    <p className="text-gray-900 font-semibold text-center mt-1">
                        ప్రొ: సూరిబాబు
                    </p>
                    <p className="text-gray-800 text-sm mt-1 text-center">
                        ఫోన్: 9951062449
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="Enter mobile number"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        {errors.mobile && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full border rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </span>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        disabled={loading} // disable during loading
                    >
                        Login
                    </button>

                    <p className="text-center text-sm text-gray-700 mt-2">
                        Not registered yet?{" "}
                        <span
                            className="text-black font-medium cursor-pointer hover:underline"
                            onClick={() => navigate("/register")}
                        >
                            Register here
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}
