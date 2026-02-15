export default function Counter({ label, value, setValue }) {
  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow mt-4">
      <span>{label}</span>
      <div className="flex gap-3 items-center">
        <button onClick={() => setValue(Math.max(0, value - 1))} className="px-3 py-1 border rounded">−</button>
        <span className="font-bold">{value}</span>
        <button onClick={() => setValue(value + 1)} className="px-3 py-1 border rounded">+</button>
      </div>
    </div>
  );
}
