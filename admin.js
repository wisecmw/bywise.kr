import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js?v=10";

const $ = (id) => document.getElementById(id);
console.log("WISE ADMIN JS LOADED");

const loginStatus = document.getElementById("login-status");

if (loginStatus) {
  loginStatus.textContent = "ADMIN READY";
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);


/* =========================
   LOGIN STATE
========================= */

async function refreshUI() {

  const {
    data: { session }
  } = await supabase.auth.getSession();

  const loggedIn = !!session;

  $("login-card").classList.toggle("hidden", loggedIn);
  $("editor-card").classList.toggle("hidden", !loggedIn);
  $("list-card").classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    loadList();
  }
}


/* =========================
   LOGIN
========================= */

$("login-btn").onclick = async () => {

  const email = $("login-email").value.trim();
  const password = $("login-password").value;

  if (!email || !password) {
    $("login-status").textContent =
      "이메일과 비밀번호를 입력해주세요.";
    return;
  }

  $("login-status").textContent = "로그인 중...";

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password
    });

  if (error) {
    console.error(error);
    $("login-status").textContent =
      "로그인 실패: " + error.message;
    return;
  }

  $("login-status").textContent = "";

  await refreshUI();
};


/* ENTER로 로그인 */

$("login-password").addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {
      $("login-btn").click();
    }

  }
);


/* =========================
   LOGOUT
========================= */

$("logout-btn").onclick = async () => {

  await supabase.auth.signOut();

  await refreshUI();

};


/* =========================
   ORDER 밀기
========================= */

async function shiftOrdersFrom(startOrder) {

  const { data, error } = await supabase
    .from("projects")
    .select("id, sort_order")
    .gte("sort_order", startOrder)
    .order("sort_order", {
      ascending: false
    });

  if (error) {
    throw error;
  }

  for (const project of data || []) {

    const currentOrder =
      Number(project.sort_order || 0);

    const { error: updateError } =
      await supabase
        .from("projects")
        .update({
          sort_order: currentOrder + 1
        })
        .eq("id", project.id);

    if (updateError) {
      throw updateError;
    }

  }
}


/* =========================
   PROJECT UPLOAD
========================= */

$("upload-btn").onclick = async () => {

  const title =
    $("title").value.trim();

  const type =
    $("type").value.trim();

  const video =
    $("video").value.trim();

  const rawSort =
    Number($("sort").value);

  const sort =
    Number.isFinite(rawSort) &&
    rawSort >= 0
      ? Math.floor(rawSort)
      : 0;

  const featured =
    $("featured").value === "true";

  const file =
    $("thumb").files[0];


  if (!title || !file) {

    $("upload-status").textContent =
      "프로젝트명과 썸네일 이미지는 필수입니다.";

    return;
  }


  $("upload-status").textContent =
    "업로드 중...";


  try {

    /* 기존 ORDER 뒤로 밀기 */

    await shiftOrdersFrom(sort);


    /* 파일명 생성 */

    const safeName =
      `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;


    /* 썸네일 업로드 */

    const { error: uploadError } =
      await supabase.storage
        .from("thumbnails")
        .upload(
          safeName,
          file,
          {
            upsert: false
          }
        );

    if (uploadError) {
      throw uploadError;
    }


    /* 이미지 주소 생성 */

    const { data: publicData } =
      supabase.storage
        .from("thumbnails")
        .getPublicUrl(safeName);

    const thumbnail_url =
      publicData.publicUrl;


    /* 프로젝트 등록 */

    const { error: insertError } =
      await supabase
        .from("projects")
        .insert({
          title,
          type,
          video_url: video,
          thumbnail_url,
          featured,
          sort_order: sort,
          storage_path: safeName
        });


    if (insertError) {

      await supabase.storage
        .from("thumbnails")
        .remove([safeName]);

      throw insertError;
    }


    $("upload-status").textContent =
      `등록 완료. ORDER ${sort} 위치에 추가했습니다.`;


    $("title").value = "";
    $("type").value = "";
    $("video").value = "";
    $("thumb").value = "";
    $("sort").value = "0";


    await loadList();

  }

  catch (error) {

    console.error(error);

    $("upload-status").textContent =
      error.message ||
      "등록 중 오류가 발생했습니다.";

  }

};


/* =========================
   PROJECT LIST
========================= */

async function loadList() {

  const { data, error } =
    await supabase
      .from("projects")
      .select("*")
      .order(
        "sort_order",
        { ascending: true }
      )
      .order(
        "created_at",
        { ascending: false }
      );


  const wrap =
    $("admin-list");

  wrap.innerHTML = "";


  if (error) {

    console.error(error);

    wrap.textContent =
      error.message;

    return;
  }


  (data || []).forEach((p) => {

    const item =
      document.createElement("div");

    item.className =
      "admin-item";


    item.innerHTML = `

      <img
        src="${p.thumbnail_url || ""}"
        alt=""
      >

      <div>

        <h3>
          ${p.title}
        </h3>

        <p>
          ORDER ${p.sort_order ?? 0}
          · ${p.type || ""}
          ·
          ${
            p.featured
              ? "HOME + WORK"
              : "WORK ONLY"
          }
        </p>

      </div>

      <button type="button">
        DELETE
      </button>

    `;


    /* =========================
       DELETE
    ========================= */

    item
      .querySelector("button")
      .onclick = async () => {

        if (
          !confirm(
            `"${p.title}" 프로젝트를 삭제할까요?`
          )
        ) {
          return;
        }


        const deletedOrder =
          Number(p.sort_order || 0);


        /* DB 삭제 */

        const { error: delError } =
          await supabase
            .from("projects")
            .delete()
            .eq("id", p.id);


        if (delError) {

          alert(delError.message);

          return;
        }


        /* 썸네일 삭제 */

        if (p.storage_path) {

          await supabase.storage
            .from("thumbnails")
            .remove([
              p.storage_path
            ]);

        }


        /* 삭제한 ORDER 뒤 프로젝트 검색 */

        const {
          data: laterProjects,
          error: orderError
        } =
          await supabase
            .from("projects")
            .select(
              "id, sort_order"
            )
            .gt(
              "sort_order",
              deletedOrder
            )
            .order(
              "sort_order",
              {
                ascending: true
              }
            );


        if (orderError) {

          alert(
            orderError.message
          );

          await loadList();

          return;
        }


        /* ORDER 한 칸씩 당기기 */

        for (
          const project
          of laterProjects || []
        ) {

          const currentOrder =
            Number(
              project.sort_order || 0
            );


          const {
            error: updateError
          } =
            await supabase
              .from("projects")
              .update({
                sort_order:
                  currentOrder - 1
              })
              .eq(
                "id",
                project.id
              );


          if (updateError) {

            alert(
              updateError.message
            );

            break;
          }

        }


        await loadList();

      };


    wrap.appendChild(item);

  });

}


/* =========================
   AUTH CHANGE
========================= */

supabase.auth.onAuthStateChange(
  () => {

    refreshUI();

  }
);


/* =========================
   START
========================= */

refreshUI();
