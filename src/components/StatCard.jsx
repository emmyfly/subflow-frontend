export default function StatCard({ title, value, sub, icon, accent = "brand" }) {
  const colors = {
    brand: "bg-brand-500/10 text-brand-500",
    green: "bg-emerald-500/10 text-emerald-400",
    orange: "bg-orange-500/10 text-orange-400",
    red: "bg-red-500/10 text-red-400",
    blue: "bg-blue-500/10 text-blue-400",
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {icon && (
          <span className={`rounded-lg p-1.5 ${colors[accent]}`}>{icon}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
