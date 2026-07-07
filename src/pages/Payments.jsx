import { useEffect, useState } from "react";
import { fetchPayments, fetchTenants } from "../api";
import Badge from "../components/Badge";

const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const EVENT_LABELS = {
  payment_success: { label: "Payment Success", color: "text-emerald-400 bg-emerald-500/10" },
  payment_failed: { label: "Payment Failed", color: "text-red-400 bg-red-500/10" },
  subscription_created: { label: "Subscription Created", color: "text-blue-400 bg-blue-500/10" },
  subscription_cancelled: { label: "Cancelled", color: "text-gray-400 bg-gray-700" },
  plan_changed: { label: "Plan Changed", color: "text-brand-500 bg-brand-500/10" },
};

function EventTag({ type }) {
  const evt = EVENT_LABELS[type] || { label: type, color: "text-gray-400 bg-gray-700" };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${evt.color}`}>
      {evt.label}
    </span>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenantFilter, setTenantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTenants()
      .then((d) => setTenants(d?.results ?? d ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchPayments(tenantFilter || undefined)
      .then((d) => {
        const arr = d?.results ?? d ?? [];
        // Sort newest first
        arr.sort((a, b) => {
          const da = new Date(a.created_at || a.payment_date || 0);
          const db = new Date(b.created_at || b.payment_date || 0);
          return db - da;
        });
        setPayments(arr);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantFilter]);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.subscriber_name?.toLowerCase().includes(q) ||
      p.subscriber_email?.toLowerCase().includes(q) ||
      (p.nomba_transaction_ref || p.transaction_ref || "").toLowerCase().includes(q);
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalSuccess = payments.filter((p) => p.status === "success").reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const countFailed = payments.filter((p) => p.status === "failed").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Payments & Webhooks</h1>
          <p className="text-gray-500 text-sm mt-1">Transaction log and event history</p>
        </div>
      </div>

      {/* Quick stats */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <div className="text-gray-500 text-xs mb-1">Total Volume</div>
            <div className="text-white font-bold">{fmt(totalSuccess)}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <div className="text-gray-500 text-xs mb-1">Transactions</div>
            <div className="text-white font-bold">{payments.length}</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
            <div className="text-gray-500 text-xs mb-1">Failed</div>
            <div className="text-red-400 font-bold">{countFailed}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriber or ref…"
            className="bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors w-60"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={tenantFilter}
          onChange={(e) => setTenantFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Tenants</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscriber</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomba Ref</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-gray-600">
                    No payment records found.
                  </td>
                </tr>
              )
              : filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                      {p.created_at || p.payment_date
                        ? new Date(p.created_at || p.payment_date).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <EventTag type={p.event_type || (p.status === "success" ? "payment_success" : p.status === "failed" ? "payment_failed" : p.status)} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-white">{p.subscriber_name || "—"}</div>
                      <div className="text-gray-500 text-xs">{p.subscriber_email || ""}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-300 font-medium">{fmt(p.amount)}</td>
                    <td className="px-5 py-3.5"><Badge status={p.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs truncate max-w-[160px]">
                      {p.nomba_transaction_ref || p.transaction_ref || "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
