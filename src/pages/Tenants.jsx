import { useEffect, useState } from "react";
import { fetchTenants, createTenant } from "../api";
import Modal from "../components/Modal";

function KeyDisplay({ apiKey }) {
  const [visible, setVisible] = useState(false);
  const display = visible ? apiKey : (apiKey ? apiKey.slice(0, 6) + "•".repeat(16) : "—");

  const copy = () => {
    navigator.clipboard.writeText(apiKey).catch(() => {});
  };

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs text-gray-300 font-mono bg-gray-800 px-2 py-1 rounded max-w-[180px] truncate">
        {display}
      </code>
      <button
        onClick={() => setVisible((v) => !v)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
        title={visible ? "Hide" : "Reveal"}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
      {apiKey && (
        <button
          onClick={copy}
          className="text-gray-500 hover:text-gray-300 transition-colors"
          title="Copy"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
      )}
    </div>
  );
}

function CreateTenantModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tenant = await createTenant(form);
      onCreated(tenant);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create New Tenant" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Tenant Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Acme Corp"
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
            placeholder="admin@acme.com"
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
            {loading ? "Creating…" : "Create Tenant"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Tenants() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    fetchTenants()
      .then((data) => setTenants(data?.results ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">Manage organisations using SubFlow</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/signup`).catch(() => {});
              setLinkCopied(true);
              setTimeout(() => setLinkCopied(false), 2000);
            }}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl px-4 py-2 text-sm transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {linkCopied ? "Copied!" : "Copy Signup Link"}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-gray-900 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Tenant
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tenants…"
          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.length === 0
              ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-gray-600">
                    {search ? "No tenants match your search" : "No tenants found. Create one to get started."}
                  </td>
                </tr>
              )
              : filtered.map((t) => (
                  <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-gray-800 ring-1 ring-gray-700 flex items-center justify-center text-brand-500 text-xs font-bold flex-shrink-0">
                          {t.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-white font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">{t.email}</td>
                    <td className="px-5 py-3.5">
                      <KeyDisplay apiKey={t.api_key || t.apiKey} />
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 font-mono text-xs">{t.id}</td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <CreateTenantModal
          onClose={() => setShowCreate(false)}
          onCreated={(t) => setTenants((prev) => [t, ...prev])}
        />
      )}
    </div>
  );
}
