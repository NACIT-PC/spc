"use strict";

// Shared by every frontend page. Load before the page script.
// Calls syncAuthUI() on session expiry only if the page defines it.

const PARAMS = new URLSearchParams(location.search);

// ponytail: ?api= overrides the backend (demo-day/Render) without redeploying
const API_URL = PARAMS.get("api") || (["localhost", "127.0.0.1", ""].includes(location.hostname)
  ? "http://127.0.0.1:8000/api"
  : "https://YOUR-APP-NAME.onrender.com/api");

const DEMO = PARAMS.has("demo");

const TOKEN_KEY = "spc_tokens";

function getTokens() {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY)) || {}; }
  catch { return {}; }
}

function setTokens(tokens) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
}

// ponytail: refresh-once on 401, then give up and drop the session
async function apiFetch(path, options = {}, retried = false) {
  const tokens = getTokens();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401 && tokens.refresh && !retried) {
    const rr = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    });
    if (rr.ok) {
      const body = await rr.json();
      setTokens({ ...tokens, access: body.access });
      return apiFetch(path, options, true);
    }
    clearTokens();
    if (typeof syncAuthUI === "function") syncAuthUI();
  }
  return res;
}
