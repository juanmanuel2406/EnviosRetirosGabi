/* Envíos Gabi · lógica
   Roles sin login:
   - Depósito (por defecto): tilda Armado / Despachado, cambia el estado de los retiros y pasa lo terminado al historial.
   - Gabi (se abre con el link terminado en #gabi y queda recordado en ese dispositivo): además carga, edita,
     elimina pedidos, pone o saca los colores y devuelve pedidos desde el historial.
   Reglas de la planilla:
   - Rojo = frenado / sin pagar: no se puede despachar ni entregar. Cuando Gabi saca el rojo, queda pago.
   - Verde = pasó por técnica. Amarillo = prestar atención. */
(() => {
'use strict';

/* ---------- configuración ---------- */
const SAAS_VENTA = 'https://beta.saasargentina.com/ventas.php?a=ver&id=';
const KEY_DATA = 'envios-gabi-v1', KEY_GABI = 'envios-gabi-mode', KEY_THEME = 'envios-gabi-theme';
const FLAGS = {
  tec:  { name: 'Pasó por técnica',     hint: 'Tiene algo armado' },
  stop: { name: 'Frenado · no entregar', hint: 'Sin pagar. Al sacarlo queda pago' },
  warn: { name: 'Prestar atención',     hint: 'Algo para revisar' }
};
const METHODS = { envio: ['Expreso','Hogareño','Envío vehículo','Peugeot','Flex'], retiro: ['Retira cliente','Retira en local Morón'] };
const EST = { pend: 'Pendiente', prep: 'Preparado', ret: 'Entregado' };
const EXPRESOS = window.EXPRESOS || [];

/* ---------- almacenamiento (reemplazable por una base compartida) ---------- */
const Store = {
  load() { try { const d = JSON.parse(localStorage.getItem(KEY_DATA)); if (Array.isArray(d) && d.length) return d; } catch (e) {} return (window.SEED || []).map(o => ({ ...o })); },
  save(list) { try { localStorage.setItem(KEY_DATA, JSON.stringify(list)); } catch (e) {} }
};
const pref = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
};

let orders = Store.load();
const save = () => Store.save(orders);

/* ---------- estado de la vista ---------- */
let tab = 'envio', fseg = 'all', fflag = 'all', q = '';
let gabi = location.hash === '#gabi' || pref.get(KEY_GABI) === '1';
if (location.hash === '#gabi') pref.set(KEY_GABI, '1');

/* ---------- utilidades ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/^(expreso|transporte)\s+/, '').trim();
const findExp = n => { n = norm(n); if (!n) return null; return EXPRESOS.find(e => { const m = norm(e.name); return m === n || m.includes(n) || n.includes(m); }); };
const money = v => v ? '$ ' + Number(String(v).replace(/\D/g, '')).toLocaleString('es-AR') : '';
const dd = d => String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
const active = k => orders.filter(o => o.kind === k && !o.arch).sort((a, b) => a.t - b.t);
const archived = () => orders.filter(o => o.arch).sort((a, b) => b.arch - a.arch);
const isDone = o => o.kind === 'envio' ? !!o.desp : o.estado === 'ret';
const matchQ = o => { if (!q) return true; const s = norm(q); return [o.cli, o.venta, o.exp, o.com, o.ubic].some(x => norm(x).includes(s)); };
const EASE = 'cubic-bezier(.23,1,.32,1)';
/* WAAPI: corre en el compositor, sin librerías */
const anim = (el, kf, opt) => (!el || RM.matches || !el.animate) ? Promise.resolve() : el.animate(kf, { easing: EASE, ...opt }).finished.catch(() => {});

const I = {
  ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  chk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
  tick: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  arch: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/></svg>',
  undo: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>',
  box: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z"/><path d="M3 7.5v9L12 21l9-4.5v-9M12 12v9"/></svg>'
};

/* ---------- tema claro / oscuro ---------- */
const sysDark = matchMedia('(prefers-color-scheme: dark)');
const effTheme = () => document.documentElement.getAttribute('data-theme') || (sysDark.matches ? 'dark' : 'light');
function syncThemeUI() {
  const eff = effTheme();
  document.documentElement.setAttribute('data-eff', eff);
  $('#theme').setAttribute('aria-label', eff === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}
function toggleTheme() {
  const next = effTheme() === 'dark' ? 'light' : 'dark';
  const apply = () => { document.documentElement.setAttribute('data-theme', next); pref.set(KEY_THEME, next); syncThemeUI(); };
  if (document.startViewTransition && !RM.matches) document.startViewTransition(apply); else apply();
}
sysDark.addEventListener?.('change', syncThemeUI);

/* ---------- filtros ---------- */
const SEGS = {
  envio: [['all','Todos',o=>true],['todo','Por armar',o=>!o.arm&&!o.desp],['ready','Listos para despachar',o=>o.arm&&!o.desp&&o.flag!=='stop'],['done','Despachados',o=>o.desp]],
  retiro: [['all','Todos',o=>true],['pend','Pendientes',o=>o.estado==='pend'],['prep','Preparados',o=>o.estado==='prep'],['ret','Entregados',o=>o.estado==='ret']],
  hist: [['all','Todo',o=>true],['envio','Envíos',o=>o.kind==='envio'],['retiro','Retiros',o=>o.kind==='retiro']]
};
const flagMatch = o => fflag === 'all' || o.flag === fflag;
const base = () => tab === 'hist' ? archived() : active(tab);

/* ---------- filas ---------- */
const flagCell = o => (gabi ? `<button type="button" class="fbtn" data-act="flag" data-id="${o.id}" aria-label="Color: ${o.flag ? FLAGS[o.flag].name : 'sin color'}. Cambiar"></button>` : '') + `<span class="flag ${o.flag || ''}" aria-hidden="true"></span>`;
const badge = o => o.flag ? `<div class="badge ${o.flag}"><span class="sw ${o.flag}"></span>${FLAGS[o.flag].name}</div>` : '';
const venta = o => o.venta ? `<a class="venta" href="${SAAS_VENTA}${encodeURIComponent(o.venta)}" target="_blank" rel="noopener" title="Abrir la venta en SaaS">${esc(o.venta)} ${I.ext}</a>` : '';
const more = o => gabi ? `<button type="button" class="more" data-act="edit" data-id="${o.id}" aria-label="Editar ${esc(o.cli)}">${I.dots}</button>` : '';
const dateCell = o => `<div class="date"><span class="d">${esc(o.fecha)}</span><span class="vend">${esc(o.vend)}</span></div>`;
const cliCell = o => `<div><div class="lbl">Cliente</div><div class="cli">${esc(o.cli)}</div>${venta(o)}</div>`;
const noteCell = o => `<div><div class="lbl">Comentarios</div>${badge(o)}<div class="note ${o.com ? '' : 'empty'}">${o.com ? esc(o.com) : 'Sin comentarios'}</div></div>`;
const metTag = o => `<span class="met ${o.met === 'Expreso' ? 'm-expreso' : ''}">${esc(o.met)}</span>`;

function rowEnvio(o) {
  const ex = findExp(o.exp), stop = o.flag === 'stop';
  let dest = '';
  if (o.exp) dest += `<div class="dest"><strong>${esc(ex ? ex.name : o.exp)}</strong>${ex ? `<div class="sub">${esc(ex.dir)}${ex.hor ? ' · ' + esc(ex.hor) : ''}</div>` : ''}</div>`;
  if (o.ubic || o.tel) dest += `<div class="sub">${esc(o.ubic)}${o.ubic && o.tel ? ' · ' : ''}${o.tel ? `<span class="mono">${esc(o.tel)}</span>` : ''}</div>`;
  if (o.monto) dest += `<div class="money">${money(o.monto)}</div>`;
  if (!dest) dest = '<span class="sub">—</span>';
  const desp = stop && !o.desp
    ? `<button type="button" class="cb locked" data-act="desp" data-id="${o.id}" role="checkbox" aria-checked="false" aria-disabled="true" title="Frenado: no se despacha hasta que Gabi saque el rojo"><span class="bx">${I.lock}</span>Frenado</button>`
    : `<button type="button" class="cb desp" data-act="desp" data-id="${o.id}" role="checkbox" aria-checked="${!!o.desp}"><span class="bx">${I.chk}</span>Despachado</button>`;
  return `<article class="row g-env ${stop ? 'is-stop' : ''} ${o.desp ? 'is-done' : ''}" data-id="${o.id}">
    ${flagCell(o)}${dateCell(o)}${cliCell(o)}${noteCell(o)}
    <div><div class="lbl">Método</div>${metTag(o)}${o.hor ? `<div class="sub" style="margin-top:5px">${esc(o.hor)}</div>` : ''}</div>
    <div><div class="lbl">Destino / Expreso</div>${dest}</div>
    <div><div class="checks">
      <button type="button" class="cb" data-act="arm" data-id="${o.id}" role="checkbox" aria-checked="${!!o.arm}"><span class="bx">${I.chk}</span>Armado</button>${desp}
    </div></div>
    <div class="c-more">${more(o)}</div></article>`;
}
function rowRetiro(o) {
  const stop = o.flag === 'stop';
  const st = ['pend','prep','ret'].map(s => {
    const block = s === 'ret' && stop && o.estado !== 'ret';
    return `<button type="button" data-act="estado" data-s="${s}" data-id="${o.id}" aria-pressed="${o.estado === s}" ${block ? 'disabled title="Frenado: no entregar"' : ''}>${block ? 'No entregar' : EST[s]}</button>`;
  }).join('');
  return `<article class="row g-ret ${stop ? 'is-stop' : ''} ${o.estado === 'ret' ? 'is-done' : ''}" data-id="${o.id}">
    ${flagCell(o)}${dateCell(o)}${cliCell(o)}${noteCell(o)}
    <div><div class="lbl">Método</div>${metTag(o)}</div>
    <div><div class="lbl">Estado</div><div class="states" role="group" aria-label="Estado de ${esc(o.cli)}">${st}</div></div>
    <div class="c-more">${more(o)}</div></article>`;
}
function rowHist(o) {
  const ex = findExp(o.exp);
  return `<article class="row g-hist" data-id="${o.id}">
    ${dateCell(o)}<div><span class="kind">${o.kind === 'envio' ? 'Envío' : 'Retiro'}</span></div>${cliCell(o)}
    <div><div class="lbl">Comentarios</div><div class="note ${o.com ? '' : 'empty'}">${o.com ? esc(o.com) : 'Sin comentarios'}</div></div>
    <div><div class="lbl">Método</div>${metTag(o)}${o.exp ? `<div class="sub" style="margin-top:5px">${esc(ex ? ex.name : o.exp)}</div>` : ''}</div>
    <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start"><span class="sub">Cerrado <span class="mono">${dd(new Date(o.arch))}</span></span>
      ${gabi ? `<button type="button" class="btn-2 press" data-act="restore" data-id="${o.id}">${I.undo}Volver</button>` : ''}</div></article>`;
}

/* ---------- render ---------- */
const TITLES = { envio: 'Turnero envíos', retiro: 'Retiro depósito', hist: 'Historial', exp: 'Datos de los expresos' };
function header() {
  $('#h1').textContent = TITLES[tab];
  let s = '';
  if (tab === 'envio') { const l = active('envio'); s = `<span class="mono">${l.filter(o=>!o.arm&&!o.desp).length}</span> por armar · <span class="mono">${l.filter(o=>o.arm&&!o.desp&&o.flag!=='stop').length}</span> listos · <span class="mono">${l.filter(o=>o.flag==='stop'&&!o.desp).length}</span> frenados`; }
  else if (tab === 'retiro') { const l = active('retiro'); s = `<span class="mono">${l.filter(o=>o.estado==='prep').length}</span> preparados esperando · <span class="mono">${l.filter(o=>o.flag==='stop'&&o.estado!=='ret').length}</span> sin pagar`; }
  else if (tab === 'hist') s = 'Envíos despachados y retiros entregados.';
  else s = 'Dirección, horario y contacto de cada transporte. Tocá un teléfono para copiarlo.';
  $('#hsub').innerHTML = s;
  $('#band .legend').hidden = tab === 'exp' || tab === 'hist';
  $('#n-envio').textContent = active('envio').filter(o => !o.desp).length;
  $('#n-retiro').textContent = active('retiro').filter(o => o.estado !== 'ret').length;
  $('#n-hist').textContent = archived().length;
  $('#n-exp').textContent = EXPRESOS.length;
  $('#btn-new').hidden = !gabi;
  $('#mode').hidden = !gabi;
  $('#foot').textContent = gabi
    ? 'Modo Gabi activo en este dispositivo: podés cargar, editar y marcar colores. Los datos se guardan en este navegador.'
    : 'Vista depósito: tildá Armado y Despachado y marcá las entregas. Los pedidos y los colores los carga Gabi.';
}
function filters() {
  const seg = $('#seg'), dots = $('#dots');
  if (tab === 'exp') { seg.hidden = true; dots.hidden = true; return; }
  seg.hidden = false;
  const list = base();
  seg.innerHTML = SEGS[tab].map(([k, l, fn]) => `<button type="button" data-seg="${k}" aria-pressed="${fseg === k}">${l} <span class="c">${list.filter(fn).length}</span></button>`).join('');
  dots.hidden = tab === 'hist';
  if (tab !== 'hist') dots.innerHTML = [['stop','Rojo'],['warn','Amarillo'],['tec','Verde']].map(([k, l]) =>
    `<button type="button" class="dotf press" data-flag="${k}" aria-pressed="${fflag === k}" title="${FLAGS[k].name}"><span class="sw ${k}"></span>${l} <span class="c">${list.filter(o => o.flag === k).length}</span></button>`).join('');
}
const empty = (t, s) => `<div class="emptybox"><div class="ic">${I.box}</div><strong>${t}</strong>${s}</div>`;
const cols = (g, h) => `<div class="cols ${g}">${h.map(x => `<span>${x}</span>`).join('')}</div>`;
function sheet(animateIn) {
  const sh = $('#sheet');
  if (tab === 'exp') {
    const s = norm(q), rows = EXPRESOS.filter(e => !s || [e.name, e.dir, e.loc].some(x => norm(x).includes(s)));
    sh.innerHTML = rows.length ? `<div class="tw"><table><thead><tr><th>Transporte / Expreso</th><th>Domicilio</th><th>Localidad</th><th>Horarios</th><th>Teléfono</th><th>Email / Web</th></tr></thead><tbody>${rows.map(e => `<tr>
      <td class="name">${esc(e.name)}</td><td>${esc(e.dir)}</td><td><span class="loc">${esc(e.loc)}</span></td>
      <td class="mono" style="font-size:12px">${esc(e.hor) || '<span class="sub">—</span>'}</td>
      <td>${e.tel ? `<button type="button" class="copy" data-copy="${esc(e.tel)}">${esc(e.tel)}</button>` : '<span class="sub">—</span>'}</td>
      <td>${e.mail ? `<div class="sub">${esc(e.mail)}</div>` : ''}${e.web ? `<a href="${esc(e.web)}" target="_blank" rel="noopener">${esc(e.web.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a>` : ''}${!e.mail && !e.web ? '<span class="sub">—</span>' : ''}</td></tr>`).join('')}</tbody></table></div>`
      : empty('No hay expresos con ese nombre', 'Probá con otra palabra o la localidad.');
    if (animateIn) stagger($$('#sheet tbody tr'));
    return;
  }
  const fn = (SEGS[tab].find(x => x[0] === fseg) || SEGS[tab][0])[2];
  const list = base().filter(o => fn(o) && flagMatch(o) && matchQ(o));
  if (!list.length) {
    const filt = q || fseg !== 'all' || fflag !== 'all';
    sh.innerHTML = filt ? empty('Nada con este filtro', 'Cambiá el filtro o borrá la búsqueda.')
      : tab === 'hist' ? empty('El historial está vacío', 'Lo que pasen al historial aparece acá.')
      : empty(tab === 'envio' ? 'No hay envíos cargados' : 'No hay retiros cargados', gabi ? 'Cargá el primero con "Nuevo pedido".' : 'Cuando Gabi cargue un pedido, aparece acá.');
    return;
  }
  let html = '';
  if (tab === 'hist') html = cols('g-hist', ['Fecha','Tipo','Cliente','Comentarios','Método','Cierre']) + list.map(rowHist).join('');
  else {
    const g = tab === 'envio' ? 'g-env' : 'g-ret', row = tab === 'envio' ? rowEnvio : rowRetiro;
    const head = tab === 'envio' ? ['Fecha','Cliente','Comentarios','Método','Destino / Expreso','Armado · Despacho',''] : ['Fecha','Cliente','Comentarios','Método','Estado',''];
    const open = list.filter(o => !isDone(o)), done = list.filter(isDone);
    if (open.length) html += `<div class="ghead"><h3>En curso <span class="c">${open.length}</span></h3></div>` + cols(g, head) + open.map(row).join('');
    if (done.length) html += `<div class="ghead" id="done-head"><h3><span class="sw tec"></span>${tab === 'envio' ? 'Despachados' : 'Entregados'} <span class="c">${done.length}</span></h3><button type="button" class="btn-2 press" data-act="archive-all">${I.arch}Pasar al historial</button></div>` + (open.length ? '' : cols(g, head)) + done.map(row).join('');
  }
  sh.innerHTML = html;
  if (animateIn) stagger($$('#sheet .row'));
}
/* entrada escalonada: sólo al cambiar de pestaña (ocasional), nunca al tildar o filtrar */
function stagger(els) { els.slice(0, 12).forEach((el, i) => anim(el, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 240, delay: i * 30, fill: 'backwards' })); }
const render = (animateIn = false) => { header(); filters(); sheet(animateIn); };

function moveInk(instant) {
  const t = $('.tab[aria-selected="true"]'), ink = $('#ink');
  if (instant) ink.setAttribute('data-instant', '');
  ink.style.transform = `translateX(${t.offsetLeft}px) scaleX(${t.offsetWidth})`;
  if (instant) requestAnimationFrame(() => ink.removeAttribute('data-instant'));
}

/* ---------- avisos ---------- */
function toast(msg, undo) {
  const box = $('#toasts');
  while (box.children.length > 2) box.firstChild.remove();
  const t = document.createElement('div');
  t.className = 'toast'; t.dataset.state = 'enter'; t.setAttribute('role', 'status');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">Deshacer</button>' : ''}`;
  box.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.dataset.state = ''; }));
  const kill = () => { if (t.dataset.state === 'exit') return; t.dataset.state = 'exit'; setTimeout(() => t.remove(), 180); };
  let timer = setTimeout(kill, 4500);
  t.addEventListener('mouseenter', () => clearTimeout(timer));
  t.addEventListener('mouseleave', () => { timer = setTimeout(kill, 2000); });
  if (undo) t.querySelector('button').onclick = () => { undo(); kill(); };
}

/* ---------- acciones en la hoja ---------- */
const shake = el => anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(0)' }], { duration: 300, easing: 'ease-in-out' });
function moveRow(o) {
  render();
  const r = $(`.row[data-id="${o.id}"]`);
  anim(r, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220 });
}

$('#sheet').addEventListener('click', e => {
  const c = e.target.closest('[data-copy]');
  if (c) return copyText(c);
  const b = e.target.closest('[data-act]'); if (!b) return;
  const act = b.dataset.act;
  if (act === 'archive-all') return archiveAll();
  const o = orders.find(x => x.id === b.dataset.id); if (!o) return;

  if (act === 'flag' && gabi) return openMenu(o, b);
  if (act === 'edit' && gabi) return openDrawer(o);

  if (act === 'arm') {                                   // cualquiera tilda / destilda
    o.arm = !o.arm; save();
    b.setAttribute('aria-checked', o.arm); header(); filters();
    if (fseg !== 'all') setTimeout(() => sheet(false), 200);
    return;
  }
  if (act === 'desp') {                                  // cualquiera tilda / destilda, salvo frenado
    if (o.flag === 'stop' && !o.desp) { shake(b.closest('.row')); toast('Frenado: no se despacha hasta que Gabi saque el rojo'); return; }
    o.desp = !o.desp; save(); b.setAttribute('aria-checked', o.desp);
    setTimeout(() => moveRow(o), RM.matches ? 0 : 200);
    toast(o.desp ? `${o.cli}: despachado` : `${o.cli}: vuelve a en curso`, () => { o.desp = !o.desp; save(); moveRow(o); });
    return;
  }
  if (act === 'estado') {
    const s = b.dataset.s; if (o.estado === s) return;
    if (s === 'ret' && o.flag === 'stop') { shake(b.closest('.row')); return; }
    const prev = o.estado; o.estado = s; save();
    b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
    if ((s === 'ret') !== (prev === 'ret')) setTimeout(() => moveRow(o), RM.matches ? 0 : 200); else { header(); filters(); }
    toast(`${o.cli}: ${EST[s]}`, () => { o.estado = prev; save(); moveRow(o); });
    return;
  }
  if (act === 'restore' && gabi) {
    delete o.arch;
    if (o.kind === 'envio') o.desp = false; else o.estado = 'prep';
    save();
    anim(b.closest('.row'), [{ opacity: 1 }, { opacity: 0, transform: 'translateX(12px)' }], { duration: 160 }).then(() => {
      render(); toast(`${o.cli} volvió a ${o.kind === 'envio' ? 'Envíos' : 'Retiro depósito'}`);
    });
  }
});

function archiveAll() {
  const list = active(tab).filter(isDone); if (!list.length) return;
  const els = [$('#done-head'), ...list.map(o => $(`.row[data-id="${o.id}"]`))].filter(Boolean);
  Promise.all(els.map((el, i) => anim(el, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(16px)' }], { duration: 180, delay: Math.min(i, 8) * 25, fill: 'forwards' }))).then(() => {
    const ts = Date.now(); list.forEach(o => { o.arch = ts; }); save(); render();
    toast(`${list.length} ${list.length === 1 ? 'pedido pasado' : 'pedidos pasados'} al historial`, () => { list.forEach(o => delete o.arch); save(); render(); });
    anim($('[data-tab="hist"] .n'), [{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 260 });
  });
}

function copyText(el) {
  const v = el.dataset.copy;
  const select = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Seleccionado: copialo con Ctrl+C'); };
  try { navigator.clipboard.writeText(v).then(() => toast(`Copiado: ${v}`), select); } catch (err) { select(); }
}

/* ---------- menú de color (sólo Gabi) ---------- */
const menu = $('#menu'); let menuFor = null;
function openMenu(o, btn) {
  menuFor = o;
  menu.innerHTML = `<div class="mh">Color del pedido</div>` + [['', 'Sin color', 'Pedido normal'], ...Object.entries(FLAGS).map(([k, f]) => [k, f.name, f.hint])]
    .map(([k, n, h]) => `<button type="button" role="menuitemradio" aria-checked="${(o.flag || '') === k}" data-f="${k}"><span class="sw ${k || 'none'}"></span><span>${n}<small>${h}</small></span><span class="tick">${I.tick}</span></button>`).join('');
  menu.hidden = false;
  const r = btn.getBoundingClientRect(), w = 252, vw = document.documentElement.clientWidth;
  menu.style.left = Math.max(16, Math.min(r.right + scrollX + 4, scrollX + vw - w - 16)) + 'px';
  menu.style.top = (r.top + scrollY + 6) + 'px';
  requestAnimationFrame(() => { menu.dataset.state = 'open'; menu.querySelector('[aria-checked="true"]')?.focus({ preventScroll: true }); });
}
function closeMenu() {
  if (menu.dataset.state !== 'open') return;
  menu.dataset.state = 'closed'; menuFor = null;
  setTimeout(() => { if (menu.dataset.state === 'closed') menu.hidden = true; }, 160);
}
menu.addEventListener('click', e => {
  const b = e.target.closest('[data-f]'); if (!b || !menuFor) return;
  const o = menuFor, prev = o.flag || '', f = b.dataset.f; closeMenu(); if (prev === f) return;
  o.flag = f; save(); render();
  const msg = prev === 'stop' && !f ? `${o.cli}: liberado, ya está pago` : f ? `${o.cli}: ${FLAGS[f].name}` : `${o.cli}: sin color`;
  toast(msg, () => { o.flag = prev; save(); render(); });
});
document.addEventListener('pointerdown', e => { if (menu.dataset.state === 'open' && !menu.contains(e.target) && !e.target.closest('[data-act="flag"]')) closeMenu(); });

/* ---------- navegación ---------- */
$('#tabs').addEventListener('click', e => {
  const t = e.target.closest('.tab'); if (!t || t.getAttribute('aria-selected') === 'true') return;
  $$('.tab').forEach(x => x.setAttribute('aria-selected', x === t));
  tab = t.dataset.tab; fseg = 'all'; fflag = 'all';
  moveInk(); render(true);
});
$('#seg').addEventListener('click', e => { const b = e.target.closest('[data-seg]'); if (!b) return; fseg = b.dataset.seg; filters(); sheet(false); });
$('#dots').addEventListener('click', e => { const b = e.target.closest('[data-flag]'); if (!b) return; fflag = fflag === b.dataset.flag ? 'all' : b.dataset.flag; filters(); sheet(false); });
let qt; $('#q').addEventListener('input', e => { q = e.target.value; clearTimeout(qt); qt = setTimeout(() => { filters(); sheet(false); }, 100); });
$('#theme').addEventListener('click', toggleTheme);
$('#mode-exit').addEventListener('click', () => {
  gabi = false; pref.set(KEY_GABI, null);
  if (location.hash === '#gabi') history.replaceState(null, '', location.pathname + location.search);
  closeMenu(); closeDrawer(); render(); toast('Saliste del modo Gabi');
});
addEventListener('hashchange', () => { if (location.hash === '#gabi' && !gabi) { gabi = true; pref.set(KEY_GABI, '1'); render(); toast('Modo Gabi activo'); } });

/* ---------- panel de carga (sólo Gabi) ---------- */
let editing = null, fkind = 'envio', fpick = '', delArm = false, lastFocus = null;
const F = ['vend','venta','cli','com','met','ubic','tel','hor','monto','exp'];
$('#dl-exp').innerHTML = EXPRESOS.map(e => `<option value="${esc(e.name)}">`).join('');
function setKind(k) {
  fkind = k;
  $$('[data-kind]').forEach(b => b.setAttribute('aria-pressed', b.dataset.kind === k));
  $('#sec-envio').hidden = k !== 'envio';
  const cur = $('#f-met').value;
  $('#f-met').innerHTML = METHODS[k].map(m => `<option>${m}</option>`).join('');
  if (METHODS[k].includes(cur)) $('#f-met').value = cur;
}
function renderPick() {
  $('#fpick').innerHTML = [['', 'Sin color', 'none'], ...Object.entries(FLAGS).map(([k, f]) => [k, f.name, k])]
    .map(([k, n, sw]) => `<button type="button" data-p="${k}" aria-pressed="${fpick === k}"><span class="sw ${sw}"></span>${n}</button>`).join('');
}
$('#fpick').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; fpick = b.dataset.p; renderPick(); });
$$('[data-kind]').forEach(b => b.addEventListener('click', () => setKind(b.dataset.kind)));
function exInfo() {
  const ex = findExp($('#f-exp').value), box = $('#exinfo');
  if (!ex) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `<strong>${esc(ex.name)}</strong> · ${esc(ex.loc)}<br>${esc(ex.dir)}${ex.hor ? '<br>Horario: ' + esc(ex.hor) : ''}${ex.tel ? '<br>Tel: <span class="mono">' + esc(ex.tel) + '</span>' : ''}`;
}
$('#f-exp').addEventListener('input', exInfo);

function openDrawer(o, instant) {
  if (!gabi) return;
  editing = o || null; delArm = false; lastFocus = document.activeElement;
  $('#dr-title').textContent = o ? 'Editar pedido' : 'Nuevo pedido';
  $('#f-save').textContent = o ? 'Guardar cambios' : 'Cargar pedido';
  $('#f-del').hidden = !o; $('#f-del').textContent = 'Eliminar'; $('#f-err').hidden = true;
  setKind(o ? o.kind : (tab === 'retiro' ? 'retiro' : 'envio'));
  F.forEach(k => { $('#f-' + k).value = o ? (o[k] ?? '') : (k === 'vend' ? 'GK' : k === 'met' ? METHODS[fkind][0] : ''); });
  fpick = o ? (o.flag || '') : ''; renderPick(); exInfo();
  const dr = $('#drawer');
  if (instant) dr.setAttribute('data-instant', '');
  dr.dataset.state = 'open'; dr.setAttribute('aria-hidden', 'false'); $('#scrim').dataset.state = 'open';
  requestAnimationFrame(() => dr.removeAttribute('data-instant'));
  setTimeout(() => $('#f-cli').focus({ preventScroll: true }), instant ? 0 : 120);
}
function closeDrawer() {
  const dr = $('#drawer'); if (dr.dataset.state !== 'open') return;
  dr.dataset.state = 'closed'; dr.setAttribute('aria-hidden', 'true'); $('#scrim').dataset.state = 'closed';
  lastFocus?.focus?.({ preventScroll: true });
}
$('#btn-new').addEventListener('click', () => openDrawer());
$('#dr-x').addEventListener('click', closeDrawer);
$('#f-cancel').addEventListener('click', closeDrawer);
$('#scrim').addEventListener('click', closeDrawer);
$('#f-del').addEventListener('click', () => {
  if (!delArm) { delArm = true; $('#f-del').textContent = 'Confirmar: eliminar'; return; }
  const o = editing, i = orders.indexOf(o); orders.splice(i, 1); save(); closeDrawer(); render();
  toast(`${o.cli} eliminado`, () => { orders.splice(i, 0, o); save(); render(); });
});
$('#form').addEventListener('submit', e => {
  e.preventDefault(); if (!gabi) return;
  const v = {}; F.forEach(k => { v[k] = $('#f-' + k).value.trim(); });
  if (!v.cli) { $('#f-err').hidden = false; shake($('#f-cli')); $('#f-cli').focus(); return; }
  if (fkind === 'retiro') v.ubic = v.tel = v.hor = v.monto = v.exp = '';
  const isNew = !editing; let o;
  if (editing) {
    o = editing; const kindChanged = o.kind !== fkind;
    Object.assign(o, v, { flag: fpick, kind: fkind });
    if (kindChanged) { if (fkind === 'retiro') { o.estado = 'pend'; delete o.arm; delete o.desp; } else { o.arm = false; o.desp = false; delete o.estado; } }
  } else {
    o = { id: 'p' + Date.now(), kind: fkind, ...v, flag: fpick, fecha: dd(new Date()), t: Date.now() };
    if (fkind === 'envio') { o.arm = false; o.desp = false; } else o.estado = 'pend';
    orders.push(o);
  }
  save(); closeDrawer();
  const target = o.arch ? 'hist' : o.kind;
  if (tab !== target) { tab = target; $$('.tab').forEach(x => x.setAttribute('aria-selected', x.dataset.tab === tab)); moveInk(); }
  fseg = 'all'; fflag = 'all'; render();
  const r = $(`.row[data-id="${o.id}"]`);
  if (r) {
    r.scrollIntoView({ block: 'nearest', behavior: RM.matches ? 'auto' : 'smooth' });
    const hl = getComputedStyle(document.documentElement).getPropertyValue('--accent-soft').trim();
    anim(r, [{ backgroundColor: hl }, { backgroundColor: 'transparent' }], { duration: 1200, easing: 'ease' });
  }
  toast(isNew ? `${o.cli} cargado en ${o.kind === 'envio' ? 'Envíos' : 'Retiro depósito'}` : `${o.cli}: cambios guardados`);
});

/* ---------- teclado: sin animaciones ---------- */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (menu.dataset.state === 'open') return closeMenu(); if ($('#drawer').dataset.state === 'open') return closeDrawer(); }
  const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '');
  if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/') { e.preventDefault(); $('#q').focus(); }
  if ((e.key === 'n' || e.key === 'N') && gabi && $('#drawer').dataset.state !== 'open') { e.preventDefault(); openDrawer(null, true); }
});

/* ---------- inicio ---------- */
syncThemeUI();
render(true);
moveInk(true);
addEventListener('resize', () => moveInk(true));
document.fonts?.ready.then(() => moveInk(true));
})();
