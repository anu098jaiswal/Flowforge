// In dev this falls back to localhost:8080. For a deployed build, set
// VITE_API_BASE_URL (e.g. in a .env.production file or your host's env vars)
// to your deployed backend's URL, or the app will keep calling localhost.
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function handle(res, json = true) {
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || `HTTP ${res.status}`);
  }
  if (!json) return res.text();
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getWorkflows = () =>
  fetch(`${BASE}/api/workflows`, { headers: getAuthHeaders() }).then(handle);
export const createWorkflow = (w) =>
  fetch(`${BASE}/api/workflows`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(w),
  }).then(handle);
export const deleteWorkflow = (id) =>
  fetch(`${BASE}/api/workflows/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  }).then((r) => handle(r, false));
export const fireWebhook = (id, body) =>
  fetch(`${BASE}/api/webhooks/${id}`, {
    method: "POST",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body,
  }).then((r) => handle(r, false));
export const getLogs = (id) =>
  fetch(`${BASE}/api/workflows/${id}/logs`, { headers: getAuthHeaders() }).then(
    handle,
  );

export const login = (username, password) =>
  fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then(handle);
export const register = (username, email, password) =>
  fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  }).then(handle);
