import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Save-to-Subscribe",
    desc: "Subscribers pay in flexible partial deposits instead of one lump sum — matching how income actually arrives.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: "Dedicated virtual accounts",
    desc: "Every subscriber gets their own Nomba-issued bank account number — no reference codes, no manual matching.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M3 21V7l9-4 9 4v14" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    title: "Instant, automated payouts",
    desc: "The moment a payment clears, your share transfers to your own bank account — no batching, no settlement run.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    title: "Automated dunning",
    desc: "Missed payments escalate through notice, retry, and suspension automatically — no manual chasing.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-5 h-5">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-gray-900 font-bold text-sm">
            S
          </div>
          <span className="text-white font-semibold">SubFlow</span>
        </div>
        <Link
          to="/signup"
          className="bg-brand-500 hover:bg-brand-400 text-gray-900 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
        >
          Get your API key
        </Link>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
        <p className="text-brand-500 text-xs font-semibold uppercase tracking-wider mb-4">
          Powered by Nomba Infrastructure
        </p>
        <h1 className="text-white text-4xl sm:text-5xl font-bold tracking-tight mb-5">
          Subscription billing, built for Nigerian businesses
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          SubFlow owns your subscription lifecycle — plans, collection, dunning, and instant payouts —
          on top of Nomba's payment rails. Register your business and start collecting recurring
          revenue in minutes.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="bg-brand-500 hover:bg-brand-400 text-gray-900 rounded-lg px-6 py-3 text-sm font-semibold transition-colors"
          >
            Get your API key
          </Link>
          <a
            href="https://nomba-subscriptions-engine.onrender.com/redoc"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg px-6 py-3 text-sm font-medium transition-colors"
          >
            View API docs
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <span className="inline-flex rounded-lg bg-brand-500/10 text-brand-500 p-2 mb-4">
              {f.icon}
            </span>
            <h3 className="text-white font-semibold text-sm mb-1.5">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <span>Built for the Nomba × DevCareer Hackathon 2026 (Infrastructure Track).</span>
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-400 transition-colors">
            Admin console
          </Link>
        </div>
      </footer>
    </div>
  );
}
