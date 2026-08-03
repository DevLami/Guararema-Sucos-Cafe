// checkout.js — gaveta do carrinho + formulário de finalização + validação de entrega.
// A mensagem final do WhatsApp será montada na próxima etapa.

import { cart, formatBRL, parsePrice } from './cart.js';

/* ============================================================
   CONFIGURAÇÃO DA LOJA  —  PREENCHA AQUI
   Pegue lat/lng no Google Maps (botão direito no ponto da loja).
   Enquanto lat/lng forem null, a checagem de entrega fica desativada.
   ============================================================ */
const STORE = {
  lat: -23.412607,   // Guararema Sucos e Café
  lng: -46.035831,
  radiusKm: 0.4,    // raio de entrega em km (400 m)
  city: 'Guararema',
  state: 'SP',
};

// Número que RECEBE os pedidos (formato internacional, só dígitos).
// >>> MODO TESTE: enviando para o número particular.
//     Para publicar de verdade, comente a linha de teste e use a da loja.
const WHATSAPP = '5511937197667';   // ← TESTE (particular)
// const WHATSAPP = '5511933891053'; // ← LOJA (usar quando for ao ar)

const TIPO_LABEL = {
  local: 'Consumir no local',
  retirar: 'Retirar na loja',
  entrega: 'Entrega',
};

const PAGAMENTO_LABEL = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  cartao: 'Cartão de crédito ou débito',
  vale: 'Vale alimentação ou refeição',
};

const PAG_LABEL = {
  'dinheiro-pix': 'Dinheiro / Pix',
  cartao: 'Cartão de crédito ou débito',
  vale: 'Vale alimentação ou refeição',
};

/* ---------- mensagem do WhatsApp ---------- */

// Monta o texto do pedido (WhatsApp aceita *negrito* e quebras de linha).
function buildWhatsappText(order) {
  const L = [];
  L.push('*Novo pedido — Guararema Sucos e Café*');
  if (order.dataHora) L.push(`*Data/hora:* ${order.dataHora}`);
  L.push('');
  for (const it of order.items) {
    L.push(`• ${it.qty}× ${it.name} — ${formatBRL(it.price * it.qty)}`);
  }
  L.push('');
  L.push(`*Total:* ${formatBRL(order.total)}`);
  L.push('');
  L.push(`*Nome:* ${order.nome}`);
  L.push(`*Telefone:* ${order.telefone}`);
  L.push(`*Como receber:* ${TIPO_LABEL[order.tipo]}`);
  if (order.local) {
    L.push(`*Localização:* ${order.local.mapa} (aprox. ${order.local.distanciaM} m da loja)`);
  }
  L.push(`*Pagamento:* ${PAGAMENTO_LABEL[order.pagamento]}`);
  if (order.troco) {
    L.push(order.troco.precisa
      ? `*Troco para:* ${formatBRL(order.troco.para)} (levar ${formatBRL(order.troco.valor)} de troco)`
      : '*Troco:* não precisa');
  }
  return L.join('\n');
}

function whatsappUrl(order) {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(buildWhatsappText(order))}`;
}

// Data e hora do pedido, no formato DD/MM/AAAA às HH:MM (horário do aparelho).
function formatDateTime(d) {
  const p = (n) => String(n).padStart(2, '0');
  const data = `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
  const hora = `${p(d.getHours())}:${p(d.getMinutes())}`;
  return `${data} às ${hora}`;
}

/* ---------- localização (GPS) + distância ---------- */

// Obtém a posição atual do aparelho (o navegador pede permissão ao usuário).
function getPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) { reject({ code: 0 }); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

// Mensagem amigável para cada tipo de erro de geolocalização.
function geoErrorMessage(err) {
  switch (err && err.code) {
    case 1: return 'Você precisa permitir o acesso à localização para confirmar a entrega.';
    case 2: return 'Não foi possível obter sua localização. Verifique o GPS e tente de novo.';
    case 3: return 'Tempo esgotado ao obter a localização. Tente novamente.';
    default: return 'Seu navegador não suporta localização. Você pode retirar na loja. 🙏';
  }
}

// Distância em km entre dois pontos (fórmula de Haversine).
function distanceKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Formata distância: metros abaixo de 1 km, senão km.
function fmtDist(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/* ---------- validações de campo ---------- */

function digits(str) {
  return (str || '').replace(/\D/g, '');
}
function phoneValid(str) {
  const d = digits(str);
  return d.length === 10 || d.length === 11; // fixo ou celular com DDD
}

/* ---------- componente ---------- */

export function initCheckout() {
  const el = (id) => document.getElementById(id);
  const fab = el('cartFab');
  const drawer = el('cartDrawer');
  if (!fab || !drawer) return;

  const overlay = el('cartOverlay');
  const cartCount = el('cartCount');
  const cartItems = el('cartItems');
  const cartEmpty = el('cartEmpty');
  const cartSubtotal = el('cartSubtotal');
  const toCheckout = el('toCheckout');
  const cartView = el('cartView');
  const checkoutView = el('checkoutView');
  const orderDone = el('orderDone');
  const deliveryFields = el('deliveryFields');
  const deliveryStatus = el('deliveryStatus');
  const verifyBtn = el('verifyDelivery');
  const trocoFields = el('trocoFields');
  const placeOrder = el('placeOrder');
  const ckError = el('ckError');

  let deliveryOk = false;     // entrega verificada e dentro do raio?
  let deliveryCoords = null;  // {lat,lng} confirmados por GPS
  let deliveryDistKm = 0;
  let lastFocused = null;

  /* --- render do carrinho --- */
  function renderCart() {
    const list = cart.list();
    const count = cart.count();
    cartCount.textContent = String(count);
    fab.classList.toggle('has-items', count > 0);
    cartCount.hidden = count === 0;

    if (cart.isEmpty()) {
      cartItems.innerHTML = '';
      cartEmpty.hidden = false;
      toCheckout.disabled = true;
    } else {
      cartEmpty.hidden = true;
      toCheckout.disabled = false;
      cartItems.innerHTML = list.map((it) => `
        <li class="cart-row" data-id="${it.id}">
          <div class="cart-row-info">
            <span class="cart-row-name">${it.name}</span>
            <span class="cart-row-price">${formatBRL(it.price)}</span>
          </div>
          <div class="qty" role="group" aria-label="Quantidade de ${it.name}">
            <button type="button" class="qty-btn" data-act="dec" aria-label="Diminuir">−</button>
            <span class="qty-num" aria-live="polite">${it.qty}</span>
            <button type="button" class="qty-btn" data-act="inc" aria-label="Aumentar">+</button>
          </div>
          <button type="button" class="cart-remove" data-act="remove" aria-label="Remover ${it.name}">✕</button>
        </li>`).join('');
    }
    cartSubtotal.textContent = formatBRL(cart.total());
  }

  /* --- abrir / fechar gaveta --- */
  function open() {
    lastFocused = document.activeElement;
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    showCart();
    el('cartClose').focus();
  }
  function close() {
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function showCart() {
    cartView.hidden = false;
    checkoutView.hidden = true;
    orderDone.hidden = true;
  }
  function showCheckout() {
    cartView.hidden = true;
    checkoutView.hidden = false;
    orderDone.hidden = true;
    el('ckNome').focus();
  }

  /* --- entrega: mostra/esconde campos e reseta verificação --- */
  function selectedTipo() {
    const r = drawer.querySelector('input[name="tipo"]:checked');
    return r ? r.value : '';
  }
  function selectedPagamento() {
    const r = drawer.querySelector('input[name="pagamento"]:checked');
    return r ? r.value : '';
  }
  function resetDelivery() {
    deliveryOk = false;
    deliveryCoords = null;
    deliveryDistKm = 0;
    if (deliveryStatus) { deliveryStatus.textContent = ''; deliveryStatus.className = 'delivery-status'; }
  }
  function onTipoChange() {
    const entrega = selectedTipo() === 'entrega';
    deliveryFields.hidden = !entrega;
    resetDelivery();
    updateTroco();
  }

  // Troco só faz sentido em entrega + dinheiro.
  function updateTroco() {
    const show = selectedTipo() === 'entrega' && selectedPagamento() === 'dinheiro';
    trocoFields.hidden = !show;
    if (!show) el('ckTrocoPara').value = '';
  }

  async function verifyDelivery() {
    if (STORE.lat == null || STORE.lng == null) {
      setStatus('Localização da loja ainda não configurada. Avise o administrador.', 'warn');
      return;
    }
    setStatus('Obtendo sua localização…', 'loading');
    verifyBtn.disabled = true;
    try {
      const point = await getPosition();
      const dist = distanceKm(STORE, point);
      if (dist <= STORE.radiusKm) {
        deliveryOk = true;
        deliveryCoords = point;
        deliveryDistKm = dist;
        setStatus(`Você está na área de entrega ✓ (aprox. ${fmtDist(dist)} da loja)`, 'ok');
      } else {
        deliveryOk = false;
        deliveryCoords = null;
        setStatus(`Você está a aprox. ${fmtDist(dist)} da loja, fora da nossa área de entrega `
          + `(até ${fmtDist(STORE.radiusKm)}). Você pode retirar na loja. 🙏`, 'warn');
      }
    } catch (err) {
      console.error(err);
      deliveryOk = false;
      setStatus(geoErrorMessage(err), 'warn');
    } finally {
      verifyBtn.disabled = false;
    }
  }

  function setStatus(msg, kind) {
    if (!deliveryStatus) return;
    deliveryStatus.textContent = msg;
    deliveryStatus.className = `delivery-status ${kind}`;
  }

  /* --- finalizar --- */
  function buildOrder() {
    const order = {
      items: cart.list(),
      total: cart.total(),
      nome: el('ckNome').value.trim(),
      telefone: el('ckTelefone').value.trim(),
      tipo: selectedTipo(),
    };
    if (order.tipo === 'entrega' && deliveryCoords) {
      order.local = {
        lat: deliveryCoords.lat,
        lng: deliveryCoords.lng,
        distanciaM: Math.round(deliveryDistKm * 1000),
        mapa: `https://www.google.com/maps?q=${deliveryCoords.lat},${deliveryCoords.lng}`,
      };
    }
    order.pagamento = selectedPagamento();
    if (order.tipo === 'entrega' && order.pagamento === 'dinheiro') {
      const para = parsePrice(el('ckTrocoPara').value);
      if (para > 0) order.troco = { precisa: true, para, valor: Math.max(0, para - order.total) };
      else order.troco = { precisa: false };
    }
    return order;
  }

  function validate() {
    if (cart.isEmpty()) return 'Seu carrinho está vazio.';
    if (!el('ckNome').value.trim()) return 'Informe seu nome.';
    if (!phoneValid(el('ckTelefone').value)) return 'Informe um telefone válido com DDD.';
    const tipo = selectedTipo();
    if (!tipo) return 'Escolha como deseja receber.';
    if (tipo === 'entrega' && !deliveryOk) {
      return 'Confirme sua localização para a entrega.';
    }
    const pagamento = selectedPagamento();
    if (!pagamento) return 'Escolha a forma de pagamento.';
    if (tipo === 'entrega' && pagamento === 'dinheiro') {
      const raw = el('ckTrocoPara').value.trim();
      if (raw) {
        const para = parsePrice(raw);
        if (!para) return 'Informe um valor de troco válido.';
        if (para < cart.total()) return `O valor para troco deve ser ao menos o total (${formatBRL(cart.total())}).`;
      }
    }
    return null;
  }

  function onPlaceOrder() {
    const problem = validate();
    ckError.textContent = problem || '';
    ckError.hidden = !problem;
    if (problem) return;

    const order = buildOrder();
    order.dataHora = formatDateTime(new Date());
    // Próxima etapa: transformar "order" na mensagem do WhatsApp.
    document.dispatchEvent(new CustomEvent('order:placed', { detail: order }));
    showOrderDone(order);
  }

  function showOrderDone(order) {
    const tipoLabel = { local: 'Consumir no local', retirar: 'Retirar na loja', entrega: 'Entrega' }[order.tipo];
    const linhas = order.items.map((i) => `${i.qty}× ${i.name} — ${formatBRL(i.price * i.qty)}`).join('<br>');
    const end = order.local
      ? `<br><strong>Entrega:</strong> localização confirmada (aprox. ${order.local.distanciaM} m da loja)`
      : '';
    let pag = `<br><strong>Pagamento:</strong> ${PAGAMENTO_LABEL[order.pagamento]}`;
    if (order.troco) {
      pag += order.troco.precisa
        ? `<br><strong>Troco para:</strong> ${formatBRL(order.troco.para)} (levar ${formatBRL(order.troco.valor)})`
        : '<br><strong>Troco:</strong> não precisa';
    }
    el('orderSummary').innerHTML = `
      ${linhas}<br><strong>Total: ${formatBRL(order.total)}</strong><br><br>
      <strong>Nome:</strong> ${order.nome}<br>
      <strong>Telefone:</strong> ${order.telefone}<br>
      <strong>Receber:</strong> ${tipoLabel}${end}${pag}`;
    el('orderNo').textContent = order.dataHora ? `🕒 Pedido feito em ${order.dataHora}` : '';
    el('sendWhatsapp').href = whatsappUrl(order);
    cartView.hidden = true;
    checkoutView.hidden = true;
    orderDone.hidden = false;
    el('sendWhatsapp').focus();
  }

  function newOrder() {
    cart.clear();
    drawer.querySelectorAll('input').forEach((i) => { if (i.type === 'radio') i.checked = false; else i.value = ''; });
    deliveryFields.hidden = true;
    trocoFields.hidden = true;
    resetDelivery();
    ckError.hidden = true;
    close();
  }

  /* --- foco preso na gaveta + Escape --- */
  function onKeydown(e) {
    if (!drawer.classList.contains('open')) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...drawer.querySelectorAll('button, input, [href], [tabindex]:not([tabindex="-1"])')]
      .filter((n) => !n.disabled && n.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* --- ligações --- */
  fab.addEventListener('click', open);
  el('cartClose').addEventListener('click', close);
  overlay.addEventListener('click', close);
  toCheckout.addEventListener('click', showCheckout);
  el('backToCart').addEventListener('click', showCart);
  verifyBtn.addEventListener('click', verifyDelivery);
  placeOrder.addEventListener('click', onPlaceOrder);
  el('newOrder').addEventListener('click', newOrder);
  drawer.addEventListener('change', (e) => {
    if (e.target.name === 'tipo') onTipoChange();
    else if (e.target.name === 'pagamento') updateTroco();
  });
  // steppers e remover
  cartItems.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const id = btn.closest('.cart-row').dataset.id;
    const act = btn.dataset.act;
    if (act === 'inc') cart.inc(id);
    else if (act === 'dec') cart.dec(id);
    else if (act === 'remove') cart.remove(id);
  });
  document.addEventListener('keydown', onKeydown);

  cart.subscribe(renderCart);
  renderCart();
}
