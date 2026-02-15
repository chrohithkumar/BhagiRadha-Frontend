export default function Card({ icon, title, desc, price, value, setValue }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow w-full sm:w-60">
      <div className="text-2xl mb-2">{icon}</div>

      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
      <p className="mt-2 text-blue-600 font-bold">{price}</p>

      {/* Counter */}
      <div className="flex justify-between items-center mt-4 border-t pt-3">
        <button
          onClick={() => setValue(Math.max(0, value - 1))}
          className="px-3 py-1 border rounded"
        >
          −
        </button>

        <span className="font-bold">{value}</span>

        <button
          onClick={() => setValue(value + 1)}
          className="px-3 py-1 border rounded"
        >
          +
        </button>
      </div>
    </div>
  );
}
