// cart.js — estado do carrinho (sem DOM), com assinatura para a UI reagir.

/* ---------- helpers de preço ---------- */

// "R$ 22,00" -> 22.00
export function parsePrice(str) {
  const n = String(str).replace(/[^\d,]/g, '').replace(',', '.');
  return Number(n) || 0;
}

// 22 -> "R$ 22,00"
export function formatBRL(n) {
  return 'R$ ' + Number(n).toFixed(2).replace('.', ',');
}

/* ---------- estado ---------- */

const items = new Map(); // id -> { id, name, price, qty }
const listeners = new Set();

function emit() {
  for (const fn of listeners) fn(cart);
}

export const cart = {
  add(item) {
    const existing = items.get(item.id);
    if (existing) existing.qty += 1;
    else items.set(item.id, { id: item.id, name: item.name, price: item.price, qty: 1 });
    emit();
  },
  inc(id) {
    const it = items.get(id);
    if (it) { it.qty += 1; emit(); }
  },
  dec(id) {
    const it = items.get(id);
    if (!it) return;
    it.qty -= 1;
    if (it.qty <= 0) items.delete(id);
    emit();
  },
  remove(id) {
    if (items.delete(id)) emit();
  },
  clear() {
    items.clear();
    emit();
  },
  list() {
    return [...items.values()];
  },
  count() {
    return this.list().reduce((s, i) => s + i.qty, 0);
  },
  total() {
    return this.list().reduce((s, i) => s + i.price * i.qty, 0);
  },
  isEmpty() {
    return items.size === 0;
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
