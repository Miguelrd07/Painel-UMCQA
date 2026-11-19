// ===== 1. Visão Geral =====
V.geral = (() => {
  let sec, kp, drill, gAm, gAn, gRes, tl, tCamp, desc, drillAtual = null;
  const KP = [
    ['camp', 'Campanhas', (r) => r.camps.size, (r) => (S.inst ? INS[S.inst] : 'UMCQA e CISAB')],
    ['mun', 'Municípios', (r) => r.mun.size, () => 'MG e ES'],
    ['loc', 'Localidades', (r) => r.loc.size, (r) => 'formas de abastecimento' + (r.med.size ? ' · + ' + n(r.med.size) + ' pontos de medição' : '')],
    ['am', 'Amostras coletadas', (r) => r.col.size, (r) => 'analisadas: UMCQA ' + n(r.amU.size) + ' · CISAB ' + n(r.amC.size)],
    ['an', 'Análises concluídas', (r) => r.conc, (r) => pcs(r.conc, r.reg) + ' dos ' + n(r.reg) + ' registros'],
    ['par', 'Parâmetros', (r) => r.parU.size + r.parC.size, (r) => 'UMCQA ' + n(r.parU.size) + ' · CISAB ' + n(r.parC.size)]];
  const DRILL = {
    camp: () => ['Campanhas na seleção', tabCampanhas(FR)],
    mun: () => ['Municípios na seleção', tabMunicipios(FR)],
    loc: () => ['Localidades e pontos de medição na seleção', tabLocalidades(FR)],
    am: () => ['Amostras analisadas na seleção', tabAmostras(FR)],
    an: () => ['Análises concluídas por parâmetro', tabParametros(FR.filter((k) => R.s[k] === 0))],
    par: () => ['Parâmetros na seleção', tabParametros(FR)],
    amCI: (c, i) => ['Amostras analisadas · Campanha ' + c + ' · ' + INS[i], tabAmostras(FR.filter((k) => rC[k] === c && rI[k] === (i === 'C' ? 1 : 0)))],
    anCI: (c, i) => ['Análises concluídas por parâmetro · Campanha ' + c + ' · ' + INS[i], tabParametros(FR.filter((k) => rC[k] === c && rI[k] === (i === 'C' ? 1 : 0) && R.s[k] === 0))],
    res: (i, cl) => ['Registros "' + cl + '" · ' + INS[i], tabRegistros(FR.filter((k) => rI[k] === (i === 'C' ? 1 : 0) && rcls(k) === cl), {nome: 'registros_' + cl})]};
  function abreDrill(k, ...args) {
    drillAtual = [k, args];
    const [t, corpo] = DRILL[k](...args);
    drill.replaceChildren(el('div', {class: 'drill', role: 'region', 'aria-label': t},
      el('div', {class: 'drill-h'}, el('div', {}, el('b', {}, t), el('div', {class: 'muted', style: 'font-size:12.5px'}, descFiltros())), el('button', {type: 'button', class: 'btn', onclick: fechaDrill}, '‹ Voltar à visão geral')),
      el('div', {class: 'drill-b'}, corpo)));
    $$('button.kpi', kp).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    drill.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'nearest'});
  }
  function fechaDrill() { drillAtual = null; drill.replaceChildren(); $$('button.kpi', kp).forEach((b) => b.setAttribute('aria-pressed', 'false')); kp.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'nearest'}); }
  function init(s) {
    sec = s;
    desc = el('p', {});
    kp = el('div', {class: 'kpis'});
    for (const [k, l] of KP) kp.append(el('button', {type: 'button', class: 'kpi', 'data-k': k, 'aria-pressed': 'false', onclick: () => (drillAtual && drillAtual[0] === k ? fechaDrill() : abreDrill(k))}, el('div', {class: 'l'}, l), el('div', {class: 'v'}, '0'), el('div', {class: 'd'}, '')));
    drill = el('div', {});
    gAm = el('div', {class: 'chart'}); gAn = el('div', {class: 'chart'}); gRes = el('div', {});
    tl = el('div', {class: 'tl'}); tCamp = el('div', {});
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Visão Geral'), desc)), kp, drill,
      el('div', {class: 'g2 mt'},
        el('div', {class: 'card'}, el('h3', {}, 'Amostras analisadas por campanha'), el('p', {class: 's'}, 'Por instituição · clique numa coluna para ver as amostras'), gAm),
        el('div', {class: 'card'}, el('h3', {}, 'Análises concluídas por campanha'), el('p', {class: 's'}, 'Por instituição · clique numa coluna para ver os parâmetros'), gAn)),
      el('div', {class: 'card mt'}, el('h3', {}, 'Resultado das análises'), el('p', {class: 's'}, 'Classificação de cada registro pela referência da instituição · clique num trecho da barra para ver os registros'), gRes),
      el('div', {class: 'card mt'}, el('h3', {}, 'Campanhas efetivamente realizadas'), el('p', {class: 's'}, 'Barra escura: período de coleta no arquivo da UMCQA; clara: no arquivo complementar do CISAB. Clique numa campanha da tabela para filtrar o painel por ela.'), tl,
        legenda([['Arquivo da UMCQA (parâmetros básicos de campo)', 'var(--u)'], ['Arquivo complementar do CISAB (análises laboratoriais)', 'var(--c)']]), el('div', {class: 'mt'}, tCamp)),
      integridade());
  }
  function render() {
    const r = resumo(FR);
    desc.textContent = descFiltros() + '. Clique em qualquer indicador, coluna ou barra para ver os dados que o compõem.';
    $$('button.kpi', kp).forEach((b, i) => { conta($('.v', b), KP[i][2](r)); $('.d', b).textContent = KP[i][3](r); });
    if (!sec._anim) { anima(kp); sec._anim = 1; }
    const cats = CS.filter((c) => S.camps.has(c)).map((c) => ({k: c, t: 'Campanha ' + c}));
    const porCI = agrupa(FR, (k) => rC[k] + '|' + rI[k]);
    const amCI = (c, s) => { const g = porCI.get(c.k + '|' + (s.k === 'C' ? 1 : 0)); return g ? new Set(g.map((k) => R.a[k])).size : 0; };
    const anCI = (c, s) => { const g = porCI.get(c.k + '|' + (s.k === 'C' ? 1 : 0)); return g ? g.filter((k) => R.s[k] === 0).length : 0; };
    colunas(gAm, {cats, series: serAtivas(), val: amCI, titulo: 'Amostras analisadas por campanha e instituição', onClick: (c, s) => abreDrill('amCI', c.k, s.k),
      tip: (c, s, v) => [c.t + ' · ' + s.t, n(v) + ' amostras analisadas', s.k === 'C' && c.k === 1 ? 'Coletadas pela UMCQA nos pontos de medição na cidade' : '']});
    colunas(gAn, {cats, series: serAtivas(), val: anCI, titulo: 'Análises concluídas por campanha e instituição', onClick: (c, s) => abreDrill('anCI', c.k, s.k), tip: (c, s, v) => [c.t + ' · ' + s.t, n(v) + ' análises concluídas']});
    gRes.replaceChildren(...serAtivas().map((s) => {
      const ks = FR.filter((k) => rI[k] === (s.k === 'C' ? 1 : 0)); const cnt = new Map(); for (const k of ks) { const c = rcls(k); cnt.set(c, (cnt.get(c) || 0) + 1); }
      const ordem = s.k === 'U' ? ORD_U : ORD_C, segs = ordem.filter((c) => cnt.get(c)).map((c) => ({t: c, v: cnt.get(c), cor: COR[c]}));
      return el('div', {style: 'margin-bottom:12px'}, el('div', {style: 'display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px'}, el('b', {}, s.t), el('span', {class: 'muted'}, n(ks.length) + ' registros')),
        empilhada(segs, (sg) => abreDrill('res', s.k, sg.t), true),
        el('div', {class: 'leg'}, segs.map((sg) => el('button', {type: 'button', onclick: () => abreDrill('res', s.k, sg.t)}, el('i', {style: 'background:' + sg.cor}), sg.t + ' ' + n(sg.v) + ' (' + pcs(sg.v, ks.length) + ')'))));
    }));
    gRes.append(el('p', {class: 'fonte'}, 'UMCQA: conformidade pela Portaria GM/MS nº 888/2021. CISAB: "Acima do VMP" só para resultados comparáveis ao VMP da planilha; "< LoD" é não detectado e "< LoQ", detectado abaixo do limite de quantificação.'));
    // linha do tempo
    const t0 = new Date('2026-05-01'), t1 = new Date('2026-11-01'), pos = (s) => (100 * (new Date(s) - t0)) / (t1 - t0);
    tl.replaceChildren(el('div', {class: 'tl-eixo'}, ['mai', 'jun', 'jul', 'ago', 'set', 'out'].map((m) => el('span', {}, m + '/26'))));
    for (const c of C) tl.append(el('div', {class: 'tl-l'}, el('b', {}, c.nome), el('div', {class: 'tl-trilha'}, [['', c.perU, 'U'], ['c', c.perC, 'C']].map(([cl, p, i]) => {
      const a = pos(p[0]), b = pos(p[1]) + 100 / 184; const off = !S.camps.has(c.n) || (S.inst && S.inst !== i);
      const e = el('i', {class: cl + (off ? ' off' : ''), style: 'left:' + a + '%;width:' + Math.max(0.8, b - a) + '%'});
      e.addEventListener('pointermove', (ev) => dica(ev, [c.nome + ' · ' + INS[i], br(p[0]) + ' a ' + br(p[1]), 'Arquivo: ' + c[i === 'C' ? 'arqC' : 'arqU']])); e.addEventListener('pointerleave', someDica);
      return e;
    }))));
    tCamp.replaceChildren(tabCampanhas(FR, {sel: (x) => S.camps.size === 1 && S.camps.has(x.k), onRow: (x) => { S.camps = S.camps.size === 1 && S.camps.has(x.k) ? new Set(CS) : new Set([x.k]); atualiza(); }}));
    if (drillAtual) abreDrill(drillAtual[0], ...drillAtual[1]);
  }
  function integridade() {
    return acc('Integridade e rastreabilidade da base', () => {
      const g = porGrupo([...Array(NR).keys()], (k) => rC[k] * 2 + rI[k]).sort((a, b) => a.k - b.k);
      const linhas = (x) => { let mn = 1e9, mx = 0; for (const k of x.ks) { if (R.ln[k] < mn) mn = R.ln[k]; if (R.ln[k] > mx) mx = R.ln[k]; } return n(mn) + ' a ' + n(mx); };
      const semData = A.filter((a) => !a.d).length, dup = R.s.filter((s) => s === 4).length, amb = L.filter((l) => l.c === 'A');
      const multiVmp = P.filter((p) => p.i === 'C' && p.vmp.length > 1);
      const nota = (t) => el('li', {}, t);
      return el('div', {},
        tabela({nome: 'arquivos_de_origem', unid: 'arquivos', exportar: true, lim: 10, rows: g, cols: [
          {t: 'Campanha', v: (x) => x.k >> 1, f: (x) => 'Campanha ' + (x.k >> 1)}, {t: 'Instituição', v: (x) => (x.k & 1 ? 'CISAB' : 'UMCQA')},
          {t: 'Arquivo de origem', v: (x) => C[(x.k >> 1) - 1][x.k & 1 ? 'arqC' : 'arqU'], w: 1}, {t: 'Registros', num: 1, v: (x) => x.r.reg}, {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size},
          {t: 'Concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Parâmetros', num: 1, v: (x) => x.r.parU.size + x.r.parC.size}, {t: 'Linhas da planilha', v: (x) => linhas(x), sort: false}],
          rodape: ['Total', '', '8 arquivos', NR, A.length, R.s.filter((s) => s === 0).length, P.length, '']}),
        el('ul', {style: 'margin:12px 0 0;padding-left:20px;font-size:13.5px;display:grid;gap:4px'},
          nota('Nenhum registro excluído: os ' + n(NR) + ' registros das planilhas estão no painel, cada um com arquivo e linha de origem. Registros sem município, localidade ou instituição: ' + n(R.a.filter((a) => !A[a].m && A[a].m !== 0).length) + '.'),
          nota('Amostras: ' + n(A.length) + ' amostras analisadas (UMCQA ' + n(A.filter((a) => a.i === 'U').length) + ', CISAB ' + n(A.filter((a) => a.i === 'C').length) + ') correspondem a ' + n(new Set(A.map((a) => a.col)).size) + ' coletas. As ' + n(D.meta.comum) + ' amostras do CISAB da Campanha 1 têm o mesmo número, município e campanha de medições da UMCQA (' + n(D.meta.comum_mesma_data) + ' também com a mesma data) e são a mesma coleta.'),
          nota('Amostras e análises são contadas separadamente: uma amostra tem várias análises (5 na UMCQA; até 94 no CISAB). Resultados de instituições diferentes nunca são somados como se fossem a mesma análise.'),
          nota('Localidades: ' + n(L.filter((l) => l.c === 'F').length) + ' formas de abastecimento. Os ' + n(L.filter((l) => l.c === 'M').length) + ' pontos de medição na cidade (Campanha 1) entram em amostras e municípios, não em localidades.' + (amb.length ? ' ' + amb[0].o + ' (' + n(R.a.filter((a) => A[a].l === L.indexOf(amb[0])).length) + ' registros).' : '')),
          nota('Grafias: 5 formas de abastecimento escritas de outro modo nas planilhas do CISAB foram ligadas aos pontos correspondentes da UMCQA (mesmo município e titular ou sistema). Nomes de parâmetros com grafias diferentes entre os arquivos foram unificados; os nomes originais aparecem em Parâmetros Monitorados.'),
          nota('Municípios com nome escrito com erro nas planilhas do CISAB ("Conselheio Pena" e "São Domingos da Prata" na Campanha 1; "CONSEHEIO PENA" e "CONSELHEIRO  PENA" na Campanha 4) foram associados ao município correto pelo código IBGE.'),
          nota('Na planilha do CISAB da Campanha 1, ' + n(dup) + ' registros repetidos estão marcados como "registro duplicado" e mantidos, sem contar como análise concluída.'),
          nota(n(D.meta.c2_num_coincide) + ' números de amostra do CISAB na Campanha 2 coincidem com números da UMCQA na Campanha 1, com datas diferentes; foram tratados como coletas distintas.'),
          nota(n(semData) + ' amostras sem data de coleta válida na planilha' + (D.meta.um_data_fora.length ? '; a amostra ' + D.meta.um_data_fora[0][0].replace('UMCQA-2-', '') + ' da Campanha 2 tem data (' + br(D.meta.um_data_fora[0][1]) + ') fora do período da campanha' : '') + '.'),
          nota('VMP: ' + n(multiVmp.length) + ' parâmetros do CISAB têm mais de um VMP nas planilhas (por exemplo, ' + multiVmp.slice(0, 3).map((p) => p.n + ': ' + p.vmp.join(' e ')).join('; ') + '). Cada resultado é comparado ao VMP que consta na sua própria linha.'),
          nota('Unidades: 192 registros do CISAB tiveram a unidade inferida (VMP da Campanha 1 mil vezes menor que o das demais, em mg/L) e 64 registros ("1,2 dicloreto") não têm unidade na planilha.'),
          nota(C[3].obs + '.')));
    }, false, n(NR) + ' registros · 8 arquivos');
  }
  return {init, render};
})();
