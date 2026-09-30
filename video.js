// ================================
// 포트폴리오는 이 파일만 수정하면 됩니다.
// thumbnail : 썸네일 이미지 경로/URL
// video     : 클릭했을 때 열 영상 URL
// title     : 프로젝트명
// ================================
const portfolio = [
  {
    category: "BRAND FILM", title: "브랜드 필름",
    description: "브랜드가 가진 가치와 이야기를 한 편의 영상으로 설계합니다.",
    works: [
      { title: "PROJECT 01", thumbnail: "", video: "" },
      { title: "PROJECT 02", thumbnail: "", video: "" },
      { title: "PROJECT 03", thumbnail: "", video: "" }
    ]
  },
  {
    category: "COMMERCIAL", title: "광고 영상",
    description: "제품과 서비스의 핵심을 짧고 강하게 전달하는 광고 영상을 제작합니다.",
    works: [
      { title: "PROJECT 01", thumbnail: "", video: "" },
      { title: "PROJECT 02", thumbnail: "", video: "" },
      { title: "PROJECT 03", thumbnail: "", video: "" }
    ]
  },
  {
    category: "SKETCH FILM", title: "스케치 영상",
    description: "행사와 현장의 분위기를 놓치지 않고, 다시 보고 싶은 콘텐츠로 만듭니다.",
    works: [
      { title: "PROJECT 01", thumbnail: "", video: "" },
      { title: "PROJECT 02", thumbnail: "", video: "" },
      { title: "PROJECT 03", thumbnail: "", video: "" }
    ]
  },
  {
    category: "INTERVIEW", title: "인터뷰 영상",
    description: "사람의 이야기와 메시지가 자연스럽게 전달되도록 구성하고 제작합니다.",
    works: [
      { title: "PROJECT 01", thumbnail: "", video: "" },
      { title: "PROJECT 02", thumbnail: "", video: "" },
      { title: "PROJECT 03", thumbnail: "", video: "" }
    ]
  }
];

const root = document.querySelector("#portfolio-sections");
portfolio.forEach((section) => {
  const block = document.createElement("section"); block.className = "portfolio-category";
  const cards = section.works.map((work) => {
    const tag = work.video ? "a" : "article";
    const attrs = work.video ? ` href="${work.video}" target="_blank" rel="noopener"` : "";
    return `<${tag} class="work-card"${attrs}>${work.thumbnail ? `<img src="${work.thumbnail}" alt="${work.title}">` : `<div class="placeholder"><span>ADD VIDEO</span></div>`}<div class="work-meta"><h3>${work.title}</h3><span>VIEW FILM ↗</span></div></${tag}>`;
  }).join("");
  block.innerHTML = `<div class="category-head"><div><p>${section.category}</p><h2>${section.title}</h2></div><p class="category-desc">${section.description}</p></div><div class="work-grid">${cards}</div>`;
  root.appendChild(block);
});

const params = new URLSearchParams(location.search);
if (params.get("sent") === "true") {
  const form = document.querySelector(".inquiry form");
  form.innerHTML = `<div class="wide sent"><p>INQUIRY SENT</p><h3>THANK YOU.<br>WE'LL GET BACK<br>TO YOU SOON.</h3></div>`;
}
