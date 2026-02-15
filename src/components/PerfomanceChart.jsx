import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";

export default function PerformanceChart({ orders = [] }) {
  const [view, setView] = useState("week");

  const groupedData = useMemo(() => {
    if (!orders.length) return [];

    const map = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);
      if (isNaN(date)) return;

      let key;

      if (view === "week") {
        key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      } else if (view === "month") {
        key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
      } else {
        key = `${date.getFullYear()}`;
      }

      if (!map[key]) {
        map[key] = {
          name: key,
          normal: 0,
          cool: 0,
          totalQty: 0,
          revenue: 0,
        };
      }

      map[key].normal += order.normalQty || 0;
      map[key].cool += order.coolQty || 0;
      map[key].totalQty += (order.normalQty || 0) + (order.coolQty || 0);

      // Revenue only from completed orders (optional best practice)
      if (order.status === "Completed") {
        map[key].revenue += order.totalAmount || 0;
      }
    });

    return Object.values(map).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [orders, view]);

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">

      {/* Toggle Buttons */}
      <div className="flex gap-3">
        {["week", "month", "year"].map((type) => (
          <button
            key={type}
            onClick={() => setView(type)}
            className={`px-4 py-2 rounded capitalize ${
              view === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {groupedData.length === 0 ? (
        <p className="text-gray-500">No data available</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={groupedData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            {/* Slim Bars */}
            <Bar dataKey="normal" fill="#3b82f6" name="Normal Water" barSize={30} />
            <Bar dataKey="cool" fill="#10b981" name="Cooling Water" barSize={30} />
            <Bar dataKey="totalQty" fill="#f97316" name="Total Quantity" barSize={30} />
            <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue (₹)" barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
