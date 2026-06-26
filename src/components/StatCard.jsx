export default function StatCard({ title, value, sub, icon, accent = "violet" }) {
  const colors = {
    violet: "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    green: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    orange: "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    red: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${colors[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        {icon && (
          <span className="opacity-70">{icon}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
