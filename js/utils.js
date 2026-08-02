// utils.js — funções utilitárias compartilhadas entre os módulos

export const prefersReduced =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Observa um elemento e dispara callbacks quando ele entra/sai da viewport.
 * Usado para pausar animações e trabalho de scroll quando nada está visível.
 * Retorna uma função para desconectar o observer.
 */
export function observeVisibility(el, { onEnter, onLeave, threshold = 0 } = {}) {
  if (!el || !('IntersectionObserver' in window)) {
    onEnter?.();
    return () => {};
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) onEnter?.();
      else onLeave?.();
    }
  }, { threshold });
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Envolve um handler de scroll/resize para rodar no máximo uma vez por frame.
 */
export function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn(...args);
      ticking = false;
    });
  };
}
