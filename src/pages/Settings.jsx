import { useEffect, useState } from "react";

const API_BASE = "https://nomba-subscriptions-engine.onrender.com/api";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 text-emerald-400">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function StatusIndicator({ ok, loading }) {
  if (loading) return <span className="w-2.5 h-2.5 rounded-full bg-gray-600 animate-pulse inline-block" />;
  return (
    <span className={`w-2.5 h-2.5 rounded-full inline-block ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
      <h2 className="text-white font-semibold text-sm border-b border-gray-800 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function InfoRow({ label, value, mono = false, extra }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-gray-200 text-sm ${mono ? "font-mono" : ""}`}>{value}</span>
        {extra}
      </div>
    </div>
  );
}

export default function Settings() {
  const [apiStatus, setApiStatus] = useState({ loading: true, ok: false, latency: null });

  useEffect(() => {
    const start = Date.now();
    fetch(`${API_BASE}/tenants/`)
      .then((r) => {
        setApiStatus({ loading: false, ok: r.ok, latency: Date.now() - start });
      })
      .catch(() => {
        setApiStatus({ loading: false, ok: false, latency: null });
      });
  }, []);

  const webhookUrl = `${API_BASE}/webhooks/nomba/`;

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System configuration and status</p>
      </div>

      <div className="space-y-5 max-w-2xl">
        {/* API Status */}
        <Section title="Nomba API Status">
          <InfoRow
            label="API Base URL"
            value={API_BASE}
            mono
            extra={<CopyButton text={API_BASE} />}
          />
          <InfoRow
            label="Connection Status"
            value={
              <div className="flex items-center gap-2">
                <StatusIndicator ok={apiStatus.ok} loading={apiStatus.loading} />
                <span className={apiStatus.loading ? "text-gray-500" : apiStatus.ok ? "text-emerald-400" : "text-red-400"}>
                  {apiStatus.loading ? "Checking…" : apiStatus.ok ? "Connected" : "Unreachable"}
                </span>
              </div>
            }
          />
          {apiStatus.latency != null && (
            <InfoRow
              label="Response Latency"
              value={`${apiStatus.latency}ms`}
            />
          )}
        </Section>

        {/* Webhook */}
        <Section title="Webhook Configuration">
          <div className="bg-gray-800 rounded-lg p-3 flex items-center justify-between gap-3">
            <code className="text-xs text-brand-400 font-mono break-all flex-1">{webhookUrl}</code>
            <CopyButton text={webhookUrl} />
          </div>
          <div className="text-gray-500 text-xs leading-relaxed">
            Register this URL in your Nomba dashboard to receive payment events. SubFlow processes
            <code className="text-brand-500 mx-1 bg-gray-800 px-1 py-0.5 rounded">payment.success</code>
            and
            <code className="text-brand-500 mx-1 bg-gray-800 px-1 py-0.5 rounded">payment.failed</code>
            events to update subscriber status automatically.
          </div>
        </Section>

        {/* Retry Policy */}
        <Section title="Default Retry Policy">
          <InfoRow label="Max Retries" value="3" />
          <InfoRow label="Initial Retry Delay" value="24 hours" />
          <InfoRow label="Retry Strategy" value="Exponential backoff" />
          <InfoRow label="Grace Period" value="72 hours after first failure" />
          <InfoRow label="Final Action" value="Suspend subscription" />
          <div className="text-gray-500 text-xs leading-relaxed pt-1">
            SubFlow automatically retries failed payments using Nomba's virtual account infrastructure.
            Subscribers are notified at each retry attempt before final suspension.
          </div>
        </Section>

        {/* Infrastructure */}
        <Section title="Infrastructure">
          <InfoRow label="Payment Provider" value="Nomba" />
          <InfoRow label="Virtual Accounts" value="Nomba-issued NGN accounts" />
          <InfoRow label="Engine" value="SubFlow v1.0" />
          <InfoRow label="Hackathon" value="Nomba × DevCareer 2026 — Infrastructure Track" />
          <InfoRow label="Backend Host" value="Render" />
        </Section>
      </div>
    </div>
  );
}
