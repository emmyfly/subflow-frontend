import { useState } from "react";
import { createTenant } from "../api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const t = await createTenant(form);
      setTenant(t);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(tenant.api_key || tenant.apiKey).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setTenant(null);
    setForm({ name: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-md bg-brand-500 flex items-center justify-center text-gray-900 font-bold text-sm">
            S
          </div>
          <div>
            <div className="text-white font-semibold leading-tight">SubFlow</div>
            <div className="text-gray-500 text-[11px] leading-tight">Powered by Nomba Infrastructure</div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-7">
          {!tenant ? (
            <>
              <h1 className="text-white text-xl font-bold tracking-tight mb-1">Get your API key</h1>
              <p className="text-gray-500 text-sm mb-6">
                Create your SubFlow account to start managing subscriptions on Nomba's payment infrastructure.
              </p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Business Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Work Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@business.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 shrink-0">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <h1 className="text-white text-xl font-bold tracking-tight">You're all set</h1>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Here's your API key for <span className="text-gray-300 font-medium">{tenant.name}</span>. Store it somewhere safe — for security, we won't show it again.
              </p>

              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4">
                <div className="text-gray-500 text-[11px] uppercase tracking-wide mb-1.5">API Key</div>
                <div className="flex items-center gap-2">
                  <code className="text-brand-400 font-mono text-xs break-all flex-1">
                    {tenant.api_key || tenant.apiKey}
                  </code>
                  <button
                    onClick={copyKey}
                    className="shrink-0 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-md px-2.5 py-1.5 transition-colors"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-2.5 text-xs text-gray-400 mb-6">
                Add this key as an <code className="text-brand-400">Authorization</code> header when calling the SubFlow API from your backend.
              </div>

              <button
                onClick={reset}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                Create another account
              </button>
            </>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Already integrated? <a href="mailto:support@nomba.com" className="text-gray-400 hover:text-gray-200">Contact support</a> for help.
        </p>
      </div>
    </div>
  );
}
