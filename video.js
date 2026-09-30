// 랜딩페이지 대표작은 여기만 수정하면 됩니다.
// thumbnail: 이미지 경로 또는 URL / video: 클릭 시 이동할 영상 URL
const landingWorks = [
  { title: "PROJECT 01", type: "COMMERCIAL", thumbnail: "", video: "" },
  { title: "PROJECT 02", type: "BRAND FILM", thumbnail: "", video: "" },
  { title: "PROJECT 03", type: "CORPORATE FILM", thumbnail: "", video: "" },
  { title: "PROJECT 04", type: "COMMERCIAL", thumbnail: "", video: "" },
  { title: "PROJECT 05", type: "DIGITAL CONTENT", thumbnail: "", video: "" },
  { title: "PROJECT 06", type: "BRAND FILM", thumbnail: "", video: "" }
];

const grid = document.querySelector("#landing-work-grid");
landingWorks.forEach((work) => {
  const card = document.createElement(work.video ? "a" : "article");
  card.className = "landing-work-card";
  if (work.video) { card.href = work.video; card.target = "_blank"; card.rel = "noopener"; }
  card.innerHTML = `${work.thumbnail ? `<img src="${work.thumbnail}" alt="${work.title}">` : `<div class="placeholder">ADD PROJECT THUMBNAIL</div>`}<div class="landing-work-meta"><h3>${work.title}</h3><p>${work.type}</p></div>`;
  grid.appendChild(card);
});

const params = new URLSearchParams(location.search);
if (params.get("sent") === "true") {
  const form = document.querySelector(".inquiry form");
  form.innerHTML = `<div class="wide" style="min-height:360px;display:flex;flex-direction:column;justify-content:center;border-top:1px solid rgba(255,255,255,.5);border-bottom:1px solid rgba(255,255,255,.5)"><p style="font-size:12px;letter-spacing:.12em">INQUIRY SENT</p><h3 style="font-size:clamp(40px,5vw,72px);line-height:.95;letter-spacing:-.04em;margin:15px 0">THANK YOU.<br>WE'LL GET BACK<br>TO YOU SOON.</h3></div>`;
}
