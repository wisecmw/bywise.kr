import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const configured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");

const supabase = configured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const escapeHTML = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

async function loadProjectsFromText() {
  try {
    const res = await fetch("projects.txt?v=" + Date.now());
    const text = await res.text();

    return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#"))
      .map((line, i) => {
        const parts = line.split("|").map(v => v.trim());
        return {
          id: "text-" + i,
          title: parts[0] || "",
          type: parts[1] || "",
          thumbnail_url: parts[2] ? "images/" + parts[2] : "",
          video_url: parts[3] || "",
          featured: (parts[4] || "").toLowerCase() === "home",
          sort_order: i
        };
      });
  } catch {
    return [];
  }
}

async function loadProjects() {
  if (!supabase) return loadProjectsFromText();

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return loadProjectsFromText();
  }

  return data || [];
}

function openProject(url) {
  if (url) window.open(url, "_blank", "noopener");
}

function normalizeType(type = "") {
  return String(type).trim().toUpperCase();
}

function projectImage(project) {
  return project.thumbnail_url
    ? `<img src="${escapeHTML(project.thumbnail_url)}" alt="${escapeHTML(project.title)}" loading="lazy">`
    : `<div class="work-empty">THUMBNAIL</div>`;
}

function attachProjectOpen(element, project) {
  if (!project.video_url) return;
  element.tabIndex = 0;
  element.setAttribute("role", "link");
  element.addEventListener("click", () => openProject(project.video_url));
  element.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProject(project.video_url);
    }
  });
}

async function renderHomeHero(projects) {
  const slider = document.querySelector("#home-slider");
  if (!slider) return;

  let featured = projects.filter(project => project.featured);
  if (!featured.length) featured = projects.slice(0, 4);
  featured = featured.slice(0, 6);

  if (!featured.length) {
    slider.innerHTML = `<div class="slide active"><div class="work-empty">ADD FEATURED WORK</div></div>`;
    return;
  }

  slider.innerHTML = "";

  featured.forEach((project, index) => {
    const slide = document.createElement("article");
    slide.className = `slide${index === 0 ? " active" : ""}`;
    slide.innerHTML = `
      ${projectImage(project)}
      <div class="slide-info">
        <div class="slide-copy">
          <h2>${escapeHTML(project.title)}</h2>
          <p>${escapeHTML(normalizeType(project.type))}</p>
        </div>
        <span class="slide-number">${String(index + 1).padStart(2,"0")} / ${String(featured.length).padStart(2,"0")}</span>
      </div>
    `;
    attachProjectOpen(slide, project);
    slider.appendChild(slide);
  });

  const slides = [...slider.querySelectorAll(".slide")];
  if (slides.length > 1) {
    let current = 0;
    window.setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 4500);
  }
}

async function renderHomeGrid(projects) {
  const grid = document.querySelector("#home-work-grid");
  if (!grid) return;

  const selected = projects.slice(0, 6);
  grid.innerHTML = "";

  selected.forEach((project, index) => {
    const card = document.createElement("article");
    card.className = "home-work-card";
    card.innerHTML = `
      ${projectImage(project)}
      <div class="home-card-meta">
        <div>
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(normalizeType(project.type))}</p>
        </div>
        <span>${String(index + 1).padStart(2,"0")} ↗</span>
      </div>
    `;
    attachProjectOpen(card, project);
    grid.appendChild(card);
  });
}

function makeFilterLabel(type) {
  const value = normalizeType(type);
  if (value.includes("COMMERCIAL")) return "COMMERCIAL";
  if (value.includes("BRAND")) return "BRAND";
  if (value.includes("DIGITAL")) return "DIGITAL";
  return value || "ETC";
}

async function renderWork(projects) {
  const grid = document.querySelector("#work-grid");
  const filterWrap = document.querySelector("#work-filters");
  const count = document.querySelector("#work-count");
  if (!grid) return;

  const typeMap = new Map();
  projects.forEach(project => {
    const key = normalizeType(project.type) || "ETC";
    if (!typeMap.has(key)) typeMap.set(key, makeFilterLabel(project.type));
  });

  const filters = [
    { key: "ALL", label: "ALL" },
    ...[...typeMap.entries()].map(([key, label]) => ({ key, label }))
  ];

  if (filterWrap) {
    filterWrap.innerHTML = filters.map((filter, index) => `
      <button class="filter-button${index === 0 ? " active" : ""}" type="button" data-filter="${escapeHTML(filter.key)}">
        ${escapeHTML(filter.label)}
      </button>
    `).join("");
  }

  const draw = filterKey => {
    const visible = filterKey === "ALL"
      ? projects
      : projects.filter(project => (normalizeType(project.type) || "ETC") === filterKey);

    if (count) count.textContent = `${String(visible.length).padStart(2,"0")} PROJECTS`;
    grid.innerHTML = "";

    visible.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "work-card";
      card.innerHTML = `
        ${projectImage(project)}
        <div class="work-meta">
          <div>
            <h2>${escapeHTML(project.title)}</h2>
            <p>${escapeHTML(normalizeType(project.type))}</p>
          </div>
          <span class="work-card-index">${String(index + 1).padStart(2,"0")} ↗</span>
        </div>
      `;
      attachProjectOpen(card, project);
      grid.appendChild(card);
    });
  };

  draw("ALL");

  if (filterWrap) {
    filterWrap.addEventListener("click", event => {
      const button = event.target.closest(".filter-button");
      if (!button) return;
      filterWrap.querySelectorAll(".filter-button").forEach(item => item.classList.remove("active"));
      button.classList.add("active");
      draw(button.dataset.filter || "ALL");
    });
  }

  const queryFilter = new URLSearchParams(window.location.search).get("type");
  if (queryFilter && filterWrap) {
    const normalized = normalizeType(queryFilter);
    const target = [...filterWrap.querySelectorAll(".filter-button")]
      .find(button => button.dataset.filter === normalized);
    if (target) target.click();
  }
}

function setupServiceLinks() {
  document.querySelectorAll("[data-filter-link]").forEach(link => {
    const type = link.getAttribute("data-filter-link");
    link.href = `work.html?type=${encodeURIComponent(type)}`;
  });
}

function setupReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  elements.forEach(el => observer.observe(el));
}

const projects = await loadProjects();
await Promise.all([
  renderHomeHero(projects),
  renderHomeGrid(projects),
  renderWork(projects)
]);
setupServiceLinks();
setupReveal();
