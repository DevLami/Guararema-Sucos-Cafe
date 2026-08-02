// main.js — ponto de entrada: inicializa todos os módulos
// Carregado com <script type="module">, então roda depois do DOM montado.

import { initAnimations } from './animations.js';
import { initParallax } from './parallax.js';
import { initHero } from './hero.js';
import { initMenu } from './menu.js';

initAnimations();
initParallax();
initHero();
initMenu();
