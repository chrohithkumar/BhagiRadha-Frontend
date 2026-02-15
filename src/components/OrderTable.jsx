import { useState, useMemo } from "react";

export default function OrderTable({ orders }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilter, setMobileFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");

  const ordersPerPage = 15;

  /* =========================
     FILTERING
  ========================== */

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      return (
        o.mobileNumber?.includes(mobileFilter) &&
        o.name?.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (userIdFilter ? o.id?.toString() === userIdFilter : true)
      );
    });
  }, [orders, mobileFilter, nameFilter, userIdFilter]);

  /* =========================
     STATS
  ========================== */

  const totalRevenue = filteredOrders.reduce((sum, o) => {
    return o.status === 1 ? sum + o.totalAmount : sum;
  }, 0);

  const pendingCount = filteredOrders.filter((o) => o.status === 0).length;
  const completedCount = filteredOrders.filter((o) => o.status === 1).length;
  const cancelledCount = filteredOrders.filter((o) => o.status === 2).length;

  /* =========================
     PAGINATION
  ========================== */

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  
    const STATUS_CONFIG = {
    0: {
      label: "Pending",
      color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    1: {
      label: "Completed",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    2: {
      label: "Cancelled",
      color: "bg-red-100 text-red-700 border-red-200",
    },
  };

  return (
    <div className="space-y-6">

      {/* ===== FILTER SECTION ===== */}
      <div className="bg-white p-4 rounded-xl shadow grid md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Filter by Mobile"
          value={mobileFilter}
          onChange={(e) => setMobileFilter(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Filter by User ID"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* ===== STATS ===== */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} />
        <StatCard title="Pending" value={pendingCount} />
        <StatCard title="Completed" value={completedCount} />
        <StatCard title="Cancelled" value={cancelledCount} />
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentOrders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{o.id}</td>
                <td className="p-3">{o.name}</td>
                <td className="p-3">{o.mobileNumber}</td>
                <td className="p-3 font-semibold">₹{o.totalAmount}</td>
                  <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      STATUS_CONFIG[o.status]?.color
                    }`}
                  >
                    {STATUS_CONFIG[o.status]?.label}
                  </span>
                </td>

                <td className="space-x-2">
                  {o.status === 0 && (
                    <>
                      <button
                        onClick={() => updateStatus(o.id, 1)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Complete
                      </button>

                      <button
                        onClick={() => updateStatus(o.id, 2)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ===== PAGINATION ===== */}
        <div className="flex justify-between mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 border rounded"
          >
            Previous
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
    </div>
  );
}
