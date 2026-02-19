import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { BaseURL, userRegister } from "../../Utills/baseurl";
import { toast, ToastContainer } from "react-toastify";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        mobile: "",
        password: "",
        confirmPassword: "",
        address: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        let newErrors = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!/^[6-9]\d{9}$/.test(form.mobile)) {
            newErrors.mobile = "Enter valid 10-digit mobile number";
        }

        if (form.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (!form.address.trim()) {
            newErrors.address = "Address is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            const response = await fetch(`${BaseURL}${userRegister}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (data.message === "Registration successful") {
                toast.success("Registration successful! Please login.", { autoClose: 5000 });

                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                toast.error(data.message || "Registration failed", { autoClose: 5000 });
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-600">
            <ToastContainer position="top-right" autoClose={5000} />

            <div className="w-full max-w-md rounded-2xl p-8">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={form.mobile}
                                onChange={handleChange}
                                placeholder="Enter mobile number"
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                            />
                            {errors.mobile && (
                                <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
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

                        <div>
                            <label className="block text-sm font-medium mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className="w-full border rounded-lg p-2 pr-10 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                                <span
                                    className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Full Address</label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Enter full address"
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                        {errors.address && (
                            <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                        )}
                    </div>

                    {/* 🔥 Updated Register Button with Loader */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                    ></path>
                                </svg>
                                Registering...
                            </>
                        ) : (
                            "Register"
                        )}
                    </button>

                    <p className="text-center text-sm text-white-600 mt-2">
                        Already registered?{" "}
                        <span
                            className="text-white-600 font-medium cursor-pointer hover:underline"
                            onClick={() => navigate("/login")}
                        >
                            Login here
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}
