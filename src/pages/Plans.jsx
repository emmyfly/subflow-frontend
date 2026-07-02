import { useEffect, useState } from "react";
import { fetchPlans, fetchTenants, createPlan, updatePlan, deletePlan } from "../api";
import Modal from "../components/Modal";
import Badge from "../components/Badge";

const fmt = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const CYCLES = ["weekly", "monthly", "quarterly", "annual"];

function PlanForm({ initial, tenants, onSubmit, onClose }) {
  const [form, setForm] = useState(
    initial || {
      tenant_id: tenants[0]?.id || "",
      name: "",
      description: "",
      price: "",
      billing_cycle: "monthly",
      status: "active",
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({ ...form, price: parseFloat(form.price) });
      onClose();
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Tenant *</label>
        <select
          required
          value={form.tenant_id}
          onChange={(e) => setForm({ ...form, tenant_id: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
        >
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Plan Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Pro Plan"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe what's included…"
          rows={2}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors resize-none"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Price (NGN) *</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="5000"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Billing Cycle *</label>
          <select
            value={form.billing_cycle}
            onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            {CYCLES.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
        <select
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      {error && (
        <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-4 py-2 text-sm transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-gray-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
          {loading ? "Saving…" : initial ? "Update Plan" : "Create Plan"}
        </button>
      </div>
    </form>
  );
}

const cycleColor = {
  weekly: "text-blue-400 bg-blue-500/10",
  monthly: "text-brand-500 bg-brand-500/10",
  quarterly: "text-emerald-400 bg-emerald-500/10",
  annual: "text-orange-400 bg-orange-500/10",
};

function PlanCard({ plan, tenants, onEdit, onDelete }) {
  const tenant = tenants.find((t) => t.id === plan.tenant_id);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete plan "${plan.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(plan.id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">{plan.name}</h3>
          <p className="text-gray-500 text-xs mt-0.5">{tenant?.name || plan.tenant_id}</p>
        </div>
        <Badge status={plan.status} />
      </div>

      {plan.description && (
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{plan.description}</p>
      )}

      <div className="flex items-end justify-between mt-auto">
        <div>
          <div className="text-white text-xl font-bold">{fmt(plan.price)}</div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cycleColor[plan.billing_cycle] || "text-gray-400 bg-gray-800"}`}>
            {plan.billing_cycle}
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-gray-800">
        <button
          onClick={() => onEdit(plan)}
          className="flex-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg py-1.5 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg py-1.5 transition-colors disabled:opacity-50"
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | plan object

  useEffect(() => {
    fetchTenants()
      .then((d) => {
        const t = d?.results ?? d ?? [];
        setTenants(t);
        return t;
      })
      .then((t) => {
        const tid = t[0]?.id;
        return fetchPlans(tid);
      })
      .then((d) => setPlans(d?.results ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const loadPlans = (tid) => {
    setLoading(true);
    fetchPlans(tid)
      .then((d) => setPlans(d?.results ?? d ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleTenantChange = (tid) => {
    setSelectedTenant(tid);
    loadPlans(tid);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Subscription Plans</h1>
          <p className="text-gray-500 text-sm mt-1">Define and manage billing tiers</p>
        </div>
        <button
          onClick={() => setModal("create")}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Plan
        </button>
      </div>

      {/* Tenant filter */}
      <div className="flex items-center gap-3 mb-6">
        <label className="text-xs text-gray-500">Filter by tenant:</label>
        <select
          value={selectedTenant}
          onChange={(e) => handleTenantChange(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Tenants</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 h-44 animate-pulse" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-3 opacity-30">
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
          No plans found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              tenants={tenants}
              onEdit={(p) => setModal(p)}
              onDelete={async (id) => {
                await deletePlan(id);
                setPlans((prev) => prev.filter((p) => p.id !== id));
              }}
            />
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={modal === "create" ? "Create Plan" : `Edit: ${modal.name}`}
          onClose={() => setModal(null)}
        >
          <PlanForm
            initial={modal === "create" ? null : modal}
            tenants={tenants}
            onSubmit={async (data) => {
              if (modal === "create") {
                const p = await createPlan(data);
                setPlans((prev) => [p, ...prev]);
              } else {
                const p = await updatePlan(modal.id, data);
                setPlans((prev) => prev.map((x) => (x.id === modal.id ? p : x)));
              }
            }}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  );
}
