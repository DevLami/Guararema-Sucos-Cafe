// hero.js — copo interativo do hero: enche o líquido conforme o scroll

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EMPTY_Y = 452; // nível do líquido quando vazio
const FULL_Y = 148;  // nível do líquido quando cheio (perto da boca)

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

export function initHero() {
  const heroScroll = document.querySelector('.hero-scroll');
  const liquidPath = document.getElementById('liquidPath');
  const liquidClipPath = document.getElementById('liquidClipPath');
  const fillReadout = document.getElementById('fillReadout');
  const scrollCue = document.getElementById('scrollCue');
  if (!heroScroll || !liquidPath || !liquidClipPath) return;

  let targetFill = 0;
  let currentY = EMPTY_Y;
  let t = 0;

  function computeProgress() {
    const rect = heroScroll.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const scrolled = -rect.top;
    const p = clamp(total > 0 ? scrolled / total : 0, 0, 1);
    targetFill = p;
    if (fillReadout) fillReadout.textContent = Math.round(p * 100) + '%';
    if (scrollCue) scrollCue.classList.toggle('hide', p > 0.06);
  }

  function drawWave(y) {
    const amp = prefersReduced ? 0 : 5;
    const segments = 8;
    const width = 320;
    let d = `M0,480 L0,${y.toFixed(1)} `;
    for (let i = 0; i <= segments; i++) {
      const x = (width / segments) * i;
      const yy = y + Math.sin((i / segments) * Math.PI * 2 + t) * amp;
      d += `L${x.toFixed(1)},${yy.toFixed(1)} `;
    }
    d += `L${width},480 Z`;
    liquidPath.setAttribute('d', d);
    liquidClipPath.setAttribute('d', d);
  }

  function tick() {
    const targetY = EMPTY_Y - targetFill * (EMPTY_Y - FULL_Y);
    currentY += (targetY - currentY) * 0.08;
    if (!prefersReduced) t += 0.03;
    drawWave(currentY);
    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', computeProgress, { passive: true });
  window.addEventListener('resize', computeProgress);
  computeProgress();
  tick();
}
