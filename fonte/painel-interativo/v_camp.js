// ===== 6. Comparativo entre Campanhas =====
V.campanhas = (() => {
  let desc, tg, aviso, tMet, ch, met = 'col', mSel, pres, presF = '', parSel, chP, tP, drill, sel = new Set(CS), parAtual = -1;
  const MET = {
    mun: ['Municípios atendidos', (z) => new Set(z.map((k) => rM[k])).size], loc: ['Localidades atendidas', (z) => new Set(z.filter((k) => L[rL[k]].c === 'F').map((k) => rL[k])).size],
    col: ['Amostras (coletas)', (z) => new Set(z.map((k) => A[R.a[k]].col)).size], am: ['Amostras analisadas', (z) => new Set(z.map((k) => R.a[k])).size],
    an: ['Análises concluídas', (z) => z.filter((k) => R.s[k] === 0).length], par: ['Parâmetros utilizados', (z) => new Set(z.map((k) => R.p[k])).size],
    fora: ['Resultados fora da referência', (z) => z.filter(fora).length]};
  function init(s) {
    desc = el('p', {}); tg = el('div', {class: 'toggles', role: 'group', 'aria-label': 'Campanhas comparadas'}); aviso = el('div', {});
    tMet = el('div', {}); ch = el('div', {class: 'chart'}); pres = el('div', {}); chP = el('div', {class: 'chart'}); tP = el('div', {}); drill = el('div', {});
    mSel = el('select', {'aria-label': 'Indicador', onchange: () => { met = mSel.value; graf(); }}, Object.entries(MET).filter(([k]) => k !== 'col').map(([k, [t]]) => el('option', {value: k}, t)));
    mSel.value = 'am'; met = 'am';
    parSel = el('select', {'aria-label': 'Parâmetro', onchange: () => { parAtual = +parSel.value; porPar(); }});
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Comparativo entre Campanhas'), desc)),
      el('div', {class: 'card'}, el('div', {class: 'h4'}, 'Campanhas comparadas (escolha duas ou mais)'), tg, aviso, el('div', {class: 'mt'}, tMet)), drill,
      el('div', {class: 'g2 mt'}, el('div', {class: 'card'}, el('div', {style: 'display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center'}, el('h3', {}, 'Indicador por campanha'), mSel), el('p', {class: 's'}, 'UMCQA e CISAB em colunas separadas · clique numa coluna para detalhar'), ch),
        el('div', {class: 'card'}, el('div', {style: 'display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center'}, el('h3', {}, 'Resultados por parâmetro'), parSel), el('p', {class: 's'}, 'Percentual fora da referência em cada campanha'), chP, tP)),
      el('div', {class: 'card mt'}, el('h3', {}, 'Municípios atendidos em cada campanha'), el('p', {class: 's'}, 'Quem participou de todas as campanhas selecionadas e quem participou só de algumas · clique num município para a análise detalhada'), pres));
  }
  let ks = [];
  const cats = () => CS.filter((c) => sel.has(c)).map((c) => ({k: c, t: 'Campanha ' + c}));
  function graf() {
    const g = agrupa(ks, (k) => rC[k] + '|' + rI[k]);
    colunas(ch, {cats: cats(), series: serAtivas(), val: (c, s) => MET[met][1](g.get(c.k + '|' + (s.k === 'C' ? 1 : 0)) || []), titulo: MET[met][0],
      onClick: (c, s) => { const z = g.get(c.k + '|' + (s.k === 'C' ? 1 : 0)) || []; painelDrill(drill, MET[met][0] + ' · Campanha ' + c.k + ' · ' + s.t, met === 'am' ? tabAmostras(z) : met === 'mun' ? tabMunicipios(z) : met === 'loc' ? tabLocalidades(z) : met === 'fora' ? tabRegistros(z.filter(fora)) : tabParametros(met === 'an' ? z.filter((k) => R.s[k] === 0) : z, {lim: 100})); }});
  }
  function porPar() {
    const z = ks.filter((k) => R.p[k] === parAtual), p = P[parAtual];
    const por = cats().map((c) => { const y = z.filter((k) => rC[k] === c.k), num = y.filter((k) => R.v[k] != null && (rI[k] ? R.q[k] === 8 : R.q[k] <= 2)).map((k) => R.v[k]), av = y.filter(avaliado).length, fo = y.filter(fora).length; return {c: c.k, y, num, av, fo}; });
    colunas(chP, {cats: cats(), series: [{k: p.i, t: p.n + ' · % fora da referência', cor: p.i === 'U' ? 'var(--u)' : 'var(--c)'}], val: (c) => { const x = por.find((q) => q.c === c.k); return x && x.av ? (100 * x.fo) / x.av : 0; }, fmt: (v) => p1(v) + '%', h: 200,
      tip: (c) => { const x = por.find((q) => q.c === c.k); return [c.t + ' · ' + p.n, x.av ? n(x.fo) + ' de ' + n(x.av) + ' resultados avaliados fora da referência' : 'Sem resultados avaliados']; },
      onClick: (c) => { const x = por.find((q) => q.c === c.k); painelDrill(drill, p.n + ' · Campanha ' + c.k, tabRegistros(x.y, {nome: p.n + '_C' + c.k, sem: ['Parâmetro']})); }});
    tP.replaceChildren(tabela({nome: 'parametro_' + p.n, unid: 'campanhas', barra: false, lim: 4, ord: 0, dir: 1, rows: por, cols: [
      {t: 'Campanha', v: (x) => x.c, f: (x) => 'C' + x.c}, {t: 'Registros', num: 1, v: (x) => x.y.length}, {t: 'Avaliados', num: 1, v: (x) => x.av}, {t: 'Fora', num: 1, v: (x) => x.fo},
      {t: 'Mediana', num: 1, v: (x) => mediana(x.num), f: (x) => vf(mediana(x.num))}, {t: 'Máximo', num: 1, v: (x) => (x.num.length ? Math.max(...x.num) : null), f: (x) => vf(x.num.length ? Math.max(...x.num) : null)}]}),
      el('p', {class: 'fonte'}, 'Referência: ' + p.ref + (p.u ? ' · unidade: ' + p.u : '') + '.'));
  }
  function render() {
    if (S.camps.size >= 2 && !render.feito) { sel = new Set(S.camps); }
    render.feito = 1;
    ks = filtra({noCamp: true}).filter((k) => sel.has(rC[k]));
    desc.textContent = 'Escolha as campanhas a comparar; os gráficos e tabelas mudam na hora. ' + descFiltros({noCamp: true}) + ' (a escolha de campanhas desta área é independente do filtro do topo).';
    tg.replaceChildren(...CS.map((c) => el('button', {type: 'button', class: 'tg', 'aria-pressed': String(sel.has(c)), onclick: () => {
      if (sel.has(c) && sel.size <= 2) { aviso.replaceChildren(el('div', {class: 'aviso'}, 'Mantenha ao menos duas campanhas para comparar.')); return; }
      sel.has(c) ? sel.delete(c) : sel.add(c); aviso.replaceChildren(); document.body.classList.add('carregando'); setTimeout(() => { render(); document.body.classList.remove('carregando'); }, 60); }}, 'Campanha ' + c)));
    // tabela de indicadores
    const cs = cats(), g = agrupa(ks, (k) => rC[k]);
    const linhas = [['mun', 'Municípios atendidos'], ['loc', 'Localidades atendidas'], ['col', 'Amostras coletadas'], ['amU', 'Amostras analisadas · UMCQA'], ['amC', 'Amostras analisadas · CISAB'], ['anU', 'Análises concluídas · UMCQA'], ['anC', 'Análises concluídas · CISAB'], ['parU', 'Parâmetros · UMCQA'], ['parC', 'Parâmetros · CISAB'], ['foraU', 'UMCQA: medições não conformes'], ['foraC', 'CISAB: resultados acima do VMP']];
    const val = (z, k) => { z = z || []; const i = k.endsWith('U') ? 0 : k.endsWith('C') ? 1 : -1, zz = i < 0 ? z : z.filter((x) => rI[x] === i), b = k.replace(/[UC]$/, ''); return MET[b === 'am' ? 'am' : b === 'an' ? 'an' : b === 'par' ? 'par' : b === 'fora' ? 'fora' : b][1](zz); };
    tMet.replaceChildren(el('div', {class: 'tb-box'}, el('table', {}, el('thead', {}, el('tr', {}, el('th', {class: 'l'}, 'Indicador'), cs.map((c) => el('th', {}, c.t)), el('th', {}, 'Variação ' + cs[0].t.replace('Campanha ', 'C') + ' → ' + cs[cs.length - 1].t.replace('Campanha ', 'C')))),
      el('tbody', {}, linhas.map(([k, t]) => { const v = cs.map((c) => val(g.get(c.k), k)), d = v[v.length - 1] - v[0], mx = Math.max(1, ...v);
        return el('tr', {class: 'novo'}, el('td', {class: 'l'}, t), v.map((x) => el('td', {}, el('div', {class: 'mb'}, el('span', {}, n(x)), el('div', {class: 'b'}, el('i', {style: 'background:var(--q3);width:' + (100 * x / mx) + '%'}))))),
          el('td', {style: 'color:' + (d > 0 ? 'var(--fg)' : d < 0 ? 'var(--muted)' : 'var(--muted)')}, (d > 0 ? '+' : '') + n(d) + (v[0] ? ' (' + (d > 0 ? '+' : '') + p1((100 * d) / v[0]) + '%)' : ''))); })))),
      el('p', {class: 'fonte'}, 'Amostras coletadas contam cada coleta uma vez (as 64 amostras do CISAB da Campanha 1 são as mesmas coletas da UMCQA). UMCQA e CISAB usam referências diferentes; seus resultados fora da referência não são somados.'));
    graf();
    // parâmetro
    const ps = [...new Set(ks.map((k) => R.p[k]))].sort((a, b) => P[a].i.localeCompare(P[b].i) * -1 || P[a].n.localeCompare(P[b].n, 'pt-BR'));
    if (!ps.includes(parAtual)) parAtual = S.par >= 0 && ps.includes(S.par) ? S.par : ps.includes(PU['E. coli']) ? PU['E. coli'] : ps[0];
    parSel.replaceChildren(el('optgroup', {label: 'UMCQA'}, ps.filter((p) => P[p].i === 'U').map((p) => el('option', {value: p}, P[p].n))), el('optgroup', {label: 'CISAB'}, ps.filter((p) => P[p].i === 'C').map((p) => el('option', {value: p}, P[p].n))));
    if (parAtual != null && parAtual >= 0) { parSel.value = String(parAtual); porPar(); }
    // presença dos municípios
    const pm = porGrupo(ks, (k) => rM[k]).map((x) => ({...x, cs: new Set(x.ks.map((k) => rC[k]))}));
    const todas = pm.filter((x) => cs.every((c) => x.cs.has(c.k))).length;
    const fl = el('div', {class: 'toggles', style: 'margin-bottom:8px'}, [['', 'Todos (' + pm.length + ')'], ['t', 'Em todas as selecionadas (' + todas + ')'], ['p', 'Só em algumas (' + (pm.length - todas) + ')']].map(([v, t]) => el('button', {type: 'button', class: 'tg', 'aria-pressed': String(presF === v), onclick: () => { presF = v; render(); }}, t)));
    const rows = pm.filter((x) => !presF || (presF === 't') === cs.every((c) => x.cs.has(c.k)));
    pres.replaceChildren(fl, tabela({nome: 'presenca_municipios', unid: 'municípios', lim: 40, ord: 0, dir: 1, alto: 1, rows, onRow: (x) => selecionaMun(x.k), cols: [
      {t: 'Município', v: (x) => MUN[x.k].n}, {t: 'UF', v: (x) => MUN[x.k].uf},
      ...cs.map((c) => ({t: c.t, v: (x) => (x.cs.has(c.k) ? 'Sim' : 'Não'), f: (x) => { const u = x.ks.some((k) => rC[k] === c.k && !rI[k]), k2 = x.ks.some((k) => rC[k] === c.k && rI[k]); return u || k2 ? el('span', {class: 'dots'}, el('i', {class: u && k2 ? 'uc' : u ? 'u' : 'c', title: u && k2 ? 'UMCQA e CISAB' : u ? 'UMCQA' : 'CISAB'}, String(c.k))) : el('span', {class: 'muted'}, '–'); }})),
      {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size}, {t: 'Análises concluídas', num: 1, v: (x) => x.r.conc}]}));
  }
  return {init, render};
})();
