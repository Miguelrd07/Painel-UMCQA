// ===== 2. Análise por Município =====
const KS_MUN = MUN.map(() => []); for (let k = 0; k < NR; k++) KS_MUN[rM[k]].push(k);
const campsMun = (m) => [...new Set(KS_MUN[m].map((k) => rC[k]))].sort();
V.municipios = (() => {
  let desc, lista, part = '', q = '', chips, banner;
  function init(s) {
    desc = el('p', {});
    chips = el('div', {class: 'toggles', role: 'group', 'aria-label': 'Participação nas campanhas'});
    banner = el('div', {});
    lista = el('div', {});
    const busca = el('input', {type: 'search', placeholder: 'Buscar município', 'aria-label': 'Buscar município', oninput: (e) => { q = semAc(e.target.value.trim()); render(); }});
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Análise por Município'), desc)), banner,
      el('div', {class: 'card'}, el('div', {style: 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;margin-bottom:10px'}, chips, busca), lista,
        el('p', {class: 'fonte'}, 'Campanhas: quadro escuro = UMCQA, claro = CISAB, dividido = as duas. Os números respeitam os filtros de instituição, campanha e parâmetro do topo; a participação considera as quatro campanhas.')));
  }
  function render() {
    const ks = filtra({noMun: true});
    desc.textContent = 'Clique num município para filtrar todo o painel por ele e abrir a análise detalhada no painel lateral. ' + descFiltros({noMun: true}) + '.';
    const todas = MUN.filter((m) => campsMun(m.ix).length === 4).length;
    chips.replaceChildren(...[['', 'Todos (' + MUN.length + ')'], ['4', 'Nas 4 campanhas (' + todas + ')'], ['p', 'Em parte das campanhas (' + (MUN.length - todas) + ')']].map(([v, t]) => el('button', {type: 'button', class: 'tg', 'aria-pressed': String(part === v), onclick: () => { part = v; render(); }}, t)));
    banner.replaceChildren(S.mun >= 0 ? el('div', {class: 'selbar'}, el('span', {}, 'Município selecionado: ', el('b', {}, munNome(S.mun)), ' · o painel inteiro está filtrado por ele.'), el('button', {type: 'button', class: 'btn pri', onclick: () => abreMun(S.mun)}, 'Abrir análise detalhada'), el('button', {type: 'button', class: 'btn', onclick: () => { S.mun = -1; atualiza(); }}, 'Limpar município')) : '');
    const ok = (m) => (!part || (part === '4') === (campsMun(m).length === 4)) && (!q || semAc(MUN[m].n).includes(q));
    lista.replaceChildren(tabMunicipios(ks.filter((k) => ok(rM[k])), {ord: 0}));
  }
  return {init, render, sub: (m) => { if (MUN[+m]) selecionaMun(+m); }};
})();
// análise detalhada de um município (painel lateral)
function abreMun(m) {
  if (location.hash.split('/')[1] === 'municipios' && location.hash.split('/')[2] !== String(m)) history.replaceState(null, '', '#/municipios/' + m);
  const mu = MUN[m], ks = KS_MUN[m], cps = campsMun(m);
  abreDrawer(mu.n + ' · ' + mu.uf, cps.length === 4 ? 'Participou das quatro campanhas' : 'Participou das campanhas ' + cps.join(', ') + ' (não aparece nas campanhas ' + CS.filter((c) => !cps.includes(c)).join(', ') + ')', (b) => {
    const r = resumo(ks), kU = ks.filter((k) => !rI[k]), kC = ks.filter((k) => rI[k]);
    b.append(el('div', {class: 'mk'}, [['Campanhas', r.camps.size], ['Localidades', r.loc.size], ['Pontos de medição', r.med.size], ['Amostras coletadas', r.col.size], ['Análises concluídas', r.conc], ['Parâmetros', r.parU.size + r.parC.size]].map(([l, v]) => { const e = el('div', {class: 'v'}, '0'); conta(e, v); return el('div', {}, e, el('div', {class: 'l'}, l)); })));
    b.append(el('div', {class: 'acoes'}, el('button', {type: 'button', class: 'btn', onclick: () => { fechaDrawer(); ir('localidades'); }}, 'Abrir em Análise por Localidade'), el('button', {type: 'button', class: 'btn', onclick: () => { fechaDrawer(); ir('parametros'); }}, 'Ver parâmetros deste município'), el('button', {type: 'button', class: 'btn', onclick: () => { fechaDrawer(); ir('achados'); }}, 'Ver achados')));
    // participação por campanha
    const g = new Map(CS.map((c) => [c, ks.filter((k) => rC[k] === c)]));
    const per = (x, i) => { const ds = x.filter((k) => rI[k] === i).map((k) => A[R.a[k]]).filter((a) => a.d && !a.od).map((a) => a.d).sort(); return ds.length ? brc(ds[0]) + ' a ' + brc(ds[ds.length - 1]) : '–'; };
    b.append(acc('Identificação e participação por campanha', () => el('div', {},
      tabela({nome: 'participacao_' + mu.n, unid: 'campanhas', lim: 4, ord: 0, dir: 1, rows: CS.map((c) => ({c, ks: g.get(c), r: resumo(g.get(c))})), cols: [
        {t: 'Campanha', v: (x) => x.c, f: (x) => el('b', {}, 'Campanha ' + x.c)}, {t: 'Período UMCQA', v: (x) => per(x.ks, 0), sort: false}, {t: 'Período CISAB', v: (x) => per(x.ks, 1), sort: false},
        {t: 'Localidades', num: 1, v: (x) => x.r.loc.size}, {t: 'Pontos de medição', num: 1, v: (x) => x.r.med.size}, {t: 'Amostras UMCQA', num: 1, v: (x) => x.r.amU.size}, {t: 'Amostras CISAB', num: 1, v: (x) => x.r.amC.size},
        {t: 'Concluídas UMCQA', num: 1, v: (x) => x.r.concU}, {t: 'Concluídas CISAB', num: 1, v: (x) => x.r.concC}]}),
      el('h4', {class: 'h4', style: 'margin-top:14px'}, 'Localidades atendidas em cada campanha'),
      tabela({nome: 'localidades_' + mu.n, unid: 'localidades e pontos', lim: 60, ord: 0, dir: 1, rows: porGrupo(ks, (k) => rL[k]), onRow: (x) => { fechaDrawer(); ir('localidades', x.k); }, cols: [
        {t: 'Localidade ou ponto', v: (x) => L[x.k].n, w: 1}, {t: 'Tipo', v: (x) => L[x.k].t || '–'},
        ...CS.map((c) => ({t: 'C' + c, v: (x) => { const u = x.ks.some((k) => rC[k] === c && !rI[k]), k2 = x.ks.some((k) => rC[k] === c && rI[k]); return u && k2 ? 'UMCQA e CISAB' : u ? 'UMCQA' : k2 ? 'CISAB' : ''; },
          f: (x) => { const u = x.ks.some((k) => rC[k] === c && !rI[k]), k2 = x.ks.some((k) => rC[k] === c && rI[k]); return u || k2 ? el('span', {class: 'dots'}, el('i', {class: u && k2 ? 'uc' : u ? 'u' : 'c', title: u && k2 ? 'UMCQA e CISAB' : u ? 'UMCQA' : 'CISAB'}, '')) : el('span', {class: 'muted'}, '–'); }})),
        {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size}]})), true));
    // comparativo institucional
    b.append(acc('Comparativo UMCQA x CISAB', () => {
      const rU = resumo(kU), rC2 = resumo(kC);
      const box = (cls, t, rr, i) => el('div', {class: cls}, el('h4', {}, t), el('dl', {}, el('dt', {}, 'Amostras analisadas'), el('dd', {}, n(i ? rr.amC.size : rr.amU.size)), el('dt', {}, 'Registros'), el('dd', {}, n(rr.reg)),
        el('dt', {}, 'Análises concluídas'), el('dd', {}, n(rr.conc)), el('dt', {}, 'Parâmetros'), el('dd', {}, n(i ? rr.parC.size : rr.parU.size)), el('dt', {}, 'Campanhas'), el('dd', {}, [...rr.camps].sort().join(', ') || '–'),
        el('dt', {}, i ? 'Acima do VMP' : 'Não conformes'), el('dd', {}, i ? n(rr.foraC) + ' de ' + n(rr.avC) : n(rr.foraU) + ' de ' + n(rr.avU))));
      const pU = [...rU.parU], pC = [...rC2.parC];
      const porG = agrupa(pC, (p) => P[p].g);
      return el('div', {}, el('div', {class: 'cmp'}, box('', 'UMCQA', rU, 0), box('c', 'CISAB', rC2, 1)),
        el('div', {class: 'nota'}, el('b', {}, 'Parâmetros comuns: nenhum. '), 'A UMCQA mede 5 parâmetros básicos em campo e o CISAB analisa em laboratório outros parâmetros; nenhum deles tem o mesmo nome e unidade nas duas instituições (veja a matriz de correspondência em Parâmetros Monitorados). Por isso não há diferença de resultado a calcular entre as instituições para o mesmo parâmetro.'),
        el('h4', {class: 'h4', style: 'margin-top:12px'}, 'Exclusivos da UMCQA (' + pU.length + ')'), el('div', {class: 'pchips'}, pU.map((p) => el('button', {type: 'button', class: 'pchip', onclick: () => abrePar(p, true)}, P[p].n))),
        el('h4', {class: 'h4', style: 'margin-top:12px'}, 'Exclusivos do CISAB (' + pC.length + ')'),
        ...[...porG].sort().map(([gr, ps]) => el('div', {style: 'margin:6px 0'}, el('div', {class: 'muted', style: 'font-size:12.5px;margin-bottom:3px'}, gr + ' (' + ps.length + ')'),
          el('div', {class: 'pchips'}, ps.sort((a, c) => P[a].n.localeCompare(P[c].n, 'pt-BR')).map((p) => { const ac = kC.some((k) => R.p[k] === p && R.f[k] === 'A'); return el('button', {type: 'button', class: 'pchip' + (ac ? ' bad' : ''), title: ac ? 'Com resultado acima do VMP neste município' : '', onclick: () => abrePar(p, true)}, P[p].n + (ac ? ' ▲' : '')); })))),
        el('p', {class: 'fonte'}, '▲ parâmetro com ao menos um resultado acima do VMP neste município.'));
    }));
    // histórico
    b.append(acc('Histórico nas campanhas 1 a 4', () => {
      const ch = el('div', {class: 'chart'});
      const hist = CS.map((c) => { const x = resumo(g.get(c)); return {c, x}; });
      setTimeout(() => colunas(ch, {cats: CS.map((c) => ({k: c, t: 'Campanha ' + c})), series: [{k: 'U', t: 'UMCQA: % de medições não conformes', cor: 'var(--u)'}, {k: 'C', t: 'CISAB: % de resultados acima do VMP', cor: 'var(--c)'}],
        val: (c, s) => { const x = hist[c.k - 1].x; return s.k === 'U' ? pct(x.foraU, x.avU) || 0 : pct(x.foraC, x.avC) || 0; }, fmt: (v) => p1(v) + '%', h: 220,
        tip: (c, s, v) => { const x = hist[c.k - 1].x; return [c.t + ' · ' + s.k, s.k === 'U' ? n(x.foraU) + ' de ' + n(x.avU) + ' medições não conformes' : n(x.foraC) + ' de ' + n(x.avC) + ' resultados comparáveis acima do VMP']; }}), 30);
      const tU = P.filter((p) => p.i === 'U').map((p) => ({p: p.ix, por: CS.map((c) => { const z = g.get(c).filter((k) => R.p[k] === p.ix && R.q[k] <= 1); return [z.filter((k) => R.q[k] === 1).length, z.length]; })}));
      const acima = CS.map((c) => { const m2 = new Map(); for (const k of g.get(c)) if (R.f[k] === 'A') m2.set(R.p[k], (m2.get(R.p[k]) || 0) + 1); return [...m2].sort((a, z) => z[1] - a[1]); });
      return el('div', {}, ch, el('p', {class: 'fonte'}, 'Os dois percentuais usam referências diferentes e não são comparáveis entre si: servem para ver a evolução de cada instituição.'),
        el('h4', {class: 'h4', style: 'margin-top:12px'}, 'UMCQA: medições não conformes por parâmetro'),
        tabela({nome: 'historico_umcqa_' + mu.n, unid: 'parâmetros', barra: false, lim: 5, rows: tU, cols: [{t: 'Parâmetro', v: (x) => P[x.p].n, f: (x) => linkPar(x.p)}, ...CS.map((c, i) => ({t: 'C' + c, num: 1, v: (x) => pct(...x.por[i]), f: (x) => (x.por[i][1] ? n(x.por[i][0]) + ' de ' + n(x.por[i][1]) : '–')}))]}),
        el('h4', {class: 'h4', style: 'margin-top:12px'}, 'CISAB: parâmetros acima do VMP'),
        el('div', {class: 'tb-box'}, el('table', {}, el('tbody', {}, CS.map((c, i) => el('tr', {}, el('td', {class: 'l'}, el('b', {}, 'Campanha ' + c)), el('td', {class: 'l w'}, acima[i].length ? el('div', {class: 'pchips'}, acima[i].map(([p, v]) => el('button', {type: 'button', class: 'pchip bad', onclick: () => abrePar(p, true)}, P[p].n + ' · ' + v))) : el('span', {class: 'muted'}, g.get(c).some((k) => rI[k]) ? 'Nenhum resultado acima do VMP' : 'Sem análises do CISAB'))))))));
    }));
    // achados no município
    b.append(acc('Achados nos resultados deste município', () => achadosMun(mu.n)));
  }, false);
}
