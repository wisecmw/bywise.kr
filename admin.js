import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js?v=10";

const $ = (id) => document.getElementById(id);

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
    await loadList();
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
    $("login-status").textContent =
      "로그인 실패: " + error.message;
    return;
  }

  $("login-status").textContent = "";

  await refreshUI();
};


/* ENTER 로그인 */

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

  if (error) throw error;

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

    if (updateError) throw updateError;
  }
}


/* =========================
   PROJECT UPLOAD
========================= */

$("upload-btn").onclick = async () => {

  const title = $("title").value.trim();
  const type = $("type").value.trim();
  const video = $("video").value.trim();

  const rawSort =
    Number($("sort").value);

  const sort =
    Number.isFinite(rawSort) && rawSort >= 0
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

    await shiftOrdersFrom(sort);


    const safeName =
      `${Date.now()}-${file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      )}`;


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


    const { data: publicData } =
      supabase.storage
        .from("thumbnails")
        .getPublicUrl(safeName);


    const thumbnail_url =
      publicData.publicUrl;


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
    $("featured").value = "true";


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


  const wrap = $("admin-list");

  wrap.innerHTML = "";


  if (error) {

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
          ${p.title || ""}
        </h3>

        <p>
          ORDER ${p.sort_order ?? 0}
          · ${p.type || ""}
          · ${
            p.featured
              ? "HOME + WORK"
              : "WORK ONLY"
          }
        </p>

      </div>

      <div style="
        display:flex;
        gap:8px;
      ">

        <button
          type="button"
          class="edit-btn"
        >
          EDIT
        </button>

        <button
          type="button"
          class="delete-btn"
        >
          DELETE
        </button>

      </div>

    `;


    /* =========================
       EDIT
    ========================= */

    item
      .querySelector(".edit-btn")
      .onclick = () => {

        openEditor(p, item);

      };


    /* =========================
       DELETE
    ========================= */

    item
      .querySelector(".delete-btn")
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


        const { error: delError } =
          await supabase
            .from("projects")
            .delete()
            .eq("id", p.id);


        if (delError) {

          alert(delError.message);

          return;
        }


        if (p.storage_path) {

          await supabase.storage
            .from("thumbnails")
            .remove([
              p.storage_path
            ]);

        }


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
   EDIT WINDOW
========================= */

function openEditor(p, item) {

  item.innerHTML = `

    <div
      style="
        grid-column:1/-1;
        display:grid;
        gap:16px;
        padding:10px 0;
      "
    >

      <label>
        PROJECT TITLE

        <input
          class="edit-title"
          type="text"
          value="${escapeHTML(p.title || "")}"
        >
      </label>


      <label>
        TYPE

        <input
          class="edit-type"
          type="text"
          value="${escapeHTML(p.type || "")}"
        >
      </label>


      <label>
        VIDEO URL

        <input
          class="edit-video"
          type="text"
          value="${escapeHTML(p.video_url || "")}"
        >
      </label>


      <label>
        ORDER

        <input
          class="edit-order"
          type="number"
          min="0"
          value="${p.sort_order ?? 0}"
        >
      </label>


      <label>
        HOME

        <select class="edit-featured">

          <option
            value="true"
            ${p.featured ? "selected" : ""}
          >
            HOME + WORK
          </option>

          <option
            value="false"
            ${!p.featured ? "selected" : ""}
          >
            WORK ONLY
          </option>

        </select>
      </label>


      <label>
        NEW THUMBNAIL
        <span style="
          font-size:10px;
          opacity:.6;
        ">
          선택하지 않으면 기존 이미지 유지
        </span>

        <input
          class="edit-thumb"
          type="file"
          accept="image/*"
        >
      </label>


      <div
        style="
          display:flex;
          gap:10px;
        "
      >

        <button
          type="button"
          class="save-btn"
        >
          SAVE
        </button>

        <button
          type="button"
          class="cancel-btn"
        >
          CANCEL
        </button>

      </div>


      <p
        class="edit-status"
        style="
          margin:0;
          font-size:12px;
        "
      ></p>

    </div>

  `;


  item
    .querySelector(".cancel-btn")
    .onclick = () => {

      loadList();

    };


  item
    .querySelector(".save-btn")
    .onclick = async () => {

      const status =
        item.querySelector(
          ".edit-status"
        );


      const title =
        item
          .querySelector(
            ".edit-title"
          )
          .value
          .trim();


      const type =
        item
          .querySelector(
            ".edit-type"
          )
          .value
          .trim();


      const video =
        item
          .querySelector(
            ".edit-video"
          )
          .value
          .trim();


      const rawOrder =
        Number(
          item
            .querySelector(
              ".edit-order"
            )
            .value
        );


      const order =
        Number.isFinite(rawOrder) &&
        rawOrder >= 0
          ? Math.floor(rawOrder)
          : 0;


      const featured =
        item
          .querySelector(
            ".edit-featured"
          )
          .value === "true";


      const file =
        item
          .querySelector(
            ".edit-thumb"
          )
          .files[0];


      if (!title) {

        status.textContent =
          "프로젝트 제목을 입력해주세요.";

        return;
      }


      status.textContent =
        "저장 중...";


      try {

        let thumbnailURL =
          p.thumbnail_url;

        let storagePath =
          p.storage_path;


        /* 새 썸네일이 있을 경우 */

        if (file) {

          const safeName =
            `${Date.now()}-${file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            )}`;


          const {
            error: uploadError
          } =
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


          const {
            data: publicData
          } =
            supabase.storage
              .from("thumbnails")
              .getPublicUrl(
                safeName
              );


          thumbnailURL =
            publicData.publicUrl;

          storagePath =
            safeName;
        }


        /* DB 수정 */

        const {
          error: updateError
        } =
          await supabase
            .from("projects")
            .update({
              title,
              type,
              video_url: video,
              featured,
              sort_order: order,
              thumbnail_url:
                thumbnailURL,
              storage_path:
                storagePath
            })
            .eq(
              "id",
              p.id
            );


        if (updateError) {
          throw updateError;
        }


        /* 새 썸네일 저장 성공 후
           기존 썸네일 삭제 */

        if (
          file &&
          p.storage_path &&
          p.storage_path !==
            storagePath
        ) {

          await supabase.storage
            .from("thumbnails")
            .remove([
              p.storage_path
            ]);

        }


        status.textContent =
          "수정 완료";


        await loadList();

      }

      catch (error) {

        console.error(error);

        status.textContent =
          "수정 실패: " +
          (
            error.message ||
            "오류가 발생했습니다."
          );

      }

    };

}


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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
