// animations.js — revela elementos .reveal conforme entram na viewport

export function initAnimations() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;

  // Sem suporte a IntersectionObserver: mostra tudo de uma vez.
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  els.forEach((el) => io.observe(el));
}
