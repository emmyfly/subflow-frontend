import { useEffect, useState } from "react";
import { fetchRetryQueue } from "../api";
import Badge from "../components/Badge";

const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function urgencyClass(sub) {
  const retryRatio = sub.max_retries > 0 ? sub.retry_count / sub.max_retries : 0;
  if (retryRatio >= 0.8) return "border-l-4 border-l-red-500 bg-red-500/5";
  if (retryRatio >= 0.5) return "border-l-4 border-l-orange-500 bg-orange-500/5";
  return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
}

function urgencyBadge(sub) {
  const retryRatio = sub.max_retries > 0 ? sub.retry_count / sub.max_retries : 0;
  if (retryRatio >= 0.8)
    return <span className="text-[11px] font-semibold uppercase tracking-wide text-red-400 bg-red-500/15 ring-1 ring-red-500/30 px-2 py-0.5 rounded-full">Critical</span>;
  if (retryRatio >= 0.5)
    return <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-400 bg-orange-500/15 ring-1 ring-orange-500/30 px-2 py-0.5 rounded-full">High</span>;
  return <span className="text-[11px] font-semibold uppercase tracking-wide text-yellow-400 bg-yellow-500/15 ring-1 ring-yellow-500/30 px-2 py-0.5 rounded-full">Medium</span>;
}

export default function Dunning() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    fetchRetryQueue()
      .then((d) => setQueue(d?.results ?? d ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const critical = queue.filter((s) => s.max_retries > 0 && s.retry_count / s.max_retries >= 0.8);
  const high = queue.filter((s) => s.max_retries > 0 && s.retry_count / s.max_retries >= 0.5 && s.retry_count / s.max_retries < 0.8);
  const medium = queue.filter((s) => !(s.max_retries > 0 && s.retry_count / s.max_retries >= 0.5));

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dunning Queue</h1>
          <p className="text-gray-500 text-sm mt-1">Subscribers due for payment retry</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl px-4 py-2 text-sm transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      {!loading && queue.length > 0 && (
        <div className="flex gap-3 mb-6">
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-400 text-sm font-medium">{critical.length} Critical</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-sm font-medium">{high.length} High</span>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-yellow-400 text-sm font-medium">{medium.length} Medium</span>
          </div>
          <div className="ml-auto bg-gray-800 rounded-xl px-4 py-2 text-gray-400 text-sm">
            {queue.length} total in queue
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-5">
          {error}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscriber</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgency</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Retry Progress</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Retry</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Due</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : queue.length === 0
              ? (
                <tr>
                  <td colSpan="6" className="px-5 py-16 text-center">
                    <div className="text-gray-600">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 mx-auto mb-3 opacity-30">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      No subscribers in retry queue — all caught up!
                    </div>
                  </td>
                </tr>
              )
              : queue.map((s) => (
                  <tr key={s.id} className={`border-b border-gray-800/50 ${urgencyClass(s)} transition-colors`}>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{s.name || "—"}</div>
                      <div className="text-gray-500 text-xs">{s.email}</div>
                    </td>
                    <td className="px-5 py-3.5"><Badge status={s.status} /></td>
                    <td className="px-5 py-3.5">{urgencyBadge(s)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[80px] bg-gray-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              s.max_retries > 0 && s.retry_count / s.max_retries >= 0.8
                                ? "bg-red-500"
                                : s.max_retries > 0 && s.retry_count / s.max_retries >= 0.5
                                ? "bg-orange-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${s.max_retries > 0 ? (s.retry_count / s.max_retries) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {s.retry_count ?? 0}/{s.max_retries ?? "?"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {s.last_retry_date || s.last_retry_at
                        ? new Date(s.last_retry_date || s.last_retry_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">
                      {s.amount ? fmt(s.amount) : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
