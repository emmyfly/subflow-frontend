const API_BASE = "https://nomba-subscriptions-engine.onrender.com/api";
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;

const json = (r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);
  return r.json();
};

const headers = (extra = {}) => ({
  "X-Admin-Token": ADMIN_TOKEN,
  ...extra,
});

// Tenants
export const fetchTenants = () =>
  fetch(`${API_BASE}/tenants/`, { headers: headers() }).then(json);

export const createTenant = (data) =>
  fetch(`${API_BASE}/tenants/`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

export const updateTenant = (id, data, { bearerToken } = {}) =>
  fetch(`${API_BASE}/tenants/${id}`, {
    method: "PUT",
    headers: headers({
      "Content-Type": "application/json",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    }),
    body: JSON.stringify(data),
  }).then(json);

// Plans
export const fetchPlans = (tenantId) =>
  fetch(`${API_BASE}/plans/${tenantId ? `?tenant_id=${tenantId}` : ""}`, { headers: headers() }).then(json);

export const createPlan = (data) =>
  fetch(`${API_BASE}/plans/`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

export const updatePlan = (id, data) =>
  fetch(`${API_BASE}/plans/${id}/`, {
    method: "PUT",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

export const deletePlan = (id) =>
  fetch(`${API_BASE}/plans/${id}/`, { method: "DELETE", headers: headers() }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return true;
  });

// Subscribers
export const fetchSubscribers = (tenantId) =>
  fetch(`${API_BASE}/subscribers/${tenantId ? `?tenant_id=${tenantId}` : ""}`, { headers: headers() }).then(json);

export const fetchSubscriber = (id) =>
  fetch(`${API_BASE}/subscribers/${id}/`, { headers: headers() }).then(json);

export const createSubscriber = (data) =>
  fetch(`${API_BASE}/subscribers/`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify(data),
  }).then(json);

export const cancelSubscriber = (id) =>
  fetch(`${API_BASE}/subscribers/${id}/cancel/`, { method: "POST", headers: headers() }).then(json);

export const changePlan = (id, newPlanId) =>
  fetch(`${API_BASE}/subscribers/${id}/change-plan/`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ new_plan_id: newPlanId }),
  }).then(json);

export const fetchProrationPreview = (id, newPlanId) =>
  fetch(`${API_BASE}/subscribers/${id}/proration-preview/?new_plan_id=${newPlanId}`, { headers: headers() }).then(json);

// Payments
export const fetchPayments = (tenantId) =>
  fetch(`${API_BASE}/payments/${tenantId ? `?tenant_id=${tenantId}` : ""}`, { headers: headers() }).then(json);

export const fetchSubscriberPayments = (subscriberId) =>
  fetch(`${API_BASE}/payments/?subscriber_id=${subscriberId}`, { headers: headers() }).then(json);

// Dunning / retry queue
export const fetchRetryQueue = () =>
  fetch(`${API_BASE}/subscribers/due-for-retry`, { headers: headers() }).then(json);

// Webhooks
export const fetchWebhooks = () =>
  fetch(`${API_BASE}/webhooks/`, { headers: headers() }).then(json);
