'use strict';
// ===== Dados (base registro a registro) e utilidades =====
const D = /*DADOS*/null;
const C = D.C, M = D.M, L = D.L, P = D.P, A = D.A, R = D.R, STR = D.S, RES = D.RES, SIT = D.SIT;
const NR = R.a.length, CS = [1, 2, 3, 4], INS = {U: 'UMCQA', C: 'CISAB'};
const RM = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const nf = new Intl.NumberFormat('pt-BR');
const n = (v) => (v == null || Number.isNaN(v) ? '–' : nf.format(v));
const p1 = (v) => (v == null || Number.isNaN(v) ? '–' : v.toLocaleString('pt-BR', {minimumFractionDigits: 1, maximumFractionDigits: 1}));
const pct = (a, b) => (b ? (100 * a) / b : null);
const pcs = (a, b) => (b ? p1((100 * a) / b) + '%' : '–');
const vf = (v) => (v == null ? '–' : v.toLocaleString('pt-BR', {maximumFractionDigits: 4}));
const br = (s) => (s ? s.slice(8, 10) + '/' + s.slice(5, 7) + '/' + s.slice(0, 4) : '–');
const brc = (s) => (s ? s.slice(8, 10) + '/' + s.slice(5, 7) : '–');
const semAc = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
function el(tag, at, ...kids) {
  const e = document.createElement(tag);
  if (at) for (const [k, v] of Object.entries(at)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'style') e.style.cssText = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) e.append(k instanceof Node ? k : String(k));
  return e;
}
const NS = 'http://www.w3.org/2000/svg';
const sv = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); return e; };
const anima = (box) => { [...box.children].forEach((c, i) => c.style.setProperty('--i', Math.min(i, 12))); box.classList.remove('anim'); void box.offsetWidth; box.classList.add('anim'); };
// derivados por registro
const rI = new Uint8Array(NR), rC = new Uint8Array(NR), rM = new Uint8Array(NR), rL = new Uint16Array(NR);
A.forEach((a, i) => { a.m = L[a.l].m; a.ix = i; });
for (let k = 0; k < NR; k++) { const a = A[R.a[k]]; rI[k] = a.i === 'C' ? 1 : 0; rC[k] = a.c; rM[k] = a.m; rL[k] = a.l; }
// coleta: amostra do CISAB da Campanha 1 no mesmo ponto de medição da UMCQA (mesmo número de amostra na base) é a mesma coleta
{ const tw = new Map(); A.forEach((a, i) => { if (a.i === 'U' && L[a.l].c === 'M') tw.set(a.c + '|' + a.l, i); }); A.forEach((a, i) => { a.col = a.cm && tw.has(a.c + '|' + a.l) ? tw.get(a.c + '|' + a.l) : i; a.tw = a.col !== i ? A[a.col].id : ''; }); }
P.forEach((p, i) => { p.ix = i; });
const MUN = M.map((m, i) => ({ix: i, uf: m[0], n: m[1]}));
const munNome = (i) => MUN[i].n + ' · ' + MUN[i].uf;
// classificação do resultado de um registro
const COR = {'Conforme': 'var(--ok)', 'Não conforme': 'var(--bad)', 'Acima do VMP': 'var(--bad)', 'Quantificado': 'var(--q3)', '< LoQ': 'var(--q2)', '< LoD': 'var(--q1)', '< limite': 'var(--q2)', 'Qualitativo': 'var(--t4)',
  'Sem resultado': 'var(--warn)', 'Não se aplica': 'var(--line)', 'Inconsistente': 'var(--t5)', 'Medido sem referência': 'var(--t3)'};
const ORD_U = ['Conforme', 'Não conforme', 'Sem resultado', 'Não se aplica', 'Inconsistente'];
const ORD_C = ['Acima do VMP', 'Quantificado', '< LoQ', '< limite', '< LoD', 'Qualitativo', 'Sem resultado'];
const rcls = (k) => (rI[k] && R.f[k] === 'A' ? 'Acima do VMP' : RES[R.q[k]]);
const fora = (k) => (rI[k] ? R.f[k] === 'A' : R.q[k] === 1);
const avaliado = (k) => (rI[k] ? R.f[k] !== '' : R.q[k] <= 1);
const arq = (k) => C[rC[k] - 1][rI[k] ? 'arqC' : 'arqU'];
const resTag = (k) => { const c = rcls(k); return el('span', {class: 'res ' + (c === 'Acima do VMP' || c === 'Não conforme' ? 'bad' : c === 'Conforme' ? 'ok' : c === 'Quantificado' ? 'q' : c === 'Sem resultado' || c === 'Inconsistente' ? 'w' : '')}, c); };
const refTxt = (k) => (rI[k] ? (R.x[k] != null ? 'VMP ' + vf(R.x[k]) : P[R.p[k]].vmp.length ? P[R.p[k]].ref.replace('VMP na planilha: ', 'VMP ') : 'sem VMP') : P[R.p[k]].ref.replace(' (Portaria GM/MS nº 888/2021)', ''));
// ===== Estado global e filtros =====
const S = {inst: '', camps: new Set(CS), mun: -1, par: -1, ver: 0};
function passa(k, o) {
  if (!(o && o.noInst) && S.inst && (S.inst === 'C') !== (rI[k] === 1)) return false;
  if (!(o && o.noCamp) && !S.camps.has(rC[k])) return false;
  if (!(o && o.noMun) && S.mun >= 0 && rM[k] !== S.mun) return false;
  if (!(o && o.noPar) && S.par >= 0 && R.p[k] !== S.par) return false;
  return true;
}
function filtra(o, extra) { const out = []; for (let k = 0; k < NR; k++) if (passa(k, o) && (!extra || extra(k))) out.push(k); return out; }
let FR = [];
// resumo de um conjunto de registros
function resumo(ks) {
  const r = {reg: ks.length, regU: 0, regC: 0, concU: 0, concC: 0, amU: new Set(), amC: new Set(), col: new Set(), mun: new Set(), loc: new Set(), med: new Set(), parU: new Set(), parC: new Set(), camps: new Set(), foraU: 0, avU: 0, foraC: 0, avC: 0};
  for (const k of ks) {
    const a = A[R.a[k]];
    if (rI[k]) { r.regC++; if (R.s[k] === 0) r.concC++; r.amC.add(R.a[k]); r.parC.add(R.p[k]); if (R.f[k]) { r.avC++; if (R.f[k] === 'A') r.foraC++; } }
    else { r.regU++; if (R.s[k] === 0) r.concU++; r.amU.add(R.a[k]); r.parU.add(R.p[k]); if (R.q[k] <= 1) { r.avU++; if (R.q[k] === 1) r.foraU++; } }
    r.col.add(a.col); r.mun.add(rM[k]); const lc = L[rL[k]].c; if (lc === 'F') r.loc.add(rL[k]); else if (lc === 'M') r.med.add(rL[k]); r.camps.add(rC[k]);
  }
  r.conc = r.concU + r.concC;
  return r;
}
const agrupa = (ks, fn) => { const m = new Map(); for (const k of ks) { const g = fn(k); let a = m.get(g); if (!a) m.set(g, (a = [])); a.push(k); } return m; };
const mediana = (v) => { if (!v.length) return null; const s = [...v].sort((a, b) => a - b), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
// ===== Componentes =====
const tip = $('#tip');
function dica(e, linhas) {
  tip.replaceChildren(...[].concat(linhas).map((t, i) => (i === 0 ? el('b', {}, t) : el('div', {}, t))));
  tip.hidden = false;
  const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = e.clientY + 16 + tip.offsetHeight > innerHeight ? e.clientY - tip.offsetHeight - 10 : e.clientY + 16;
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = y + 'px';
}
const someDica = () => { tip.hidden = true; };
function conta(e, v, fmt) {
  fmt = fmt || n;
  const de = e.dataset.v == null ? 0 : +e.dataset.v; e.dataset.v = v;
  if (RM.matches || de === v || v == null || Number.isNaN(v)) { e.textContent = fmt(v); return; }
  const t0 = performance.now(), dur = 600, inteiro = Number.isInteger(v) && Number.isInteger(de);
  const passo = (t) => { const x = Math.min(1, (t - t0) / dur), y = 1 - Math.pow(1 - x, 3), c = de + (v - de) * y; e.textContent = fmt(inteiro ? Math.round(c) : c); if (x < 1) requestAnimationFrame(passo); };
  requestAnimationFrame(passo);
}
let accN = 0;
function acc(titulo, corpo, aberto, extra, cls) {
  const id = 'acc' + (++accN);
  const b = el('button', {type: 'button', class: 'acc-h', 'aria-expanded': String(!!aberto), 'aria-controls': id}, typeof titulo === 'string' ? el('span', {class: 'acc-t'}, titulo) : titulo, extra ? el('span', {class: 'acc-x'}, extra) : null, el('span', {class: 'acc-i', 'aria-hidden': 'true'}));
  const inn = el('div', {class: 'acc-in'});
  const w = el('div', {class: 'acc' + (aberto ? ' aberto' : '') + (cls ? ' ' + cls : '')}, b, el('div', {class: 'acc-b', id}, inn));
  let feito = false;
  const monta = () => { if (feito) return; feito = true; inn.append(typeof corpo === 'function' ? corpo() : corpo); };
  if (aberto) monta();
  b.addEventListener('click', () => { monta(); const o = w.classList.toggle('aberto'); b.setAttribute('aria-expanded', String(o)); w.dispatchEvent(new CustomEvent('alterna', {detail: o})); });
  w.abre = () => { if (!w.classList.contains('aberto')) b.click(); };
  w.fecha = () => { if (w.classList.contains('aberto')) b.click(); };
  return w;
}
function exportaCSV(nome, cab, linhas) {
  const esc = (v) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const txt = '﻿' + [cab, ...linhas].map((l) => l.map(esc).join(';')).join('\r\n');
  const a = el('a', {href: URL.createObjectURL(new Blob([txt], {type: 'text/csv;charset=utf-8'})), download: nome.replace(/[^\w\-]+/g, '_') + '.csv'});
  document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
// tabela ordenável com exportação e "mostrar mais"
function tabela(o) {
  const cols = o.cols; let ord = o.ord == null ? null : o.ord, dir = o.dir || -1, lim = o.lim || 60;
  const wrap = el('div', {class: 'tb'});
  const contagem = el('span', {});
  const bar = el('div', {class: 'tb-bar'}, contagem, o.exportar === false ? null : el('button', {type: 'button', class: 'btn', onclick: () => {
    const rows = ordenadas();
    exportaCSV(o.nome || 'dados', cols.map((c) => c.t), rows.map((r) => cols.map((c) => { const v = c.x ? c.x(r) : c.v(r); return typeof v === 'number' ? String(v).replace('.', ',') : v; })));
  }}, 'Exportar CSV'));
  const box = el('div', {class: 'tb-box' + (o.alto ? ' alto' : '')});
  wrap.append(o.barra === false ? '' : bar, box);
  const ordenadas = () => { const rs = [...o.rows]; if (ord != null) { const c = cols[ord]; rs.sort((a, b) => { const x = c.v(a), y = c.v(b); return (x == null) - (y == null) || (typeof x === 'number' && typeof y === 'number' ? (x - y) : String(x).localeCompare(String(y), 'pt-BR')) * dir; }); } return rs; };
  const desenha = (novo) => {
    wrap.querySelectorAll('.mais').forEach((b) => b.remove());
    const rs = ordenadas();
    contagem.textContent = n(rs.length) + ' ' + (o.unid || 'linhas') + (rs.length > lim ? ' · mostrando ' + n(lim) : '');
    const th = cols.map((c, i) => el('th', {class: c.num ? '' : 'l', scope: 'col', 'aria-sort': ord === i ? (dir > 0 ? 'ascending' : 'descending') : null},
      c.sort === false ? c.t : el('button', {type: 'button', onclick: () => { if (ord === i) dir = -dir; else { ord = i; dir = c.num ? -1 : 1; } desenha(true); }}, c.t, el('span', {class: 'ord', 'aria-hidden': 'true'}, ord === i ? (dir > 0 ? '▲' : '▼') : ''))));
    const tb = el('tbody');
    rs.slice(0, lim).forEach((r, j) => {
      const tr = el('tr', {class: (o.onRow ? 'clic' : '') + (o.sel && o.sel(r) ? ' sel' : '') + (novo && j < 40 ? ' novo' : ''), style: novo && j < 40 ? 'animation-delay:' + j * 12 + 'ms' : null, tabindex: o.onRow ? '0' : null});
      for (const c of cols) { const v = c.f ? c.f(r) : c.v(r); tr.append(el('td', {class: (c.num ? '' : 'l') + (c.w ? ' w' : '')}, typeof v === 'number' ? n(v) : v)); }
      if (o.onRow) { tr.addEventListener('click', (e) => { if (!e.target.closest('button,a')) o.onRow(r, tr); }); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') o.onRow(r, tr); }); }
      tb.append(tr);
    });
    const t = el('table', {}, el('thead', {}, el('tr', {}, th)), tb);
    if (o.rodape) t.append(el('tfoot', {}, el('tr', {}, o.rodape.map((v, i) => el('td', {class: cols[i] && cols[i].num ? '' : 'l'}, typeof v === 'number' ? n(v) : v)))));
    box.replaceChildren(t);
    if (rs.length > lim) box.after(el('button', {type: 'button', class: 'btn mais', onclick: (e) => { lim += o.lim || 60; e.target.remove(); desenha(false); }}, 'Mostrar mais ' + n(Math.min(o.lim || 60, rs.length - lim))));
    if (!rs.length) box.replaceChildren(el('div', {class: 'vazio'}, o.vazio || 'Nenhum registro com os filtros atuais.'));
  };
  desenha(true);
  wrap.atualiza = (rows) => { o.rows = rows; wrap.querySelectorAll('.mais').forEach((b) => b.remove()); desenha(true); };
  return wrap;
}
// barra empilhada horizontal clicável
function empilhada(segs, onSeg, alto) {
  const tot = segs.reduce((a, s) => a + s.v, 0);
  const st = el('div', {class: 'st' + (alto ? ' alto' : ''), role: 'img', 'aria-label': segs.map((s) => s.t + ' ' + n(s.v)).join(', ')});
  for (const s of segs) {
    if (!s.v) continue;
    const i = el('i', {style: 'background:' + s.cor, tabindex: onSeg ? '0' : null, role: onSeg ? 'button' : null, 'aria-label': s.t + ': ' + n(s.v)});
    i.dataset.w = (100 * s.v / (tot || 1)).toFixed(3);
    i.addEventListener('pointermove', (e) => dica(e, [s.t, n(s.v) + ' (' + pcs(s.v, tot) + ')', onSeg ? 'Clique para ver os registros' : '']));
    i.addEventListener('pointerleave', someDica);
    if (onSeg) { i.addEventListener('click', () => onSeg(s)); i.addEventListener('keydown', (e) => { if (e.key === 'Enter') onSeg(s); }); }
    st.append(i);
  }
  requestAnimationFrame(() => requestAnimationFrame(() => st.querySelectorAll('i').forEach((i) => { i.style.width = i.dataset.w + '%'; })));
  return st;
}
const legenda = (itens) => el('div', {class: 'leg'}, itens.map(([t, c]) => el('span', {}, el('i', {style: 'background:' + c}), t)));
// colunas agrupadas (SVG) com atualização animada por chave
function colunas(box, o) {
  const W = 540, H = o.h || 240, ml = 48, mb = 30, mt = 26;
  if (!box._svg) {
    const svg = sv('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'group'});
    svg.append(sv('g', {class: 'grid'}), sv('g', {class: 'barras'}), sv('g', {class: 'lbl'}), sv('g', {class: 'cats'}));
    box.replaceChildren(svg, el('div', {class: 'leg'})); box._svg = svg; box._r = new Map(); box._t = new Map();
  }
  box._o = o;
  const svg = box._svg, [gG, gB, gL, gC] = svg.children;
  const vals = o.cats.map((c) => o.series.map((s) => o.val(c, s) || 0));
  const max = Math.max(1e-9, ...vals.flat());
  const pw = Math.pow(10, Math.floor(Math.log10(max))), top = (Math.ceil(max / pw * 2) / 2) * pw;
  const y = (v) => H - mb - ((H - mb - mt) * v) / top;
  const fmt = o.fmt || n;
  gG.replaceChildren(); for (let k = 0; k <= 4; k++) { const v = (top * k) / 4; gG.append(sv('line', {x1: ml, x2: W - 4, y1: y(v), y2: y(v)})); const t = sv('text', {x: ml - 6, y: y(v) + 4, 'text-anchor': 'end'}); t.textContent = fmt(v); gG.append(t); }
  const gw = (W - ml - 8) / o.cats.length, ns = o.series.length, bw = Math.min(46, (gw * 0.72) / ns);
  const vivos = new Set();
  gC.replaceChildren();
  o.cats.forEach((c, i) => {
    const cx = ml + gw * i + gw / 2;
    const tc = sv('text', {x: cx, y: H - mb + 17, 'text-anchor': 'middle'}); tc.textContent = c.t; gC.append(tc);
    o.series.forEach((s, j) => {
      const key = c.k + '|' + s.k, v = vals[i][j], x = cx - (ns * bw + (ns - 1) * 4) / 2 + j * (bw + 4), yy = y(v), hh = H - mb - yy;
      vivos.add(key);
      let r = box._r.get(key);
      if (!r) {
        r = sv('rect', {class: 'bar', rx: 2, x, y: H - mb, width: bw, height: 0, tabindex: '0', role: 'button'});
        r.style.cssText = 'x:' + x + 'px;y:' + (H - mb) + 'px;width:' + bw + 'px;height:0px';
        r.addEventListener('pointermove', (e) => { const d = r._d; dica(e, (box._o.tip ? box._o.tip(d.c, d.s, d.v) : [d.c.t + ' · ' + d.s.t, fmt(d.v)]).concat(box._o.onClick ? ['Clique para detalhar'] : [])); });
        r.addEventListener('pointerleave', someDica);
        const ac = () => box._o.onClick && box._o.onClick(r._d.c, r._d.s);
        r.addEventListener('click', ac); r.addEventListener('keydown', (e) => { if (e.key === 'Enter') ac(); });
        gB.append(r); box._r.set(key, r);
        r.getBoundingClientRect();
      }
      r._d = {c, s, v};
      r.setAttribute('fill', s.cor); r.setAttribute('aria-label', c.t + ', ' + s.t + ': ' + fmt(v));
      r.setAttribute('x', x); r.setAttribute('y', yy); r.setAttribute('width', bw); r.setAttribute('height', Math.max(0, hh));
      const apl = () => { r.style.cssText = 'x:' + x + 'px;y:' + yy + 'px;width:' + bw + 'px;height:' + Math.max(v ? 1 : 0, hh) + 'px'; r.style.opacity = o.sel && !o.sel(c, s) ? '.28' : '1'; };
      requestAnimationFrame(apl);
      let t = box._t.get(key);
      if (!t) { t = sv('text', {x: 0, y: 0, 'text-anchor': 'middle', class: 'v'}); t.style.transform = 'translate(' + (x + bw / 2) + 'px,' + (H - mb - 4) + 'px)'; gL.append(t); box._t.set(key, t); t.getBoundingClientRect(); }
      t.textContent = o.rot === false ? '' : fmt(v);
      requestAnimationFrame(() => { t.style.transform = 'translate(' + (x + bw / 2) + 'px,' + (yy - 5) + 'px)'; t.style.opacity = o.sel && !o.sel(c, s) ? '.35' : '1'; });
    });
  });
  for (const [k, r] of box._r) if (!vivos.has(k)) { r.remove(); box._r.delete(k); const t = box._t.get(k); if (t) { t.remove(); box._t.delete(k); } }
  box.lastChild.replaceChildren(...o.series.map((s) => el('span', {}, el('i', {style: 'background:' + s.cor}), s.t)));
  svg.setAttribute('aria-label', o.titulo || 'Gráfico de colunas');
}
const SER_I = [{k: 'U', t: 'UMCQA', cor: 'var(--u)'}, {k: 'C', t: 'CISAB', cor: 'var(--c)'}];
const serAtivas = () => SER_I.filter((s) => !S.inst || s.k === S.inst);
// pontos de campanha (1 a 4) coloridos por instituição
function dots(fn) { return el('span', {class: 'dots'}, CS.map((c) => { const [u, k] = fn(c); return el('i', {class: u && k ? 'uc' : u ? 'u' : k ? 'c' : '', title: 'Campanha ' + c + ': ' + (u && k ? 'UMCQA e CISAB' : u ? 'UMCQA' : k ? 'CISAB' : 'sem registro')}, String(c)); })); }
// ===== Painel lateral =====
const dr = $('#drawer'), ov = $('#overlay'); let drFoco = null; const drPilha = [];
function abreDrawer(titulo, sub, build, empilha) {
  if (!dr.hidden && empilha) drPilha.push([$('#dr-t').textContent, $('#dr-s').textContent, dr._build]); else if (dr.hidden) { drPilha.length = 0; drFoco = document.activeElement; }
  $('#dr-vol').hidden = !drPilha.length;
  $('#dr-t').textContent = titulo; $('#dr-s').textContent = sub || ''; dr._build = build;
  const b = $('#dr-b'); b.replaceChildren(el('div', {class: 'skel', style: 'width:60%'}), el('div', {class: 'skel'}), el('div', {class: 'skel', style: 'width:80%'})); b.scrollTop = 0;
  if (dr.hidden) { dr.hidden = false; ov.hidden = false; document.body.style.overflow = 'hidden'; requestAnimationFrame(() => requestAnimationFrame(() => { dr.classList.add('aberto'); ov.classList.add('aberto'); })); }
  document.body.classList.add('carregando');
  setTimeout(() => { b.replaceChildren(); build(b); anima(b); document.body.classList.remove('carregando'); }, RM.matches ? 0 : 160);
  setTimeout(() => $('#dr-x').focus({preventScroll: true}), 50);
}
function fechaDrawer() {
  if (dr.hidden) return;
  dr.classList.remove('aberto'); ov.classList.remove('aberto'); document.body.style.overflow = '';
  setTimeout(() => { dr.hidden = true; ov.hidden = true; }, RM.matches ? 0 : 320);
  if (drFoco && drFoco.isConnected) drFoco.focus({preventScroll: true});
  if (/\/(municipios|parametros)\/\d+/.test(location.hash)) history.replaceState(null, '', location.hash.replace(/\/\d+$/, ''));
}
$('#dr-x').addEventListener('click', fechaDrawer); ov.addEventListener('click', fechaDrawer);
$('#dr-vol').addEventListener('click', () => { const [t, s, b] = drPilha.pop(); abreDrawer(t, s, b, false); $('#dr-vol').hidden = !drPilha.length; });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !dr.hidden) fechaDrawer();
  if (e.key === 'Tab' && !dr.hidden) { const f = $$('button,a[href],select,input,[tabindex="0"]', dr).filter((x) => x.offsetParent); if (!f.length) return; if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); } }
});
