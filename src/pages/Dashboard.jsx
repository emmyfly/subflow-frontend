import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { fetchSubscribers, fetchPayments, fetchTenants } from "../api";
import StatCard from "../components/StatCard";

const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

function buildMRRHistory(payments) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleString("default", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });

  return months.map(({ label, year, month }) => {
    const total = (payments || [])
      .filter((p) => {
        const d = new Date(p.created_at || p.payment_date || p.timestamp || 0);
        return d.getFullYear() === year && d.getMonth() === month && p.status === "success";
      })
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    return { label, mrr: total };
  });
}

function buildWeeklyNewSubs(subscribers) {
  const now = new Date();
  const weeks = Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now);
    start.setDate(now.getDate() - (5 - i) * 7 - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { label: `W${i + 1}`, start, end };
  });
  return weeks.map(({ label, start, end }) => ({
    label,
    subscribers: (subscribers || []).filter((s) => {
      const d = new Date(s.created_at || s.start_date || 0);
      return d >= start && d <= end;
    }).length,
  }));
}

const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white shadow-xl">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="font-semibold">{prefix}{payload[0].value?.toLocaleString()}</div>
    </div>
  );
};

export default function Dashboard() {
  const [subscribers, setSubscribers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetchTenants(),
      fetchSubscribers(),
      fetchPayments(),
    ]).then(([t, s, p]) => {
      if (t.status === "fulfilled") setTenants(t.value?.results ?? t.value ?? []);
      if (s.status === "fulfilled") setSubscribers(s.value?.results ?? s.value ?? []);
      if (p.status === "fulfilled") setPayments(p.value?.results ?? p.value ?? []);
      setLoading(false);
    });
  }, []);

  const active = subscribers.filter((s) => s.status === "active").length;
  const pastDue = subscribers.filter((s) => s.status === "past_due").length;
  const cancelled = subscribers.filter((s) => s.status === "cancelled").length;
  const churnRate =
    subscribers.length > 0 ? ((cancelled / subscribers.length) * 100).toFixed(1) : "0.0";

  const successPayments = payments.filter((p) => p.status === "success");
  const mrr = successPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const mrrHistory = buildMRRHistory(payments);
  const weeklyData = buildWeeklyNewSubs(subscribers);

  return (
    <div>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          SubFlow · Powered by Nomba Infrastructure
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          <StatCard
            title="Active Subscribers"
            value={active.toLocaleString()}
            sub={`${subscribers.length} total`}
            accent="brand"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />
          <StatCard
            title="Monthly Revenue"
            value={fmt(mrr)}
            sub={`${successPayments.length} transactions`}
            accent="green"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          />
          <StatCard
            title="Churn Rate"
            value={`${churnRate}%`}
            sub={`${cancelled} cancelled`}
            accent="red"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
          />
          <StatCard
            title="Pending Payments"
            value={pastDue.toLocaleString()}
            sub="Past due subscribers"
            accent="orange"
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* MRR Line Chart */}
        <div className="lg:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-white font-semibold text-sm">MRR Trend</h2>
            <p className="text-gray-500 text-xs mt-0.5">Monthly recurring revenue over 6 months</p>
          </div>
          {loading ? (
            <div className="h-52 animate-pulse bg-gray-800 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={mrrHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="₦" />} />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#ffcc00"
                  strokeWidth={2.5}
                  dot={{ fill: "#ffcc00", r: 3 }}
                  activeDot={{ r: 5, fill: "#ffd91a" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weekly New Subscribers Bar Chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-white font-semibold text-sm">New Subscribers</h2>
            <p className="text-gray-500 text-xs mt-0.5">Per week, last 6 weeks</p>
          </div>
          {loading ? (
            <div className="h-52 animate-pulse bg-gray-800 rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="subscribers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick stats footer */}
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tenants", value: tenants.length },
          { label: "Total Subscribers", value: subscribers.length },
          { label: "Successful Payments", value: successPayments.length },
          { label: "Failed Payments", value: payments.filter((p) => p.status === "failed").length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-gray-500 text-xs">{label}</span>
            <span className="text-white font-semibold text-sm">{loading ? "—" : value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
