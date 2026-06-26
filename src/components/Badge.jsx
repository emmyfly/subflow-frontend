const styles = {
  active:     "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  inactive:   "bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30",
  past_due:   "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30",
  cancelled:  "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  suspended:  "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30",
  trial:      "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
  success:    "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  failed:     "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  pending:    "bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30",
  refunded:   "bg-gray-500/15 text-gray-400 ring-1 ring-gray-500/30",
};

export default function Badge({ status }) {
  const cls = styles[status] ?? "bg-gray-700 text-gray-400";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
