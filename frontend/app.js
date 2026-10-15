"use strict";

const API_URL = ["localhost", "127.0.0.1", ""].includes(location.hostname)
  ? "http://127.0.0.1:8000/api"
  : "https://YOUR-APP-NAME.onrender.com/api";

const DEMO = new URLSearchParams(location.search).has("demo");

const DEMO_RESPONSE = [
  { id: "demo-1", name: "Example Decor", category: { id: "c1", name: "Decor" },
    city: "Blantyre", description: "Example wedding and event decoration service.",
    price_range: "Indicative range: mid", phone: 265000000001, whatsapp: "265000000001",
    is_verified: false, created_at: "2026-10-14T12:00:00Z" },
  { id: "demo-2", name: "Sample Bites Catering", category: { id: "c2", name: "Catering" },
    city: "Lilongwe", description: "Sample catering for weddings, funerals and conferences.",
    price_range: "Indicative range: mid to high", phone: 265000000002, whatsapp: "265000000002",
    is_verified: true,
    created_at: "2026-10-14T12:05:00Z" },
  { id: "demo-3", name: "Demo MC Services", category: { id: "c3", name: "MC" },
    city: "Mzuzu", description: "Sample master of ceremonies for weddings and corporate events.",
    price_range: "Indicative range: low to mid", phone: 265000000003, whatsapp: "265000000003",
    is_verified: false, created_at: "2026-10-14T12:10:00Z" },
  { id: "demo-4", name: "Placeholder Photography", category: { id: "c4", name: "Photography" },
    city: "Blantyre", description: "Sample photo and video coverage for events. This one has no WhatsApp number, so only the Call button shows.",
    price_range: "Indicative range: mid", phone: 265000000004, whatsapp: "",
    is_verified: false, created_at: "2026-10-14T12:15:00Z" },
  { id: "demo-5", name: "Test Sound & Lights", category: { id: "c5", name: "Sound" },
    city: "Zomba", description: "Sample PA systems and lighting for small and large events.",
    price_range: "Indicative range: mid to high", phone: 265000000005, whatsapp: "265000000005",
    is_verified: false, created_at: "2026-10-14T12:20:00Z" },
  { id: "demo-6", name: "Example Garden Venue", category: { id: "c6", name: "Venue" },
    city: "Lilongwe",
    description: "Sample outdoor venue with seating for around 200 guests. This description is long on purpose: the card shows only the first two lines, and the details pop-up shows all of it, including this sentence and the one before it.",
    price_range: "Indicative range: high", phone: 265000000006, whatsapp: "265000000006",
    is_verified: false, created_at: "2026-10-14T12:25:00Z" },
];

const searchInput    = document.querySelector("#search");
const categorySelect = document.querySelector("#category");
const citySelect     = document.querySelector("#city");
const chipsEl        = document.querySelector("#chips");
const statusEl       = document.querySelector("#status");
const clearBtn       = document.querySelector("#clear");
const resultsEl      = document.querySelector("#results");
const stateEl        = document.querySelector("#state");
const stateIconEl    = document.querySelector("#state-icon");
const stateTitleEl   = document.querySelector("#state-title");
const stateTextEl    = document.querySelector("#state-text");
const retryBtn       = document.querySelector("#retry");
const cardTemplate   = document.querySelector("#card-template");
const detailsEl      = document.querySelector("#details");

let allProviders = [];
let selectedCategory = "";

function setStatus(message) {
  statusEl.textContent = message;
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function toInternational(number) {
  let digits = String(number).replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length >= 11 && digits.startsWith("265")) return digits;
  if (digits.startsWith("0")) return "265" + digits.slice(1);
  if (digits.length === 9) return "265" + digits;
  return digits;
}

function whatsappLink(number) {
  return `https://wa.me/${toInternational(number)}`;
}

function phoneLink(number) {
  return `tel:+${toInternational(number)}`;
}

function formatPhone(number) {
  const digits = toInternational(number);
  return digits.length === 12
    ? `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`
    : `+${digits}`;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeProvider(raw) {
  const category =
    raw.category && typeof raw.category === "object" ? raw.category.name : raw.category;

  return {
    id:          String(raw.id),
    name:        raw.name ?? "",
    category:    category || "Other",
    city:        raw.city ?? "",
    description: raw.description ?? "",
    priceRange:  raw.price_range ?? "",
    phone:       raw.phone ?? "",
    whatsapp:    raw.whatsapp ?? "",
    verified:    raw.is_verified === true || raw.verified === true,
    createdAt:   raw.created_at ?? "",
  };
}

function setContactLinks(whatsappEl, phoneEl, provider) {
  whatsappEl.hidden = !provider.whatsapp;
  if (provider.whatsapp) {
    whatsappEl.href = whatsappLink(provider.whatsapp);
    whatsappEl.setAttribute("aria-label", `Message ${provider.name} on WhatsApp`);
  }

  phoneEl.hidden = !provider.phone;
  if (provider.phone) {
    phoneEl.href = phoneLink(provider.phone);
    phoneEl.setAttribute("aria-label", `Call ${provider.name}`);
  }
}

function createCard(provider) {
  const card = cardTemplate.content.cloneNode(true);

  card.querySelector(".card").dataset.id = provider.id;

  card.querySelector(".card__name").textContent         = provider.name;
  card.querySelector(".card__category").textContent    = provider.category;
  card.querySelector(".card__city").textContent        = provider.city;
  card.querySelector(".card__description").textContent = provider.description;

  card.querySelector(".card__name").title = provider.name;

  const priceEl = card.querySelector(".card__price");
  priceEl.textContent = provider.priceRange;
  priceEl.hidden = !provider.priceRange;

  card.querySelector(".card__verified").hidden = !provider.verified;

  setContactLinks(
    card.querySelector(".btn--whatsapp"),
    card.querySelector(".btn--phone"),
    provider
  );

  return card;
}

function renderProviders(providers) {
  const fragment = document.createDocumentFragment();
  providers.forEach((provider) => fragment.append(createCard(provider)));
  resultsEl.replaceChildren(fragment);
}

const STATES = {
  error: {
    icon:  "assets/cloud-off.svg",
    title: "We couldn't load the providers",
    text:  "The server may be asleep or offline. Give it a moment, then try again.",
    retry: true,
  },
  empty: {
    icon:  "assets/user-search.svg",
    title: "Provider not found",
    text:  "Try a different name, category or city.",
    retry: false,
  },
  nomatch: {
    icon:  "assets/user-search.svg",
    title: "Provider not found",
    text:  "Try a different name, category or city, or clear the filters.",
    retry: false,
  },
};

function showState(name) {
  const state = STATES[name];
  stateIconEl.setAttribute("src", state.icon);
  stateTitleEl.textContent = state.title;
  stateTextEl.textContent  = state.text;
  retryBtn.hidden = !state.retry;
  stateEl.hidden  = false;
}

function hideState() {
  stateEl.hidden = true;
}

function syncChips() {
  chipsEl.querySelectorAll(".chip").forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.value === selectedCategory));
  });
  categorySelect.value = selectedCategory;
}

function buildChips(categories) {
  const unique = [...new Set(categories.filter(Boolean))];
  unique.sort((a, b) => a.localeCompare(b));

  if (unique.length === 0) {
    chipsEl.replaceChildren();
    return;
  }

  const makeChip = (label, value) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.dataset.value = value;
    chip.textContent = label;
    return chip;
  };

  const fragment = document.createDocumentFragment();
  fragment.append(makeChip("All", ""));
  unique.forEach((name) => fragment.append(makeChip(name, name)));
  chipsEl.replaceChildren(fragment);
  syncChips();
}

function fillSelect(selectEl, values) {
  selectEl.length = 1;
  const unique = [...new Set(values.filter(Boolean))];
  unique.sort((a, b) => a.localeCompare(b));
  unique.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.append(option);
  });
}

function applyFilters() {
  const query     = searchInput.value.trim().toLowerCase();
  const city      = citySelect.value;
  const filtering = Boolean(query || selectedCategory || city);

  const matches = allProviders.filter((provider) => {
    const textOk =
      !query ||
      provider.name.toLowerCase().includes(query) ||
      provider.description.toLowerCase().includes(query);
    const categoryOk = !selectedCategory || provider.category === selectedCategory;
    const cityOk     = !city || provider.city === city;
    return textOk && categoryOk && cityOk;
  });

  renderProviders(matches);
  clearBtn.hidden = !filtering;

  const total = plural(allProviders.length, "provider");
  if (allProviders.length === 0) {
    setStatus("");
    showState("empty");
  } else if (matches.length === 0) {
    setStatus(`Showing 0 of ${total}.`);
    showState("nomatch");
  } else {
    hideState();
    setStatus(filtering ? `Showing ${matches.length} of ${total}.` : `Showing all ${total}.`);
  }
}

function clearFilters() {
  searchInput.value = "";
  citySelect.value = "";
  selectedCategory = "";
  syncChips();
  applyFilters();
  searchInput.focus();
}

async function fetchProviders() {
  if (DEMO) return DEMO_RESPONSE;

  const options = {};
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    options.signal = AbortSignal.timeout(60000);
  }

  const response = await fetch(`${API_URL}/providers/`, options);
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.results ?? []);
}

async function loadProviders() {
  selectedCategory = "";
  clearBtn.hidden = true;
  hideState();
  chipsEl.replaceChildren();
  resultsEl.replaceChildren();
  setStatus("Loading providers...");

  const slowTimer = setTimeout(() => {
    setStatus("Still loading. The free server can take up to a minute to wake up...");
  }, 4000);

  try {
    const raw = await fetchProviders();
    allProviders = raw.map(normalizeProvider);

    buildChips(allProviders.map((p) => p.category));
    fillSelect(categorySelect, allProviders.map((p) => p.category));
    fillSelect(citySelect, allProviders.map((p) => p.city));
    syncChips();

    applyFilters();
  } catch (error) {
    console.error("Could not load providers:", error);
    allProviders = [];
    resultsEl.replaceChildren();
    setStatus("");
    showState("error");
  } finally {
    clearTimeout(slowTimer);
  }
}

function setFact(selector, value) {
  const el = detailsEl.querySelector(selector);
  el.textContent = value;
  el.parentElement.hidden = !value;
}

function openDetails(provider) {
  const pick = (selector) => detailsEl.querySelector(selector);

  pick(".details__name").textContent         = provider.name;
  pick(".details__category").textContent    = provider.category;
  pick(".details__city").textContent        = provider.city;
  pick(".details__description").textContent = provider.description;
  pick(".details__verified").hidden         = !provider.verified;

  setFact(".details__price",  provider.priceRange);
  setFact(".details__phone",  provider.phone ? formatPhone(provider.phone) : "");
  setFact(".details__listed", formatDate(provider.createdAt));
  setFact(
    ".details__verification",
    provider.verified ? "Marked as verified" : "Not verified"
  );

  setContactLinks(
    pick(".btn--whatsapp"),
    pick(".btn--phone"),
    provider
  );

  if (typeof detailsEl.showModal === "function") {
    detailsEl.showModal();
  } else {
    detailsEl.setAttribute("open", "");
  }
}

searchInput.addEventListener("input", applyFilters);
citySelect.addEventListener("change", applyFilters);

categorySelect.addEventListener("change", () => {
  selectedCategory = categorySelect.value;
  syncChips();
  applyFilters();
});

clearBtn.addEventListener("click", clearFilters);
retryBtn.addEventListener("click", loadProviders);

chipsEl.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;

  selectedCategory = chip.dataset.value;
  syncChips();
  applyFilters();
});

resultsEl.addEventListener("click", (event) => {
  const button = event.target.closest(".card__more");
  if (!button) return;

  const id = button.closest(".card").dataset.id;
  const provider = allProviders.find((p) => p.id === id);
  if (provider) openDetails(provider);
});

detailsEl.addEventListener("click", (event) => {
  if (event.target === detailsEl) detailsEl.close();
});

loadProviders();