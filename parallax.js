// parallax.js — desloca o fundo de natureza conforme o scroll

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initParallax() {
  const section = document.querySelector('.parallax-nature');
  const bg = document.getElementById('parallaxBg');
  if (!section || !bg) return;

  let ticking = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift = prefersReduced ? 0 : center * -0.16;
    bg.style.transform = `translateY(${shift.toFixed(1)}px)`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}
