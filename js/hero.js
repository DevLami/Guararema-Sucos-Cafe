// hero.js — copo interativo do hero.
// Carrega o SVG externo (imagens/copo.svg), enche o líquido conforme o scroll
// e pausa o loop de animação quando o hero não está visível ou a aba está oculta.

import { prefersReduced, clamp, observeVisibility } from './utils.js';

const CUP_SRC = 'imagens/copo.svg';
const EMPTY_Y = 452; // nível do líquido quando vazio
const FULL_Y = 148;  // nível do líquido quando cheio (perto da boca)

// Carrega o SVG do copo e injeta inline no palco (para o JS poder animá-lo).
async function loadCup(stage) {
  try {
    const res = await fetch(CUP_SRC);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const svgText = await res.text();
    stage.insertAdjacentHTML('afterbegin', svgText);
    return stage.querySelector('.cup-svg');
  } catch (err) {
    console.error('Não foi possível carregar o copo:', err);
    return null;
  }
}

// Gera o atributo "d" da onda do líquido para um nível y (função pura).
function buildWavePath(y, t, amp) {
  const segments = 8;
  const width = 320;
  let d = `M0,480 L0,${y.toFixed(1)} `;
  for (let i = 0; i <= segments; i++) {
    const x = (width / segments) * i;
    const yy = y + Math.sin((i / segments) * Math.PI * 2 + t) * amp;
    d += `L${x.toFixed(1)},${yy.toFixed(1)} `;
  }
  return d + `L${width},480 Z`;
}

export async function initHero() {
  const heroScroll = document.querySelector('.hero-scroll');
  const stage = document.querySelector('.cup-stage');
  const fillReadout = document.getElementById('fillReadout');
  const scrollCue = document.getElementById('scrollCue');
  if (!heroScroll || !stage) return;

  const cupSvg = await loadCup(stage);
  const liquidPath = document.getElementById('liquidPath');
  const liquidClipPath = document.getElementById('liquidClipPath');
  if (!liquidPath || !liquidClipPath) return; // copo não carregou

  let targetFill = 0;
  let currentY = EMPTY_Y;
  let t = 0;

  // --- progresso do scroll -> nível alvo ---
  function computeProgress() {
    const rect = heroScroll.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const p = clamp(total > 0 ? -rect.top / total : 0, 0, 1);
    targetFill = p;
    if (fillReadout) fillReadout.textContent = Math.round(p * 100) + '%';
    if (scrollCue) scrollCue.classList.toggle('hide', p > 0.06);
  }

  // --- desenho de um quadro ---
  function drawFrame() {
    const targetY = EMPTY_Y - targetFill * (EMPTY_Y - FULL_Y);
    currentY += (targetY - currentY) * 0.08;
    if (!prefersReduced) t += 0.03;
    const d = buildWavePath(currentY, t, prefersReduced ? 0 : 5);
    liquidPath.setAttribute('d', d);
    liquidClipPath.setAttribute('d', d);
  }

  // --- loop com controle de play/pause ---
  let rafId = null;
  function loop() {
    drawFrame();
    rafId = requestAnimationFrame(loop);
  }
  function start() {
    if (rafId == null) rafId = requestAnimationFrame(loop);
    if (cupSvg) cupSvg.parentElement.classList.remove('anim-paused');
  }
  function stop() {
    if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
    if (cupSvg) cupSvg.parentElement.classList.add('anim-paused');
  }

  // pausa quando o hero sai da tela
  let onScreen = true;
  observeVisibility(heroScroll, {
    onEnter: () => { onScreen = true; start(); },
    onLeave: () => { onScreen = false; stop(); },
  });

  // pausa quando a aba fica em segundo plano
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !onScreen) stop();
    else start();
  });

  window.addEventListener('scroll', computeProgress, { passive: true });
  window.addEventListener('resize', computeProgress);
  computeProgress();
  start();
}
