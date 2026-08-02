// animations.js — revela elementos .reveal conforme entram na viewport

export function initAnimations() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;

  // Se o navegador não suportar IntersectionObserver, mostra tudo de uma vez.
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
}
