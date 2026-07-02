import { useEffect, useState } from "react";
import {
  fetchSubscribers,
  fetchTenants,
  fetchPlans,
  fetchSubscriberPayments,
  cancelSubscriber,
  changePlan,
  fetchProrationPreview,
  createSubscriber,
} from "../api";
import Badge from "../components/Badge";
import Modal from "../components/Modal";

const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const STATUSES = ["active", "past_due", "cancelled", "suspended", "trial"];

// ─── Create Subscriber Modal ─────────────────────────────────────────────────
function CreateSubscriberModal({ tenants, plans, onClose, onCreated }) {
  const [form, setForm] = useState({
    tenant_id: tenants[0]?.id || "",
    plan_id: "",
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tenantPlans = plans.filter((p) => p.tenant_id === form.tenant_id);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const sub = await createSubscriber(form);
      onCreated(sub);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create subscriber");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="New Subscriber" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Tenant *</label>
          <select
            required
            value={form.tenant_id}
            onChange={(e) => setForm({ ...form, tenant_id: e.target.value, plan_id: "" })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="">— Select tenant —</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Plan *</label>
          <select
            required
            value={form.plan_id}
            onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
            disabled={!form.tenant_id}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors disabled:opacity-40"
          >
            <option value="">— Select plan —</option>
            {tenantPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {fmt(p.price)} / {p.billing_cycle}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address *</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@example.com"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+2348012345678"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? "Creating…" : "Create Subscriber"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Detail Panel ────────────────────────────────────────────────────────────
function SubscriberDetail({ sub, plans, onClose, onRefresh }) {
  const [payments, setPayments] = useState([]);
  const [loadingPay, setLoadingPay] = useState(true);
  const [changePlanModal, setChangePlanModal] = useState(false);
  const [newPlanId, setNewPlanId] = useState("");
  const [proration, setProration] = useState(null);
  const [prorationLoading, setProrationLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetchSubscriberPayments(sub.id)
      .then((d) => setPayments(d?.results ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoadingPay(false));
  }, [sub.id]);

  const handleCancel = async () => {
    if (!confirm(`Cancel subscription for ${sub.name || sub.email}?`)) return;
    setActionLoading(true);
    try {
      await cancelSubscriber(sub.id);
      onRefresh();
      onClose();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const loadProration = async (planId) => {
    if (!planId) { setProration(null); return; }
    setProrationLoading(true);
    try {
      const p = await fetchProrationPreview(sub.id, planId);
      setProration(p);
    } catch {
      setProration(null);
    } finally {
      setProrationLoading(false);
    }
  };

  const handleChangePlan = async () => {
    if (!newPlanId) return;
    setActionLoading(true);
    try {
      await changePlan(sub.id, newPlanId);
      setChangePlanModal(false);
      onRefresh();
      onClose();
    } catch (e) {
      setActionError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-gray-900 border-l border-gray-800 h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
          <div>
            <h2 className="text-white font-semibold">{sub.name || sub.email}</h2>
            <p className="text-gray-500 text-xs mt-0.5">{sub.email}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Status + Actions */}
          <div className="flex items-center justify-between">
            <Badge status={sub.status} />
            <div className="flex gap-2">
              {sub.status !== "cancelled" && (
                <>
                  <button
                    onClick={() => setChangePlanModal(true)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    Change Plan
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? "…" : "Cancel"}
                  </button>
                </>
              )}
            </div>
          </div>

          {actionError && (
            <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{actionError}</p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Plan", value: plans.find((p) => p.id === sub.plan_id)?.name || "—" },
              { label: "Amount", value: sub.amount ? fmt(sub.amount) : "—" },
              { label: "Next Billing", value: sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString() : "—" },
              { label: "Billing Cycle", value: sub.billing_cycle || "—" },
              { label: "Start Date", value: sub.start_date ? new Date(sub.start_date).toLocaleDateString() : "—" },
              { label: "Retry Count", value: sub.retry_count ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-800/50 rounded-lg px-3 py-2.5">
                <div className="text-gray-500 text-xs mb-0.5">{label}</div>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>

          {/* Virtual Account */}
          {sub.nomba_account_number && (
            <div className="bg-gray-800/50 rounded-lg px-4 py-3">
              <div className="text-gray-500 text-xs mb-1">Nomba Virtual Account</div>
              <div className="text-white font-mono text-sm tracking-wider">
                {sub.nomba_account_number}
              </div>
              {sub.nomba_bank_name && (
                <div className="text-gray-500 text-xs mt-0.5">{sub.nomba_bank_name}</div>
              )}
            </div>
          )}

          {/* Payment History */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Payment History</h3>
            {loadingPay ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <p className="text-gray-600 text-sm">No payments found.</p>
            ) : (
              <div className="rounded-xl border border-gray-800 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 bg-gray-800/30">
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Amount</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Status</th>
                      <th className="text-left px-3 py-2 text-gray-500 font-medium">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                        <td className="px-3 py-2 text-gray-400">
                          {p.created_at || p.payment_date
                            ? new Date(p.created_at || p.payment_date).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-white">{fmt(p.amount)}</td>
                        <td className="px-3 py-2"><Badge status={p.status} /></td>
                        <td className="px-3 py-2 text-gray-500 font-mono truncate max-w-[100px]">
                          {p.nomba_transaction_ref || p.transaction_ref || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Change Plan Modal (nested) */}
        {changePlanModal && (
          <Modal title="Change Subscription Plan" onClose={() => { setChangePlanModal(false); setProration(null); setNewPlanId(""); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Select New Plan</label>
                <select
                  value={newPlanId}
                  onChange={(e) => { setNewPlanId(e.target.value); loadProration(e.target.value); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="">— Select a plan —</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {fmt(p.price)} / {p.billing_cycle}
                    </option>
                  ))}
                </select>
              </div>

              {prorationLoading && (
                <div className="bg-gray-800 rounded-lg p-3 animate-pulse h-16" />
              )}
              {proration && !prorationLoading && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-4 space-y-2">
                  <p className="text-brand-500 text-xs font-semibold uppercase tracking-wide">Proration Preview</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(proration).map(([k, v]) => (
                      <div key={k}>
                        <span className="text-gray-500">{k.replace(/_/g, " ")}: </span>
                        <span className="text-white font-medium">{typeof v === "number" ? fmt(v) : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setChangePlanModal(false); setProration(null); setNewPlanId(""); }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePlan}
                  disabled={!newPlanId || actionLoading}
                  className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-gray-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {actionLoading ? "Changing…" : "Confirm Change"}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tenantFilter, setTenantFilter] = useState("");
  const [selectedSub, setSelectedSub] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [rev, setRev] = useState(0);

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      fetchTenants(),
      fetchSubscribers(tenantFilter || undefined),
      fetchPlans(tenantFilter || undefined),
    ]).then(([t, s, p]) => {
      if (t.status === "fulfilled") setTenants(t.value?.results ?? t.value ?? []);
      if (s.status === "fulfilled") setSubscribers(s.value?.results ?? s.value ?? []);
      if (p.status === "fulfilled") setPlans(p.value?.results ?? p.value ?? []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [tenantFilter, rev]);

  const filtered = subscribers.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscribers</h1>
          <p className="text-gray-500 text-sm mt-1">{subscribers.length} total subscribers</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Subscriber
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscriber</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Billing</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Virtual Account</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
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
                    No subscribers found.
                  </td>
                </tr>
              )
              : filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedSub(s)}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-white">{s.name || "—"}</div>
                      <div className="text-gray-500 text-xs">{s.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {plans.find((p) => p.id === s.plan_id)?.name || "—"}
                    </td>
                    <td className="px-5 py-3.5"><Badge status={s.status} /></td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">
                      {s.next_billing_date ? new Date(s.next_billing_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-300">{s.amount ? fmt(s.amount) : "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {s.nomba_account_number
                        ? <span className="font-mono">{s.nomba_account_number}</span>
                        : "—"}
                      {s.nomba_bank_name && (
                        <div className="text-gray-600 mt-0.5">{s.nomba_bank_name}</div>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateSubscriberModal
          tenants={tenants}
          plans={plans}
          onClose={() => setShowCreate(false)}
          onCreated={() => setRev((r) => r + 1)}
        />
      )}

      {selectedSub && (
        <SubscriberDetail
          sub={selectedSub}
          plans={plans}
          onClose={() => setSelectedSub(null)}
          onRefresh={() => setRev((r) => r + 1)}
        />
      )}
    </div>
  );
}
