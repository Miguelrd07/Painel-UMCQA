// ===== 4. Parâmetros Monitorados =====
const KS_PAR = P.map(() => []); for (let k = 0; k < NR; k++) KS_PAR[R.p[k]].push(k);
const CAMPS_PAR = P.map((p) => [...new Set(KS_PAR[p.ix].map((k) => rC[k]))].sort());
const pIx = (nome, i) => P.findIndex((p) => p.n === nome && p.i === i);
const LIM_U = {'Turbidez': [5], 'Cloro residual livre': [0.2, 5], 'pH': [6, 9]};
// matriz de correspondência entre UMCQA e CISAB (verificada por nome, unidade, método e referência)
const MATRIZ = [
  {cat: 'Equivalentes', u: [], c: [], txt: 'Nenhum par: nenhum parâmetro tem o mesmo nome e a mesma unidade nas duas instituições. A UMCQA mede 5 parâmetros básicos em campo e o CISAB analisa outros parâmetros em laboratório.'},
  {cat: 'Semelhantes que precisam de validação', u: [], c: ['Odor', 'Gosto e odor'], txt: 'Dois parâmetros do CISAB com nomes parecidos e mantidos separados. "Odor" (Campanha 1) tem referência "não objetável"; "Gosto e odor" (outras campanhas) tem VMP 6 e método SMWW 2170 B. Só devem ser unificados se o laboratório confirmar que é o mesmo ensaio.'},
  {cat: 'Semelhantes que precisam de validação', u: [], c: ['1,2 Dicloreto (como na planilha)'], txt: 'Nome incompleto na planilha da Campanha 1 ("1,2 dicloreto"), sem unidade. Pode corresponder a um composto já listado em outra campanha, mas sem unidade e método não é possível confirmar; foi mantido como está na planilha.'},
  {cat: 'Relacionados, não equivalentes', u: ['Cloro residual livre'], c: ['Trihalometanos', 'Ácidos haloacéticos total', 'Clorito', 'Bromato'], txt: 'Todos têm relação com a desinfecção, mas medem substâncias diferentes: o cloro residual é o desinfetante presente na água; os demais são subprodutos formados por ela. Não são comparáveis entre si.'},
  {cat: 'Relacionados, não equivalentes', u: ['Turbidez'], c: ['Sólidos dissolvidos totais'], txt: 'Turbidez (uT) mede partículas em suspensão por método óptico; sólidos dissolvidos totais (mg/L) mede o material dissolvido. Unidades e grandezas diferentes: não comparáveis.'}];
const relacao = (pi) => { const p = P[pi]; return MATRIZ.filter((m) => (p.i === 'U' ? m.u : m.c).includes(p.n)); };
V.parametros = (() => {
  let desc, kp, tb, q = '', grupo = '', soFora = false;
  function init(s) {
    desc = el('p', {});
    kp = el('div', {class: 'kpis'});
    tb = el('div', {});
    const grupos = [...new Set(P.map((p) => p.g))].sort();
    const busca = el('input', {type: 'search', placeholder: 'Buscar parâmetro ou nome original', 'aria-label': 'Buscar parâmetro', oninput: (e) => { q = semAc(e.target.value.trim()); desenha(); }});
    const sg = el('select', {'aria-label': 'Grupo', onchange: (e) => { grupo = e.target.value; desenha(); }}, el('option', {value: ''}, 'Todos os grupos'), grupos.map((g) => el('option', {value: g}, g)));
    const sf = el('label', {style: 'font-size:13px;display:inline-flex;gap:6px;align-items:center'}, el('input', {type: 'checkbox', onchange: (e) => { soFora = e.target.checked; desenha(); }}), 'Só com resultado fora da referência');
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Parâmetros Monitorados'), desc)), kp,
      el('div', {class: 'card mt'}, el('h3', {}, 'Inventário de parâmetros'), el('p', {class: 's'}, 'Todos os parâmetros distintos encontrados nas planilhas originais. Clique num parâmetro para ver campanhas, municípios, localidades, distribuição dos resultados e histórico.'),
        el('div', {style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px'}, busca, sg, sf), tb),
      matriz());
  }
  let base = [];
  function desenha() {
    const ks = base.filter((k) => { const p = P[R.p[k]]; return (!grupo || p.g === grupo) && (!q || semAc(p.n + ' ' + p.o.join(' ')).includes(q)); });
    const rows = soFora ? ks.filter((k) => fora(k)) : ks;
    const keep = soFora ? new Set(rows.map((k) => R.p[k])) : null;
    tb.replaceChildren(tabParametros(keep ? ks.filter((k) => keep.has(R.p[k])) : ks, {ord: 1, lim: 120}));
  }
  function render() {
    base = filtra({noPar: true});
    desc.textContent = 'Inventário feito nas planilhas originais: ' + P.length + ' parâmetros distintos (UMCQA ' + P.filter((p) => p.i === 'U').length + ', CISAB ' + P.filter((p) => p.i === 'C').length + '), sem misturar parâmetros de nomes parecidos. ' + descFiltros({noPar: true}) + '.';
    const r = resumo(base), ps = [...r.parU, ...r.parC];
    const vals = [['Parâmetros na seleção', ps.length, 'UMCQA ' + r.parU.size + ' · CISAB ' + r.parC.size],
      ['Com grafias diferentes', ps.filter((p) => P[p].o.length > 1).length, 'nomes unificados entre os arquivos'],
      ['Nas 4 campanhas', ps.filter((p) => CAMPS_PAR[p].length === 4).length, 'considerando todas as planilhas'],
      ['Só na Campanha 1', ps.filter((p) => CAMPS_PAR[p].length === 1 && CAMPS_PAR[p][0] === 1).length, 'todos do CISAB'],
      ['Com resultado fora da referência', new Set(base.filter(fora).map((k) => R.p[k])).size, 'na seleção atual'],
      ['Sem VMP na planilha', ps.filter((p) => P[p].i === 'C' && !P[p].vmp.length).length, 'CISAB; não são classificados']];
    if (!kp.children.length) { vals.forEach(([l]) => kp.append(el('div', {class: 'kpi'}, el('div', {class: 'l'}, l), el('div', {class: 'v'}, '0'), el('div', {class: 'd'})))); anima(kp); }
    [...kp.children].forEach((d, i) => { conta($('.v', d), vals[i][1]); $('.d', d).textContent = vals[i][2]; });
    desenha();
  }
  function matriz() {
    return el('div', {class: 'mt'},
      acc('Matriz de correspondência UMCQA x CISAB', () => {
        const chipsDe = (nomes, i) => el('div', {class: 'pchips'}, nomes.length ? nomes.map((nm) => { const pi = pIx(nm, i); return pi >= 0 ? el('button', {type: 'button', class: 'pchip', onclick: () => abrePar(pi)}, nm + (P[pi].u ? ' (' + P[pi].u + ')' : '')) : nm; }) : el('span', {class: 'muted'}, '–'));
        const pU = P.filter((p) => p.i === 'U'), pC = P.filter((p) => p.i === 'C'), gC = agrupa(pC, (p) => p.g);
        return el('div', {},
          el('p', {class: 's', style: 'margin:0 0 8px'}, 'Dois parâmetros só são considerados equivalentes se nome, unidade e método forem compatíveis. Nomes parecidos não bastam.'),
          el('div', {class: 'tb-box'}, el('table', {}, el('thead', {}, el('tr', {}, ['Classificação', 'UMCQA', 'CISAB', 'Justificativa'].map((t) => el('th', {class: 'l'}, t)))),
            el('tbody', {}, MATRIZ.map((m) => el('tr', {}, el('td', {class: 'l'}, el('b', {}, m.cat)), el('td', {class: 'l w', style: 'min-width:150px'}, chipsDe(m.u, 'U')), el('td', {class: 'l w', style: 'min-width:200px'}, chipsDe(m.c, 'C')), el('td', {class: 'l w', style: 'min-width:280px;font-size:12.5px'}, m.txt)))),
            el('tbody', {}, el('tr', {}, el('td', {class: 'l'}, el('b', {}, 'Exclusivos da UMCQA (' + pU.length + ')')), el('td', {class: 'l w'}, chipsDe(pU.map((p) => p.n), 'U')), el('td', {class: 'l'}, '–'), el('td', {class: 'l w', style: 'font-size:12.5px'}, 'Medidos em campo pela UMCQA; referência: Portaria GM/MS nº 888/2021.')),
              el('tr', {}, el('td', {class: 'l'}, el('b', {}, 'Exclusivos do CISAB (' + pC.length + ')')), el('td', {class: 'l'}, '–'), el('td', {class: 'l w', colspan: 2}, [...gC].sort().map(([g, ps]) => el('div', {style: 'margin:4px 0'}, el('div', {class: 'muted', style: 'font-size:12px'}, g + ' (' + ps.length + ')'), chipsDe(ps.map((p) => p.n).sort((a, b) => a.localeCompare(b, 'pt-BR')), 'C')))))))));
      }, true, '5 UMCQA · 97 CISAB · 0 equivalentes'),
      acc('Grafias unificadas entre os arquivos', () => tabela({nome: 'grafias_parametros', unid: 'parâmetros', lim: 100, ord: 0, dir: 1, rows: P.filter((p) => p.o.length > 1), onRow: (p) => abrePar(p.ix), cols: [
        {t: 'Parâmetro no painel', v: (p) => p.n, f: (p) => el('b', {}, p.n)}, {t: 'Instituição', v: (p) => INS[p.i]}, {t: 'Nomes nas planilhas', v: (p) => p.o.join(' | '), w: 1}, {t: 'Unidade', v: (p) => p.u || '–'}, {t: 'Campanhas', v: (p) => CAMPS_PAR[p.ix].join(', ')}]}),
      false, n(P.filter((p) => p.o.length > 1).length) + ' parâmetros'));
  }
  return {init, render, sub: (pi) => { if (P[+pi]) abrePar(+pi); }};
})();
// histograma dos valores quantificados, com a referência
function histograma(vals, refs, un) {
  const box = el('div', {class: 'chart hist'});
  if (vals.length < 2) { box.append(el('p', {class: 'fonte'}, vals.length ? 'Um único valor quantificado: ' + vf(vals[0]) + ' ' + un : 'Sem valores numéricos quantificados para montar a distribuição.')); return box; }
  const pos = vals.filter((v) => v > 0), mn = Math.min(...vals), mx = Math.max(...vals);
  const log = mn > 0 && mx / mn > 50;
  const f = log ? Math.log10 : (v) => v, fi = log ? (v) => Math.pow(10, v) : (v) => v;
  const a = f(log ? Math.min(...pos) : mn), b = f(mx) + (mx === mn ? 1 : 0), nb = Math.min(14, Math.max(4, Math.ceil(Math.sqrt(vals.length)))), w = (b - a) / nb || 1;
  const bins = Array(nb).fill(0); for (const v of vals) bins[Math.min(nb - 1, Math.max(0, Math.floor((f(v) - a) / w)))]++;
  const W = 540, H = 200, ml = 40, mb = 34, mt = 14, bw = (W - ml - 8) / nb, top = Math.max(...bins);
  const svg = sv('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Distribuição de ' + vals.length + ' valores'});
  svg.append(sv('line', {x1: ml, x2: W - 4, y1: H - mb, y2: H - mb, stroke: 'var(--line)'}));
  bins.forEach((c, i) => {
    const h = ((H - mb - mt) * c) / top, x = ml + i * bw, lo = fi(a + i * w), hi = fi(a + (i + 1) * w);
    const r = sv('rect', {x: x + 1, y: H - mb - h, width: Math.max(1, bw - 2), height: h, rx: 2, fill: 'var(--q3)', style: 'animation-delay:' + i * 25 + 'ms'});
    r.addEventListener('pointermove', (e) => dica(e, [vf(lo) + ' a ' + vf(hi) + ' ' + un, n(c) + ' resultados'])); r.addEventListener('pointerleave', someDica);
    svg.append(r);
    if (i % Math.ceil(nb / 6) === 0) { const t = sv('text', {x, y: H - mb + 14, 'text-anchor': 'start'}); t.textContent = vf(+lo.toPrecision(2)); svg.append(t); }
  });
  for (const rf of refs) { const xv = f(rf); if (xv < a || xv > b) continue; const x = ml + ((xv - a) / (b - a)) * (W - ml - 8); svg.append(sv('line', {x1: x, x2: x, y1: mt - 4, y2: H - mb, stroke: 'var(--bad)', 'stroke-dasharray': '4 3', 'stroke-width': 1.5})); const t = sv('text', {x: x + 4, y: mt + 6}); t.textContent = 'ref. ' + vf(rf); t.setAttribute('fill', 'var(--bad)'); svg.append(t); }
  const tt = sv('text', {x: W - 4, y: H - 4, 'text-anchor': 'end'}); tt.textContent = (log ? 'escala logarítmica · ' : '') + (un || 'valor'); svg.append(tt);
  box.append(svg);
  return box;
}
// painel lateral de um parâmetro
function abrePar(pi, empilha) {
  const p = P[pi];
  abreDrawer(p.n, INS[p.i] + ' · ' + p.g + (p.u ? ' · ' + p.u : ''), (b) => {
    const ks = KS_PAR[pi].filter((k) => passa(k, {noInst: true, noPar: true})), r = resumo(ks);
    b.append(el('div', {class: 'mk'}, [['Registros', r.reg], ['Amostras', r.amU.size + r.amC.size], ['Análises concluídas', r.conc], ['Municípios', r.mun.size], ['Localidades', r.loc.size], ['Fora da referência', r.foraU + r.foraC]].map(([l, v]) => { const e = el('div', {class: 'v'}, '0'); conta(e, v); return el('div', {}, e, el('div', {class: 'l'}, l)); })));
    const rel = relacao(pi);
    b.append(el('div', {class: 'nota'}, el('div', {}, el('b', {}, 'Referência: '), p.ref),
      p.met.length ? el('div', {}, el('b', {}, 'Método: '), p.met.join('; ')) : '', el('div', {}, el('b', {}, 'Nomes nas planilhas: '), p.o.join(' | ')),
      el('div', {}, el('b', {}, 'Campanhas com o parâmetro: '), CAMPS_PAR[pi].join(', ')), el('div', {class: 'muted', style: 'font-size:12.5px'}, descFiltros({noInst: true, noPar: true}))));
    b.append(el('div', {class: 'acoes'}, el('button', {type: 'button', class: 'btn pri', onclick: () => { S.par = pi; if (S.inst && S.inst !== p.i) S.inst = ''; atualiza(); fechaDrawer(); }}, 'Filtrar o painel por este parâmetro')));
    if (!ks.length) { b.append(el('div', {class: 'vazio'}, 'Sem registros deste parâmetro com os filtros atuais.')); return; }
    // 1 e 7. campanhas e histórico
    let tReg = null, campSel = 0;
    const accReg = acc('6 · Registros', () => { tReg = tabRegistros(ks, {nome: 'registros_' + p.n, sem: ['Parâmetro']}); return tReg; }, false, n(ks.length));
    const chc = el('div', {class: 'chart'});
    const porC = CS.map((c) => { const z = ks.filter((k) => rC[k] === c), num = z.filter((k) => R.v[k] != null && (rI[k] ? R.q[k] === 8 : R.q[k] <= 2)).map((k) => R.v[k]); return {c, z, r: resumo(z), num}; });
    b.append(acc('1 · Campanhas e histórico', () => {
      setTimeout(() => colunas(chc, {cats: CS.map((c) => ({k: c, t: 'Campanha ' + c})), series: [{k: 'reg', t: 'Registros', cor: 'var(--q2)'}, {k: 'conc', t: 'Análises concluídas', cor: p.i === 'U' ? 'var(--u)' : 'var(--c)'}, {k: 'fora', t: 'Fora da referência', cor: 'var(--bad)'}],
        val: (c, s) => { const x = porC[c.k - 1].r; return s.k === 'reg' ? x.reg : s.k === 'conc' ? x.conc : x.foraU + x.foraC; }, h: 220, sel: (c) => !campSel || c.k === campSel,
        onClick: (c) => { campSel = campSel === c.k ? 0 : c.k; accReg.abre(); tReg && tReg.atualiza(campSel ? ks.filter((k) => rC[k] === campSel) : ks); chc._o.sel = (cc) => !campSel || cc.k === campSel; colunas(chc, chc._o); infoC.textContent = campSel ? 'A tabela "Registros" abaixo mostra só a Campanha ' + campSel + ' · clique de novo para ver todas.' : ''; }}), 30);
      const infoC = el('p', {class: 'fonte'});
      return el('div', {}, chc, infoC, tabela({nome: 'historico_' + p.n, unid: 'campanhas', barra: false, lim: 4, ord: 0, dir: 1, rows: porC, cols: [
        {t: 'Campanha', v: (x) => x.c, f: (x) => 'Campanha ' + x.c}, {t: 'Registros', num: 1, v: (x) => x.r.reg}, {t: 'Concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size},
        {t: 'Municípios', num: 1, v: (x) => x.r.mun.size}, {t: 'Valores numéricos', num: 1, v: (x) => x.num.length}, {t: 'Mediana', num: 1, v: (x) => mediana(x.num), f: (x) => vf(mediana(x.num))}, {t: 'Máximo', num: 1, v: (x) => (x.num.length ? Math.max(...x.num) : null), f: (x) => vf(x.num.length ? Math.max(...x.num) : null)},
        {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)}]}));
    }, true, CAMPS_PAR[pi].length + ' campanhas'));
    // 5. distribuição
    b.append(acc('2 · Distribuição dos resultados', () => {
      const cnt = new Map(); for (const k of ks) { const c = rcls(k); cnt.set(c, (cnt.get(c) || 0) + 1); }
      const ordem = p.i === 'U' ? [...ORD_U, 'Medido sem referência'] : ORD_C, segs = ordem.filter((c) => cnt.get(c)).map((c) => ({t: c, v: cnt.get(c), cor: COR[c]}));
      const num = ks.filter((k) => R.v[k] != null && (rI[k] ? R.q[k] === 8 : R.q[k] <= 2)).map((k) => R.v[k]);
      const refs = p.i === 'U' ? (LIM_U[p.n] || []) : [...new Set(ks.map((k) => R.x[k]).filter((x) => x != null))];
      const cat = p.i === 'U' && !LIM_U[p.n] ? (() => { const m2 = new Map(); for (const k of ks) { const s = STR[R.r[k]] || '(vazio)'; m2.set(s, (m2.get(s) || 0) + 1); } return el('div', {class: 'hb mt'}, [...m2].sort((a, c) => c[1] - a[1]).map(([t, v]) => el('div', {class: 'hb-r'}, el('span', {class: 't'}, t), el('div', {class: 'st'}, el('i', {style: 'background:var(--q3);width:' + (100 * v / ks.length) + '%'})), el('span', {class: 'v'}, n(v))))); })() : '';
      return el('div', {}, empilhada(segs, (sg) => { accReg.abre(); tReg.atualiza(ks.filter((k) => rcls(k) === sg.t)); accReg.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'start'}); }, true), el('div', {class: 'leg'}, segs.map((s) => el('span', {}, el('i', {style: 'background:' + s.cor}), s.t + ' ' + n(s.v)))),
        cat, el('h4', {class: 'h4', style: 'margin-top:12px'}, 'Valores quantificados' + (num.length ? ' (' + n(num.length) + ')' : '')), histograma(num, refs, p.u),
        el('p', {class: 'fonte'}, p.i === 'C' ? 'Só entram no histograma os resultados quantificados; "< LoD" e "< LoQ" aparecem na barra acima. Linha tracejada: VMP da planilha.' : 'Linha tracejada: limite da Portaria GM/MS nº 888/2021.'));
    }, true));
    b.append(acc('3 · Municípios com resultados', () => tabela({nome: 'municipios_' + p.n, unid: 'municípios', lim: 40, ord: 2, rows: porGrupo(ks, (k) => rM[k]), onRow: (x) => selecionaMun(x.k), cols: [
      {t: 'Município', v: (x) => MUN[x.k].n}, {t: 'UF', v: (x) => MUN[x.k].uf}, {t: 'Registros', num: 1, v: (x) => x.r.reg}, {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size}, {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)},
      {t: 'Máximo', num: 1, v: (x) => { const v = x.ks.filter((k) => R.v[k] != null).map((k) => R.v[k]); return v.length ? Math.max(...v) : null; }, f: (x) => { const v = x.ks.filter((k) => R.v[k] != null).map((k) => R.v[k]); return vf(v.length ? Math.max(...v) : null); }},
      {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)}]}), false, n(r.mun.size)));
    b.append(acc('4 · Localidades com registros', () => tabela({nome: 'localidades_' + p.n, unid: 'localidades e pontos', lim: 50, ord: 4, rows: porGrupo(ks, (k) => rL[k]), onRow: (x) => { fechaDrawer(); ir('localidades', x.k); }, cols: [
      {t: 'Localidade ou ponto', v: (x) => L[x.k].n, w: 1}, {t: 'Município', v: (x) => MUN[L[x.k].m].n}, {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)}, {t: 'Registros', num: 1, v: (x) => x.r.reg},
      {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)}, {t: 'Último resultado', v: (x) => { const k = x.ks.reduce((a, c) => (rC[c] >= rC[a] ? c : a)); return STR[R.r[k]] + ' (C' + rC[k] + ')'; }}]}), false, n(r.loc.size + r.med.size)));
    b.append(acc('5 · Comparação UMCQA x CISAB', () => el('div', {}, rel.length ? rel.map((m) => el('div', {class: 'nota'}, el('b', {}, m.cat + ': '), [...m.u.map((x) => x + ' (UMCQA)'), ...m.c.map((x) => x + ' (CISAB)')].join(', '), el('div', {}, m.txt)))
      : el('div', {class: 'nota'}, el('b', {}, 'Sem parâmetro equivalente na ' + (p.i === 'U' ? 'CISAB' : 'UMCQA') + '. '), 'Este parâmetro só é analisado pela ' + INS[p.i] + '; não há resultado da outra instituição para comparar.'))));
    b.append(accReg);
  }, empilha);
}
