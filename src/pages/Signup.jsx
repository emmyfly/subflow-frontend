import { useState } from "react";
import { createTenant, updateTenant } from "../api";

// Standard NIBSS bank codes. Verify against Nomba's supported bank list before
// launch — a wrong code just fails their name-match verification (held for
// manual review, never paid out blindly), but should still be correct.
const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "103" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay (Paycom)", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Parallex Bank", code: "104" },
  { name: "Polaris Bank", code: "076" },
  { name: "Premium Trust Bank", code: "105" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

const inputClass =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    bank_code: "",
    bank_account_number: "",
    bank_account_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankWarning, setBankWarning] = useState("");
  const [tenant, setTenant] = useState(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBankWarning("");
    try {
      const t = await createTenant({ name: form.name, email: form.email });
      try {
        const updated = await updateTenant(
          t.id,
          {
            bank_code: form.bank_code,
            bank_account_number: form.bank_account_number,
            bank_account_name: form.bank_account_name,
          },
          { bearerToken: t.api_key }
        );
        setTenant(updated);
      } catch {
        setBankWarning(
          "Your account was created, but we couldn't save your bank details. Add them from the admin dashboard or contact support — automatic payouts won't start until that's done."
        );
        setTenant(t);
      }
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
    setBankWarning("");
    setForm({ name: "", email: "", bank_code: "", bank_account_number: "", bank_account_name: "" });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 py-10">
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
                Set up your SubFlow account — including payouts — in one step, and start managing
                subscriptions on Nomba's payment infrastructure right away.
              </p>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Business Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Acme Corp"
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>

                <div className="pt-2 border-t border-gray-800">
                  <p className="text-gray-500 text-xs mb-3">
                    Payout account — where your share of every payment lands automatically.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Bank *</label>
                      <select
                        required
                        value={form.bank_code}
                        onChange={(e) => setForm({ ...form, bank_code: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">— Select your bank —</option>
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Account Number *</label>
                      <input
                        required
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={form.bank_account_number}
                        onChange={(e) => setForm({ ...form, bank_account_number: e.target.value.replace(/\D/g, "") })}
                        placeholder="0123456789"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Account Holder Name *</label>
                      <input
                        required
                        value={form.bank_account_name}
                        onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
                        placeholder="Exactly as it appears on your bank account"
                        className={inputClass}
                      />
                      <p className="text-gray-600 text-[11px] mt-1.5">
                        We verify this against your bank before your first payout — it can differ slightly from your business name.
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  {loading ? "Setting up your account…" : "Create account"}
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

              {bankWarning && (
                <p className="text-orange-400 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-4">
                  {bankWarning}
                </p>
              )}

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

              {!bankWarning && (
                <div className="bg-gray-800/50 rounded-lg px-3 py-2.5 mb-4 text-xs text-gray-400">
                  Payout account: <span className="text-gray-200">{tenant.bank_account_name}</span> · {tenant.bank_account_number}
                  <div className="text-gray-600 mt-0.5">
                    We'll verify this account against your bank before your first automatic payout.
                  </div>
                </div>
              )}

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
