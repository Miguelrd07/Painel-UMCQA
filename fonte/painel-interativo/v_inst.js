// ===== 5. Comparativo UMCQA x CISAB =====
function painelDrill(alvo, titulo, corpo) {
  alvo.replaceChildren(el('div', {class: 'drill', role: 'region', 'aria-label': titulo}, el('div', {class: 'drill-h'}, el('b', {}, titulo), el('button', {type: 'button', class: 'btn', onclick: () => alvo.replaceChildren()}, '‹ Fechar detalhamento')), el('div', {class: 'drill-b'}, corpo)));
  alvo.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'nearest'});
}
V.instituicoes = (() => {
  let desc, tInd, ch, met = 'am', cob, grp, conj, drill, mSel;
  const MET = {am: ['Amostras analisadas', (ks) => new Set(ks.map((k) => R.a[k])).size], an: ['Análises concluídas', (ks) => ks.filter((k) => R.s[k] === 0).length], mun: ['Municípios', (ks) => new Set(ks.map((k) => rM[k])).size],
    loc: ['Localidades', (ks) => new Set(ks.filter((k) => L[rL[k]].c === 'F').map((k) => rL[k])).size], par: ['Parâmetros', (ks) => new Set(ks.map((k) => R.p[k])).size]};
  function init(s) {
    desc = el('p', {}); tInd = el('div', {}); ch = el('div', {class: 'chart'}); cob = el('div', {}); grp = el('div', {}); conj = el('div', {}); drill = el('div', {});
    mSel = el('select', {'aria-label': 'Indicador do gráfico', onchange: () => { met = mSel.value; graf(); }}, Object.entries(MET).map(([k, [t]]) => el('option', {value: k}, t)));
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Comparativo UMCQA x CISAB'), desc)),
      el('div', {class: 'card'}, el('h3', {}, 'Indicadores lado a lado'), el('p', {class: 's'}, 'Clique numa linha para ver os dados que compõem o indicador nas duas instituições.'), tInd), drill,
      el('div', {class: 'g2 mt'}, el('div', {class: 'card'}, el('div', {style: 'display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center'}, el('h3', {}, 'Por campanha'), mSel), el('p', {class: 's'}, 'Muda com o indicador escolhido e com os filtros · clique numa coluna para detalhar'), ch),
        el('div', {class: 'card'}, el('h3', {}, 'Cobertura das localidades'), el('p', {class: 's'}, 'Formas de abastecimento atendidas por cada instituição · clique para ver a lista'), cob)),
      el('div', {class: 'card mt'}, el('h3', {}, 'Parâmetros por grupo'), el('p', {class: 's'}, 'Quantidade de parâmetros distintos de cada instituição em cada grupo · clique num grupo para ver os parâmetros'), grp),
      el('div', {class: 'card mt'}, el('h3', {}, 'Comparabilidade dos resultados'), el('div', {class: 'nota'}, el('b', {}, 'As instituições não analisam nenhum parâmetro em comum. '), 'Por isso não há diferença de resultado a calcular para o mesmo parâmetro (veja a matriz de correspondência em Parâmetros Monitorados). A tabela abaixo mostra, para cada localidade atendida pelas duas na mesma campanha, os resultados de cada uma lado a lado, sem somá-los.'), conj));
  }
  let ks = [];
  function graf() {
    const cats = CS.filter((c) => S.camps.has(c)).map((c) => ({k: c, t: 'Campanha ' + c})), g = agrupa(ks, (k) => rC[k] + '|' + rI[k]);
    colunas(ch, {cats, series: SER_I, val: (c, s) => MET[met][1](g.get(c.k + '|' + (s.k === 'C' ? 1 : 0)) || []), titulo: MET[met][0] + ' por campanha e instituição',
      onClick: (c, s) => { const z = g.get(c.k + '|' + (s.k === 'C' ? 1 : 0)) || []; painelDrill(drill, MET[met][0] + ' · Campanha ' + c.k + ' · ' + s.t, met === 'am' ? tabAmostras(z) : met === 'mun' ? tabMunicipios(z) : met === 'loc' ? tabLocalidades(z) : tabParametros(met === 'an' ? z.filter((k) => R.s[k] === 0) : z, {lim: 100})); }});
  }
  function render() {
    ks = filtra({noInst: true});
    desc.textContent = 'Participação e resultados de cada instituição, sem somar análises diferentes como se fossem a mesma. ' + descFiltros({noInst: true}) + ' (o filtro de instituição não se aplica a esta área).';
    const kU = ks.filter((k) => !rI[k]), kC = ks.filter((k) => rI[k]), rU = resumo(kU), rC2 = resumo(kC);
    const grupos = (r, i) => new Set([...(i ? r.parC : r.parU)].map((p) => P[p].g)).size;
    const linhas = [
      ['Campanhas', rU.camps.size, rC2.camps.size, () => tabCampanhas(ks)], ['Municípios', rU.mun.size, rC2.mun.size, () => tabMunicipios(ks)],
      ['Localidades (formas de abastecimento)', rU.loc.size, rC2.loc.size, () => tabLocalidades(ks.filter((k) => L[rL[k]].c === 'F'))], ['Pontos de medição na cidade', rU.med.size, rC2.med.size, () => tabLocalidades(ks.filter((k) => L[rL[k]].c === 'M'))],
      ['Amostras analisadas', rU.amU.size, rC2.amC.size, () => tabAmostras(ks)], ['Registros', rU.reg, rC2.reg, () => tabParametros(ks, {lim: 100})], ['Análises concluídas', rU.conc, rC2.conc, () => tabParametros(ks.filter((k) => R.s[k] === 0), {lim: 100})],
      ['% de análises concluídas', pct(rU.conc, rU.reg), pct(rC2.conc, rC2.reg), null, true], ['Parâmetros distintos', rU.parU.size, rC2.parC.size, () => tabParametros(ks, {lim: 100})], ['Grupos de parâmetros', grupos(rU, 0), grupos(rC2, 1), null],
      ['Resultados fora da referência', rU.foraU, rC2.foraC, () => tabRegistros(ks.filter(fora), {nome: 'fora_da_referencia'}), false, 'UMCQA: não conformes pela Portaria GM/MS nº 888/2021 (' + pcs(rU.foraU, rU.avU) + ' das medições avaliadas). CISAB: acima do VMP da planilha (' + pcs(rC2.foraC, rC2.avC) + ' dos resultados comparáveis).']];
    const barra = (u, c, i) => { const mx = Math.max(u || 0, c || 0) || 1; return el('div', {class: 'b', style: 'width:90px'}, el('i', {style: 'background:' + (i ? 'var(--c)' : 'var(--u)') + ';width:' + (100 * ((i ? c : u) || 0) / mx) + '%'})); };
    tInd.replaceChildren(el('div', {class: 'tb-box'}, el('table', {}, el('thead', {}, el('tr', {}, el('th', {class: 'l'}, 'Indicador'), el('th', {}, 'UMCQA'), el('th', {}, 'CISAB'), el('th', {class: 'l'}, 'Observação'))),
      el('tbody', {}, linhas.map(([t, u, c, fn, pc, obs]) => { const tr = el('tr', {class: fn ? 'clic' : '', tabindex: fn ? '0' : null}, el('td', {class: 'l'}, el('b', {}, t)),
        el('td', {}, el('div', {class: 'mb'}, el('span', {}, pc ? p1(u) + '%' : n(u)), barra(u, c, 0))), el('td', {}, el('div', {class: 'mb'}, el('span', {}, pc ? p1(c) + '%' : n(c)), barra(u, c, 1))), el('td', {class: 'l w', style: 'font-size:12.5px;color:var(--muted)'}, obs || ''));
        if (fn) { const go = () => painelDrill(drill, t + ' · UMCQA e CISAB', fn()); tr.addEventListener('click', go); tr.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); }
        return tr; })))));
    graf();
    // cobertura das localidades
    const lu = new Set(kU.filter((k) => L[rL[k]].c === 'F').map((k) => rL[k])), lc = new Set(kC.filter((k) => L[rL[k]].c === 'F').map((k) => rL[k]));
    const ambas = [...lu].filter((l) => lc.has(l)), soU = [...lu].filter((l) => !lc.has(l)), soC = [...lc].filter((l) => !lu.has(l)), tot = ambas.length + soU.length + soC.length;
    cob.replaceChildren(el('div', {class: 'hb'}, [['Só UMCQA', soU, 'var(--u)'], ['UMCQA e CISAB', ambas, 'linear-gradient(90deg,var(--u),var(--c))'], ['Só CISAB', soC, 'var(--c)']].map(([t, ls, cor]) => {
      const row = el('div', {class: 'hb-r clic', tabindex: '0', role: 'button'}, el('span', {class: 't'}, t), el('div', {class: 'st alto'}, el('i', {style: 'background:' + cor, 'data-w': (100 * ls.length / (tot || 1)).toFixed(2)})), el('span', {class: 'v'}, n(ls.length)));
      const go = () => { const set = new Set(ls); painelDrill(drill, 'Localidades · ' + t, tabLocalidades(ks.filter((k) => set.has(rL[k])))); };
      row.addEventListener('click', go); row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
      return row;
    })), el('p', {class: 'fonte'}, n(tot) + ' localidades na seleção. A UMCQA mede em todas as formas de abastecimento; o CISAB, em parte delas e, na Campanha 1, nos pontos de medição na cidade.'));
    requestAnimationFrame(() => requestAnimationFrame(() => $$('i[data-w]', cob).forEach((i) => { i.style.width = i.dataset.w + '%'; })));
    // grupos de parâmetros
    const gs = [...new Set([...rU.parU, ...rC2.parC].map((p) => P[p].g))].sort();
    const mx = Math.max(1, ...gs.map((g) => [...rC2.parC, ...rU.parU].filter((p) => P[p].g === g).length));
    grp.replaceChildren(el('div', {class: 'hb'}, gs.map((g) => { const u = [...rU.parU].filter((p) => P[p].g === g).length, c = [...rC2.parC].filter((p) => P[p].g === g).length;
      const row = el('div', {class: 'hb-r clic', tabindex: '0', role: 'button'}, el('span', {class: 't'}, g), el('div', {class: 'st'}, el('i', {style: 'background:var(--u)', 'data-w': (100 * u / mx).toFixed(2)}), el('i', {style: 'background:var(--c)', 'data-w': (100 * c / mx).toFixed(2)})), el('span', {class: 'v'}, (u ? 'UMCQA ' + u + ' · ' : '') + (c ? 'CISAB ' + c : '')));
      const go = () => painelDrill(drill, 'Parâmetros do grupo ' + g, tabParametros(ks.filter((k) => P[R.p[k]].g === g), {lim: 100}));
      row.addEventListener('click', go); row.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); }); return row; })), legenda([['UMCQA', 'var(--u)'], ['CISAB', 'var(--c)']]));
    requestAnimationFrame(() => requestAnimationFrame(() => $$('i[data-w]', grp).forEach((i) => { i.style.width = i.dataset.w + '%'; })));
    // visão conjunta
    const g = agrupa(ks, (k) => rL[k] + '|' + rC[k]); const rows = [];
    for (const [key, z] of g) { const zu = z.filter((k) => !rI[k]), zc = z.filter((k) => rI[k]); if (!zu.length || !zc.length) continue; const [li, c] = key.split('|').map(Number); rows.push({li, c, ru: resumo(zu), rc: resumo(zc), zu, zc}); }
    conj.replaceChildren(tabela({nome: 'visao_conjunta', unid: 'localidades × campanha', lim: 40, ord: 1, dir: 1, alto: 1, rows, onRow: (x) => ir('localidades', x.li), cols: [
      {t: 'Localidade ou ponto', v: (x) => L[x.li].n, w: 1}, {t: 'Município', v: (x) => MUN[L[x.li].m].n}, {t: 'Campanha', v: (x) => x.c, f: (x) => 'C' + x.c},
      {t: 'UMCQA: não conformes', num: 1, v: (x) => x.ru.foraU, f: (x) => n(x.ru.foraU) + ' de ' + n(x.ru.avU)},
      {t: 'UMCQA: E. coli', v: (x) => { const k = x.zu.find((k2) => R.p[k2] === PU['E. coli']); return k == null ? '–' : STR[R.r[k]]; }},
      {t: 'CISAB: acima do VMP', num: 1, v: (x) => x.rc.foraC, f: (x) => n(x.rc.foraC) + ' de ' + n(x.rc.avC)},
      {t: 'CISAB: parâmetros acima do VMP', v: (x) => [...new Set(x.zc.filter((k) => R.f[k] === 'A').map((k) => P[R.p[k]].n))].join(', ') || '–', w: 1}]}));
  }
  return {init, render};
})();
