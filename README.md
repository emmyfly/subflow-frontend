# SubFlow — Admin Dashboard

The frontend for **SubFlow**, a multi-tenant subscription billing engine built on Nomba's payment infrastructure. This includes a public landing page, a self-serve signup page for new businesses to get an API key (with payout bank details), and a React admin console for managing tenants, subscription plans, subscribers, dunning, and payments.

| | |
|---|---|
| **Live Site** | https://subflow-frontend-coral.vercel.app |
| **Admin Console** | https://subflow-frontend-coral.vercel.app/dashboard |
| **Backend API** | https://nomba-subscriptions-engine.onrender.com/api |
| **API Docs** | https://nomba-subscriptions-engine.onrender.com/redoc |
| **Backend Repo** | https://github.com/emmyfly/nomba-subscriptions-engine |

> The backend runs on Render's free tier and spins down after inactivity — the first request after idle time can take 30–50 seconds to wake it up. This is infrastructure behavior, not application latency.

## Table of Contents

- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started Locally](#getting-started-locally)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Related](#related)

## Pages

| Route | Purpose |
|---|---|
| `/` | Public landing page — product pitch, feature highlights, links to `/signup` and the API docs |
| `/signup` | Public, unauthenticated page — a business enters its name, email, and payout bank details (bank, account number, account holder name) and receives an API key in one step, no admin involvement required |
| `/dashboard` | Admin dashboard — stat cards, MRR trend, weekly new subscribers |
| `/tenants` | Manage tenants, reveal/copy API keys, share the public signup link |
| `/plans` | Create, edit, and delete subscription plans per tenant |
| `/subscribers` | Filterable subscriber table with a detail panel — payment history, cancel, change plan with proration preview |
| `/dunning` | Retry queue for failed payments, color-coded by urgency |
| `/payments` | Full transaction log, filterable by tenant and status |
| `/settings` | API connection status, webhook URL, retry policy |

`/` and `/signup` render standalone, with no admin sidebar; every other route is nested under the shared admin `Layout`.

## Tech Stack

- **Framework:** React 19
- **Build tool:** Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`)
- **Charts:** Recharts
- **Language:** Plain JSX — no TypeScript
- **Linting:** Oxlint

## Project Structure

```
src/
├── api.js                  # All fetch calls to the backend; throws on non-2xx
├── App.jsx                 # Routing — / and /signup standalone, everything else under Layout
├── components/
│   ├── Layout.jsx           # Page shell + responsive mobile drawer toggle
│   ├── Sidebar.jsx          # Nav, collapses to a slide-in drawer on mobile
│   ├── StatCard.jsx         # Dashboard stat tile
│   ├── Badge.jsx            # Status pill (active, past_due, failed, ...)
│   └── Modal.jsx            # Centered modal shell used by create/edit forms
├── pages/
│   ├── Landing.jsx            # Public landing page (route: /)
│   ├── Signup.jsx             # Public tenant self-serve signup (route: /signup)
│   └── Dashboard.jsx, Tenants.jsx, Plans.jsx, Subscribers.jsx,
│       Dunning.jsx, Payments.jsx, Settings.jsx   # Admin console (under /dashboard, /tenants, ...)
├── index.css                # Tailwind import + brand color tokens (@theme)
└── main.jsx                  # Entry point
```

## Getting Started Locally

```bash
git clone https://github.com/emmyfly/subflow-frontend.git
cd subflow-frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. Other scripts:

```bash
npm run build      # production build to dist/
npm run preview    # preview the production build locally
npm run lint       # oxlint
```

## Configuration

The backend base URL is a constant at the top of [`src/api.js`](src/api.js) and [`src/pages/Settings.jsx`](src/pages/Settings.jsx):

```js
const API_BASE = "https://nomba-subscriptions-engine.onrender.com/api";
```

To point this frontend at a different backend (e.g. a local instance of the FastAPI service), update `API_BASE` in both files.

One value does come from an env var — copy [`.env.example`](.env.example) to `.env` and set:

```
VITE_ADMIN_TOKEN=<shared secret>
```

This is sent as an `X-Admin-Token` header on every request. Get the real value from whoever manages the backend, and set the same variable in the Vercel project's Environment Variables for production. Note: since this is a client-side SPA, this value is baked into the shipped JS bundle and is visible to anyone inspecting it in devtools — it's not a substitute for real server-side authentication, just a lightweight deterrent against casual API abuse.

## Deployment

Deployed on Vercel. [`vercel.json`](vercel.json) rewrites all paths to `/index.html` so client-side routes (like `/subscribers` or `/signup`) resolve correctly on a hard refresh instead of 404ing.

## Related

Full system architecture, Nomba integration details, and the backend's own tech stack are documented in the [backend repo's README](https://github.com/emmyfly/nomba-subscriptions-engine).

---

Built for the Nomba × DevCareer Hackathon 2026 (Infrastructure Track).
