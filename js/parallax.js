// parallax.js — desloca o fundo de natureza conforme o scroll.
// Só recalcula quando a seção está visível (economia quando fora da tela).

import { prefersReduced, observeVisibility, rafThrottle } from './utils.js';

export function initParallax() {
  const section = document.querySelector('.parallax-nature');
  const bg = document.getElementById('parallaxBg');
  if (!section || !bg) return;

  let visible = false;

  function update() {
    const rect = section.getBoundingClientRect();
    const center = rect.top + rect.height / 2 - window.innerHeight / 2;
    const shift = prefersReduced ? 0 : center * -0.16;
    bg.style.transform = `translateY(${shift.toFixed(1)}px)`;
  }

  const onScroll = rafThrottle(() => {
    if (visible) update();
  });

  observeVisibility(section, {
    onEnter: () => { visible = true; update(); },
    onLeave: () => { visible = false; },
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
}
