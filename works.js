// 여기만 수정하면 HOME과 WORK가 같이 바뀝니다.
// thumbnail: images/파일명.jpg
// video: 클릭 시 이동할 YouTube/Vimeo/상세페이지 주소
// featured: true인 작품만 HOME 슬라이드에 표시됩니다.
const works = [
 {title:"PROJECT 01",type:"BRAND FILM",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:true},
 {title:"PROJECT 02",type:"CAMPAIGN FILM",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:true},
 {title:"PROJECT 03",type:"PROMOTION FILM",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:true},
 {title:"PROJECT 04",type:"BRANDED CONTENT",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:true},
 {title:"PROJECT 05",type:"DIGITAL CAMPAIGN",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:false},
 {title:"PROJECT 06",type:"BRAND FILM",client:"CLIENT",year:"2026",thumbnail:"",video:"",featured:false}
];

const grid=document.querySelector("#work-grid");
if(grid){
 works.forEach(w=>{
  const a=document.createElement("article"); a.className="work-card";
  a.innerHTML=(w.thumbnail?`<img src="${w.thumbnail}" alt="${w.title}">`:`<div class="work-empty">THUMBNAIL</div>`)
   +`<div class="work-meta"><h2>${w.title}</h2><p>${w.type}</p></div>`;
  if(w.video)a.onclick=()=>window.open(w.video,"_blank");
  grid.appendChild(a);
 });
}

const slider=document.querySelector("#home-slider");
if(slider){
 const featured=works.filter(w=>w.featured);
 featured.forEach((w,i)=>{
  const s=document.createElement("div"); s.className="slide"+(i===0?" active":"")+(w.thumbnail?"":" empty");
  s.innerHTML=(w.thumbnail?`<img src="${w.thumbnail}" alt="${w.title}">`:`<span>ADD FEATURED THUMBNAIL</span>`)
   +`<div class="slide-info"><h2>${w.title}</h2><p>${w.type} · ${w.year}</p></div>`;
  if(w.video)s.onclick=()=>window.open(w.video,"_blank");
  slider.appendChild(s);
 });
 let current=0; const slides=[...slider.querySelectorAll(".slide")];
 if(slides.length>1)setInterval(()=>{slides[current].classList.remove("active");current=(current+1)%slides.length;slides[current].classList.add("active")},4500);
}
