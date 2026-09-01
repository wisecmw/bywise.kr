// 작품 추가/수정은 아래 목록만 편집하면 됩니다.
// thumbnail: 이미지 파일명 (예: "images/project01.jpg")
// video: 유튜브/비메오 주소 또는 상세 페이지 연결 주소
const works = [
  { title: "PROJECT 01", client: "CLIENT", year: "2026", thumbnail: "", video: "" },
  { title: "PROJECT 02", client: "CLIENT", year: "2026", thumbnail: "", video: "" },
  { title: "PROJECT 03", client: "CLIENT", year: "2026", thumbnail: "", video: "" },
  { title: "PROJECT 04", client: "CLIENT", year: "2026", thumbnail: "", video: "" },
  { title: "PROJECT 05", client: "CLIENT", year: "2026", thumbnail: "", video: "" },
  { title: "PROJECT 06", client: "CLIENT", year: "2026", thumbnail: "", video: "" }
];

const grid = document.querySelector("#work-grid");
works.forEach(work => {
  const card = document.createElement("article");
  card.className = "work-card";
  const visual = work.thumbnail
    ? `<img src="${work.thumbnail}" alt="${work.title}">`
    : `<div class="thumb-empty">THUMBNAIL</div>`;
  card.innerHTML = `
    <div class="thumb">${visual}</div>
    <div class="meta">
      <div><strong>${work.title}</strong><br>${work.client}</div>
      <span>${work.year}</span>
    </div>`;
  if (work.video) card.addEventListener("click", () => window.open(work.video, "_blank"));
  grid.appendChild(card);
});
