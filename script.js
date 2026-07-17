document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.querySelector('.preloader');
  window.addEventListener('load', () => setTimeout(() => preloader.classList.add('loaded'), 450));

  const header = document.querySelector('.header');
  const toTop = document.querySelector('.to-top');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 30);
    toTop.classList.toggle('visible', window.scrollY > 650);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  const toggle = document.querySelector('.menu-toggle');
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav a').forEach(link => link.addEventListener('click', () => header.classList.remove('open')));

  const slides = [...document.querySelectorAll('.testimonial')];
  const index = document.querySelector('.slider-controls b');
  let current = 0;
  const showSlide = next => { slides[current].classList.remove('active'); current = (next + slides.length) % slides.length; slides[current].classList.add('active'); index.textContent = String(current + 1).padStart(2, '0'); };
  document.querySelector('.slider-next').addEventListener('click', () => showSlide(current + 1));
  document.querySelector('.slider-prev').addEventListener('click', () => showSlide(current - 1));
  setInterval(() => showSlide(current + 1), 6500);
});
