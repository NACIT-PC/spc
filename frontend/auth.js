"use strict";
// Sign-in page logic. Shared API helpers (API_URL, apiFetch, tokens) come from api.js.

const userEl   = document.querySelector("#auth-user");
const passEl   = document.querySelector("#auth-pass");
const statusEl = document.querySelector("#auth-status");

if (getTokens().username) location.replace("./");

function firstError(body) {
  const first = Object.values(body || {}).flat()[0];
  return typeof first === "string" ? first : null;
}

async function authenticate(mode) {
  const username = userEl.value.trim();
  const password = passEl.value;
  if (!username || !password) {
    statusEl.textContent = "Enter a username and password first.";
    return;
  }
  statusEl.textContent = mode === "register" ? "Creating your account..." : "Signing you in...";
  try {
    if (mode === "register") {
      const res = await apiFetch("/auth/register/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        statusEl.textContent = firstError(await res.json().catch(() => ({}))) || "Registration failed.";
        return;
      }
    }
    const res = await apiFetch("/auth/token/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      statusEl.textContent = "Log in failed. Check your details.";
      return;
    }
    const body = await res.json();
    setTokens({ username, access: body.access, refresh: body.refresh });
    location.replace("./");
  } catch {
    statusEl.textContent = "Could not reach the server. Try again.";
  }
}

document.querySelector("#login-btn").addEventListener("click", () => authenticate("login"));
document.querySelector("#register-btn").addEventListener("click", () => authenticate("register"));
passEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") authenticate("login");
});
userEl.focus();
