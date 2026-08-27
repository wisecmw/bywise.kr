const menuBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuBtn.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav a').forEach(a => {
  a.addEventListener('click', () => nav.classList.remove('open'));
});

const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const closeBtn = document.querySelector('.modal-close');

document.querySelectorAll('.project').forEach(project => {
  project.addEventListener('click', e => {
    e.preventDefault();
    modalTitle.textContent = project.dataset.title;
    modalCategory.textContent = project.dataset.category;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal(){
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', e => {
  if(e.target === modal) closeModal();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeModal();
});
