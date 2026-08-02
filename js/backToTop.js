// backToTop.js — botão "voltar ao topo" que aparece após rolar a página

import { prefersReduced, rafThrottle } from './utils.js';

export function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const SHOW_AT = 600; // px de scroll para exibir

  const onScroll = rafThrottle(() => {
    btn.classList.toggle('show', window.scrollY > SHOW_AT);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
