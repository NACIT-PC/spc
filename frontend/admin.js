"use strict";
// Staff review queue. Shared API helpers (API_URL, apiFetch, tokens) come from api.js.

const statusEl = document.querySelector("#admin-status");
const statsEl  = document.querySelector("#admin-stats");
const rowsEl   = document.querySelector("#admin-rows");
const addBtn   = document.querySelector("#add-btn");
const submitEl = document.querySelector("#submit");
const submitForm = document.querySelector("#submit-form");
const submitStatusEl = document.querySelector("#submit-status");
const submitCategory = document.querySelector("#f-category");

let categoryIdByName = {};

function esc(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

async function authed(path, options) {
  const res = await apiFetch(path, options);
  if (res.status === 401 || res.status === 403) throw new Error("Staff sign-in needed.");
  if (!res.ok) throw new Error(`The server answered with status ${res.status}`);
  return res.status === 204 ? null : res.json();
}

function row(provider) {
  const badge = provider.is_verified
    ? `<span class="card__verified">Verified</span>`
    : `<button class="btn btn--brand" data-verify="${esc(provider.id)}" type="button">Verify</button>`;
  return `<article class="card" data-id="${esc(provider.id)}">
    <div class="card__head">
      <div class="card__title">
        <h2 class="card__name details__name">${esc(provider.name)}</h2>
        <p class="card__meta"><span>${esc(provider.category)}</span>
        <span class="card__location">${esc(provider.city)}</span></p>
      </div>
    </div>
    <p class="details__description">${esc(provider.description)}</p>
    <dl class="details__facts">
      <div><dt>Price</dt><dd>${esc(provider.price_range || "—")}</dd></div>
      <div><dt>Phone</dt><dd>${esc(provider.phone || "—")}</dd></div>
      <div><dt>WhatsApp</dt><dd>${esc(provider.whatsapp || "—")}</dd></div>
      <div><dt>Listed</dt><dd>${esc(formatDate(provider.created_at))}</dd></div>
    </dl>
    <div class="card__actions">${badge}
      <button class="btn btn--quiet" data-delete="${esc(provider.id)}" type="button">Delete</button>
    </div>
  </article>`;
}

function openCreate() {
  submitStatusEl.textContent = "";
  if (typeof submitEl.showModal === "function") submitEl.showModal();
  else submitEl.setAttribute("open", "");
}

async function handleCreate(event) {
  event.preventDefault();
  const body = {
    name:          document.querySelector("#f-name").value.trim(),
    category_id:   categoryIdByName[submitCategory.value],
    city:          document.querySelector("#f-city").value.trim(),
    price_range:   document.querySelector("#f-price").value.trim(),
    description:   document.querySelector("#f-description").value.trim(),
    phone:         document.querySelector("#f-phone").value.trim(),
    whatsapp:      document.querySelector("#f-whatsapp").value.trim(),
  };
  submitStatusEl.textContent = "Adding...";
  try {
    const res = await apiFetch("/providers/", { method: "POST", body: JSON.stringify(body) });
    if (res.status === 401 || res.status === 403) {
      submitStatusEl.textContent = "Staff sign-in needed.";
      return;
    }
    if (!res.ok) {
      const errors = await res.json().catch(() => ({}));
      submitStatusEl.textContent = Object.values(errors).flat()[0] || "Add failed. Check the fields.";
      return;
    }
    submitEl.close();
    submitForm.reset();
    await load();
  } catch {
    submitStatusEl.textContent = "Could not reach the server. Try again.";
  }
}

async function load() {
  const { username } = getTokens();
  if (DEMO || !username) {
    statusEl.innerHTML = `Sign in as staff first. <a class="link-btn" href="login.html">Sign in</a>`;
    return;
  }
  let me;
  try {
    me = await (await apiFetch("/auth/me/")).json();
  } catch {
    statusEl.textContent = "Could not reach the server. Try again.";
    return;
  }
  if (!me.is_staff) {
    statusEl.textContent = `Signed in as ${me.username}, but this page is staff only.`;
    return;
  }
  statusEl.textContent = "Loading listings...";
  try {
    const res = await apiFetch("/providers/");
    if (!res.ok) throw new Error();
    const data = await res.json();
    let rows = Array.isArray(data) ? data : [...(data.results ?? [])];
    let next = Array.isArray(data) ? null : data.next;
    while (next) {
      const page = await apiFetch(next);
      if (!page.ok) throw new Error();
      const body = await page.json();
      rows.push(...(body.results ?? []));
      next = body.next;
    }
    const pending = rows.filter((p) => !p.is_verified).length;
    statsEl.hidden = false;
    statsEl.textContent = `${rows.length} listings · ${rows.length - pending} verified · ${pending} awaiting review.`;
    statusEl.textContent = "";
    addBtn.hidden = false;
    categoryIdByName = {};
    rows.forEach((p) => {
      if (p.category?.name && p.category?.id) categoryIdByName[p.category.name] = p.category.id;
    });
    submitCategory.length = 1;
    Object.keys(categoryIdByName).sort((a, b) => a.localeCompare(b)).forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      submitCategory.append(option);
    });
    rowsEl.innerHTML = rows.map((p) => row({
      id: p.id, name: p.name,
      category: p.category?.name ?? p.category, city: p.city,
      description: p.description, price_range: p.price_range,
      phone: p.phone, whatsapp: p.whatsapp,
      created_at: p.created_at, is_verified: p.is_verified,
    })).join("");
  } catch {
    statusEl.textContent = "Could not load listings. Try again.";
  }
}

rowsEl.addEventListener("click", async (event) => {
  const verifyId = event.target.closest("[data-verify]")?.dataset.verify;
  const deleteId = event.target.closest("[data-delete]")?.dataset.delete;
  try {
    if (verifyId) {
      await authed(`/providers/${verifyId}/verify/`, { method: "POST" });
      await load();
    } else if (deleteId && confirm("Delete this listing?")) {
      await authed(`/providers/${deleteId}/`, { method: "DELETE" });
      await load();
    }
  } catch (error) {
    statusEl.textContent = error.message;
  }
});

addBtn.addEventListener("click", openCreate);
submitForm.addEventListener("submit", handleCreate);
document.querySelector("#submit-cancel").addEventListener("click", () => submitEl.close());

load();
