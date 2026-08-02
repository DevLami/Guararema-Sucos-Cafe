// menu.js — cardápio interativo (abas + lista), alimentado por dados/cardapio.json

function itemHTML(item) {
  const desc = item.d ? `<div class="menu-item-desc">${item.d}</div>` : '';
  const badge = item.featured ? '<span class="badge">Suco da casa</span>' : '';
  return `<div class="menu-item${item.featured ? ' featured' : ''}">
            <span class="menu-item-name">${item.n}</span> ${badge}
            <span class="menu-item-leader"></span>
            <span class="menu-item-price">${item.p}</span>
            ${desc}
          </div>`;
}

function render(MENU, els, key) {
  const cat = MENU.find(c => c.key === key) || MENU[0];

  els.tabs.querySelectorAll('.menu-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.key === cat.key);
  });

  if (cat.note) { els.note.textContent = cat.note; els.note.hidden = false; }
  else { els.note.hidden = true; }

  if (cat.groups) {
    els.list.innerHTML = cat.groups.map(g => {
      const gnote = g.note ? `<div class="menu-group-note">${g.note}</div>` : '';
      return `<div class="menu-group">
                <h3 class="menu-group-title">${g.title}</h3>
                ${gnote}
                ${g.items.map(itemHTML).join('')}
              </div>`;
    }).join('');
  } else {
    els.list.innerHTML = cat.items.map(itemHTML).join('');
  }
}

export async function initMenu() {
  const els = {
    tabs: document.getElementById('menuTabs'),
    list: document.getElementById('menuList'),
    note: document.getElementById('menuNote'),
  };
  if (!els.tabs || !els.list) return;

  let MENU;
  try {
    const res = await fetch('dados/cardapio.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    MENU = await res.json();
  } catch (err) {
    console.error('Não foi possível carregar o cardápio:', err);
    els.list.innerHTML = '<p class="menu-note">Não foi possível carregar o cardápio no momento.</p>';
    return;
  }

  els.tabs.innerHTML = MENU.map((cat, i) =>
    `<button class="menu-tab${i === 0 ? ' active' : ''}" data-key="${cat.key}">${cat.label}</button>`
  ).join('');

  els.tabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.menu-tab');
    if (!btn) return;
    render(MENU, els, btn.dataset.key);
  });

  render(MENU, els, MENU[0].key);
}
