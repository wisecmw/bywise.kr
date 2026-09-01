import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const configured =
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes("PASTE_") &&
  !SUPABASE_ANON_KEY.includes("PASTE_");

const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

async function renderWork() {
  const grid = document.querySelector("#work-grid");
  if (!grid) return;

  const works = await loadProjects();
  grid.innerHTML = "";

  works.forEach(w => {
    const card = document.createElement("article");
    card.className = "work-card";
    card.innerHTML =
      (w.thumbnail_url
        ? `<img src="${w.thumbnail_url}" alt="${w.title}">`
        : `<div class="work-empty">THUMBNAIL</div>`) +
      `<div class="work-meta"><h2>${w.title}</h2><p>${w.type || ""}</p></div>`;
    if (w.video_url) card.addEventListener("click", () => openProject(w.video_url));
    grid.appendChild(card);
  });
}

async function renderHome() {
  const slider = document.querySelector("#home-slider");
  if (!slider) return;

  const works = (await loadProjects()).filter(w => w.featured);
  slider.innerHTML = "";

  works.forEach((w, i) => {
    const slide = document.createElement("div");
    slide.className = "slide" + (i === 0 ? " active" : "") + (w.thumbnail_url ? "" : " empty");
    slide.innerHTML =
      (w.thumbnail_url
        ? `<img src="${w.thumbnail_url}" alt="${w.title}">`
        : `<span>ADD FEATURED THUMBNAIL</span>`) +
      `<div class="slide-info"><h2>${w.title}</h2><p>${w.type || ""}</p></div>`;
    if (w.video_url) slide.addEventListener("click", () => openProject(w.video_url));
    slider.appendChild(slide);
  });

  let current = 0;
  const slides = [...slider.querySelectorAll(".slide")];
  if (slides.length > 1) {
    setInterval(() => {
      slides[current].classList.remove("active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("active");
    }, 2500);
  }
}

renderWork();
renderHome();
