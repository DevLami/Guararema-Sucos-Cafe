// menu.js — cardápio interativo, alimentado por dados/cardapio.json.
// Padrão ARIA de abas (tablist), navegação por teclado, filtro e animação de entrada.

const DATA_SRC = 'dados/cardapio.json';

/* ---------- helpers de texto/filtro ---------- */

// normaliza para busca sem acento e sem caixa
function normalize(str) {
  return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

function itemMatches(item, q) {
  if (!q) return true;
  return normalize(`${item.n} ${item.d || ''}`).includes(q);
}

// devolve uma cópia da categoria só com os itens que batem com a busca
function filterCategory(cat, q) {
  if (!q) return cat;
  if (cat.groups) {
    const groups = cat.groups
      .map((g) => ({ ...g, items: g.items.filter((it) => itemMatches(it, q)) }))
      .filter((g) => g.items.length);
    return { ...cat, groups };
  }
  return { ...cat, items: cat.items.filter((it) => itemMatches(it, q)) };
}

function categoryIsEmpty(cat) {
  if (cat.groups) return cat.groups.length === 0;
  return cat.items.length === 0;
}

/* ---------- helpers de HTML ---------- */

function itemHTML(item, i) {
  const desc = item.d ? `<div class="menu-item-desc">${item.d}</div>` : '';
  const badge = item.featured ? '<span class="badge">Suco da casa</span>' : '';
  return `<div class="menu-item${item.featured ? ' featured' : ''}" style="--i:${Math.min(i, 22)}">
            <span class="menu-item-name">${item.n}</span> ${badge}
            <span class="menu-item-leader"></span>
            <span class="menu-item-price">${item.p}</span>
            ${desc}
          </div>`;
}

function groupHTML(group, startIndex) {
  const gnote = group.note ? `<div class="menu-group-note">${group.note}</div>` : '';
  const items = group.items.map((it, k) => itemHTML(it, startIndex + k)).join('');
  return `<div class="menu-group">
            <h3 class="menu-group-title" style="--i:${Math.min(startIndex, 22)}">${group.title}</h3>
            ${gnote}
            ${items}
          </div>`;
}

function categoryHTML(cat) {
  if (categoryIsEmpty(cat)) {
    return '<p class="menu-empty">Nenhum item encontrado para essa busca.</p>';
  }
  if (cat.groups) {
    let idx = 0;
    return cat.groups.map((g) => {
      const html = groupHTML(g, idx);
      idx += g.items.length + 1;
      return html;
    }).join('');
  }
  return cat.items.map((it, i) => itemHTML(it, i)).join('');
}

/* ---------- componente ---------- */

export async function initMenu() {
  const tabsEl = document.getElementById('menuTabs');
  const listEl = document.getElementById('menuList');
  const noteEl = document.getElementById('menuNote');
  const panelEl = document.getElementById('menuPanel');
  const filterEl = document.getElementById('menuFilter');
  if (!tabsEl || !listEl) return;

  let MENU;
  try {
    const res = await fetch(DATA_SRC);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    MENU = await res.json();
  } catch (err) {
    console.error('Não foi possível carregar o cardápio:', err);
    listEl.innerHTML = '<p class="menu-empty">Não foi possível carregar o cardápio no momento.</p>';
    return;
  }

  const state = { key: MENU[0].key, query: '' };

  /* --- render do painel --- */
  function renderPanel({ animate }) {
    const cat = filterCategory(MENU.find((c) => c.key === state.key), state.query);
    if (noteEl) {
      if (cat.note && !categoryIsEmpty(cat)) { noteEl.textContent = cat.note; noteEl.hidden = false; }
      else { noteEl.hidden = true; }
    }
    listEl.classList.toggle('animate', animate);
    listEl.innerHTML = categoryHTML(cat);
  }

  /* --- abas (tablist) --- */
  function buildTabs() {
    tabsEl.setAttribute('role', 'tablist');
    tabsEl.setAttribute('aria-label', 'Categorias do cardápio');
    tabsEl.innerHTML = MENU.map((cat, i) => {
      const selected = cat.key === state.key;
      return `<button class="menu-tab${selected ? ' active' : ''}" role="tab"
                id="tab-${cat.key}" aria-controls="menuPanel"
                aria-selected="${selected}" tabindex="${selected ? 0 : -1}"
                data-key="${cat.key}">${cat.label}</button>`;
    }).join('');
    if (panelEl) panelEl.setAttribute('aria-labelledby', `tab-${state.key}`);
  }

  function tabButtons() {
    return [...tabsEl.querySelectorAll('.menu-tab')];
  }

  function selectTab(key, { focus = false } = {}) {
    state.key = key;
    tabButtons().forEach((btn) => {
      const on = btn.dataset.key === key;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', String(on));
      btn.tabIndex = on ? 0 : -1;
      if (on && focus) btn.focus();
    });
    if (panelEl) panelEl.setAttribute('aria-labelledby', `tab-${key}`);
    renderPanel({ animate: true });
  }

  /* --- navegação por teclado nas abas --- */
  function onTabsKeydown(e) {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const btns = tabButtons();
    const current = btns.findIndex((b) => b.dataset.key === state.key);
    let next = current;
    if (e.key === 'ArrowRight') next = (current + 1) % btns.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + btns.length) % btns.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = btns.length - 1;
    selectTab(btns[next].dataset.key, { focus: true });
  }

  /* --- filtro --- */
  function onFilterInput(e) {
    state.query = normalize(e.target.value.trim());
    renderPanel({ animate: false });
  }

  /* --- ligações --- */
  tabsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (btn) selectTab(btn.dataset.key, { focus: false });
  });
  tabsEl.addEventListener('keydown', onTabsKeydown);
  if (filterEl) filterEl.addEventListener('input', onFilterInput);

  buildTabs();
  renderPanel({ animate: true });
}
