import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const $ = id => document.getElementById(id);

if (SUPABASE_URL.includes("PASTE_") || SUPABASE_ANON_KEY.includes("PASTE_")) {
  $("login-status").textContent = "먼저 config.js에 Supabase URL과 ANON KEY를 입력해야 합니다.";
  throw new Error("Supabase not configured");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function refreshUI() {
  const { data: { session } } = await supabase.auth.getSession();
  const loggedIn = !!session;
  $("login-card").classList.toggle("hidden", loggedIn);
  $("editor-card").classList.toggle("hidden", !loggedIn);
  $("list-card").classList.toggle("hidden", !loggedIn);
  if (loggedIn) loadList();
}

$("login-btn").onclick = async () => {
  $("login-status").textContent = "로그인 중...";
  const { error } = await supabase.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-password").value
  });
  $("login-status").textContent = error ? error.message : "";
  if (!error) refreshUI();
};

$("logout-btn").onclick = async () => {
  await supabase.auth.signOut();
  refreshUI();
};

$("upload-btn").onclick = async () => {
  const title = $("title").value.trim();
  const type = $("type").value.trim();
  const video = $("video").value.trim();
  const sort = Number($("sort").value || 0);
  const featured = $("featured").value === "true";
  const file = $("thumb").files[0];

  if (!title || !file) {
    $("upload-status").textContent = "프로젝트명과 썸네일 이미지는 필수입니다.";
    return;
  }

  $("upload-status").textContent = "업로드 중...";

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const { error: uploadError } = await supabase.storage
    .from("thumbnails")
    .upload(safeName, file, { upsert: false });

  if (uploadError) {
    $("upload-status").textContent = uploadError.message;
    return;
  }

  const { data: publicData } = supabase.storage.from("thumbnails").getPublicUrl(safeName);
  const thumbnail_url = publicData.publicUrl;

  const { error: insertError } = await supabase.from("projects").insert({
    title,
    type,
    video_url: video,
    thumbnail_url,
    featured,
    sort_order: sort,
    storage_path: safeName
  });

  if (insertError) {
    $("upload-status").textContent = insertError.message;
    return;
  }

  $("upload-status").textContent = "등록 완료.";
  ["title","type","video"].forEach(id => $(id).value = "");
  $("thumb").value = "";
  $("sort").value = "0";
  loadList();
};

async function loadList() {
  const { data, error } = await supabase.from("projects").select("*")
    .order("sort_order", {ascending:true}).order("created_at",{ascending:false});

  const wrap = $("admin-list");
  wrap.innerHTML = "";
  if (error) {
    wrap.textContent = error.message;
    return;
  }

  (data || []).forEach(p => {
    const item = document.createElement("div");
    item.className = "admin-item";
    item.innerHTML = `
      <img src="${p.thumbnail_url || ""}" alt="">
      <div><h3>${p.title}</h3><p>${p.type || ""} · ${p.featured ? "HOME + WORK" : "WORK ONLY"}</p></div>
      <button>DELETE</button>`;
    item.querySelector("button").onclick = async () => {
      if (!confirm(`"${p.title}" 프로젝트를 삭제할까요?`)) return;
      const { error: delError } = await supabase.from("projects").delete().eq("id", p.id);
      if (delError) return alert(delError.message);
      if (p.storage_path) await supabase.storage.from("thumbnails").remove([p.storage_path]);
      loadList();
    };
    wrap.appendChild(item);
  });
}

supabase.auth.onAuthStateChange(() => refreshUI());
refreshUI();
