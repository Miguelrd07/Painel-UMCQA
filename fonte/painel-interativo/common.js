// ===== Tabelas de detalhamento reutilizadas em todas as áreas =====
const porGrupo = (ks, fn) => { const m = agrupa(ks, fn); return [...m].map(([k, v]) => ({k, ks: v, r: resumo(v)})); };
const campDots = (ks) => { const u = new Set(), c = new Set(); for (const k of ks) (rI[k] ? c : u).add(rC[k]); return dots((x) => [u.has(x), c.has(x)]); };
const campLista = (ks) => [...new Set(ks.map((k) => rC[k]))].sort().join(', ');
const foraTxt = (r) => (r.avU || r.avC ? n(r.foraU + r.foraC) + ' de ' + n(r.avU + r.avC) : '–');
const locNome = (li) => L[li].n + (L[li].c === 'F' ? ' (' + L[li].k + ')' : '');
const linkMun = (m) => el('button', {type: 'button', class: 'lk', onclick: () => selecionaMun(m)}, MUN[m].n);
const linkLoc = (li) => el('button', {type: 'button', class: 'lk', onclick: () => { fechaDrawer(); ir('localidades', li); }}, L[li].n);
const linkPar = (pi) => el('button', {type: 'button', class: 'lk', onclick: () => abrePar(pi, true)}, P[pi].n);
function miniStack(ks) {
  const cnt = new Map(); for (const k of ks) { const c = rcls(k); cnt.set(c, (cnt.get(c) || 0) + 1); }
  const ord = [...ORD_C, ...ORD_U.filter((x) => !ORD_C.includes(x)), 'Medido sem referência'];
  return el('div', {style: 'min-width:110px'}, empilhada(ord.filter((c) => cnt.get(c)).map((c) => ({t: c, v: cnt.get(c), cor: COR[c]}))));
}
function tabCampanhas(ks, o) {
  const g = porGrupo(ks, (k) => rC[k]).sort((a, b) => a.k - b.k);
  const per = (x, inst) => { const ds = x.ks.filter((k) => rI[k] === (inst === 'C' ? 1 : 0)).map((k) => A[R.a[k]]).filter((a) => a.d && !a.od).map((a) => a.d).sort(); return ds.length ? brc(ds[0]) + ' a ' + brc(ds[ds.length - 1]) : '–'; };
  return tabela({nome: 'campanhas', unid: 'campanhas', ord: 0, dir: 1, lim: 10, sel: o && o.sel, onRow: o && o.onRow, rows: g, cols: [
    {t: 'Campanha', v: (x) => x.k, f: (x) => el('b', {}, 'Campanha ' + x.k)},
    {t: 'Arquivos de origem', v: (x) => C[x.k - 1].arqU + ' | ' + C[x.k - 1].arqC, f: (x) => el('div', {style: 'font-size:11.5px;line-height:1.5'}, el('div', {}, el('span', {class: 'tag U'}, 'UMCQA'), ' ' + C[x.k - 1].arqU), el('div', {}, el('span', {class: 'tag C'}, 'CISAB'), ' ' + C[x.k - 1].arqC)), w: 1, sort: false},
    {t: 'Período UMCQA', v: (x) => per(x, 'U'), sort: false}, {t: 'Período CISAB', v: (x) => per(x, 'C'), sort: false},
    {t: 'Municípios', num: 1, v: (x) => x.r.mun.size}, {t: 'Localidades', num: 1, v: (x) => x.r.loc.size}, {t: 'Pontos de medição', num: 1, v: (x) => x.r.med.size},
    {t: 'Amostras coletadas', num: 1, v: (x) => x.r.col.size}, {t: 'Analisadas UMCQA', num: 1, v: (x) => x.r.amU.size}, {t: 'Analisadas CISAB', num: 1, v: (x) => x.r.amC.size},
    {t: 'Concluídas UMCQA', num: 1, v: (x) => x.r.concU}, {t: 'Concluídas CISAB', num: 1, v: (x) => x.r.concC},
    {t: '% concluídas', num: 1, v: (x) => pct(x.r.conc, x.r.reg), f: (x) => pcs(x.r.conc, x.r.reg)}]});
}
function tabMunicipios(ks, o) {
  const g = porGrupo(ks, (k) => rM[k]);
  return tabela({nome: 'municipios', unid: 'municípios', ord: o && o.ord != null ? o.ord : 6, alto: 1, lim: 40, rows: g, sel: (x) => x.k === S.mun, onRow: (x) => selecionaMun(x.k), cols: [
    {t: 'Município', v: (x) => MUN[x.k].n, f: (x) => el('b', {}, MUN[x.k].n)}, {t: 'UF', v: (x) => MUN[x.k].uf},
    {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)},
    {t: 'Localidades', num: 1, v: (x) => x.r.loc.size}, {t: 'Amostras coletadas', num: 1, v: (x) => x.r.col.size},
    {t: 'Analisadas UMCQA', num: 1, v: (x) => x.r.amU.size}, {t: 'Analisadas CISAB', num: 1, v: (x) => x.r.amC.size},
    {t: 'Análises concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Parâmetros', num: 1, v: (x) => x.r.parU.size + x.r.parC.size},
    {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)}]});
}
function tabLocalidades(ks, o) {
  const g = porGrupo(ks, (k) => rL[k]);
  return tabela({nome: 'localidades', unid: 'localidades e pontos', ord: 1, dir: 1, alto: 1, lim: 50, rows: g, sel: o && o.sel, onRow: (x) => { fechaDrawer(); ir('localidades', x.k); }, cols: [
    {t: 'Localidade ou ponto', v: (x) => L[x.k].n, f: (x) => el('span', {}, L[x.k].n, ' ', el('span', {class: 'muted', style: 'font-size:12px'}, L[x.k].c === 'F' ? L[x.k].k : L[x.k].c === 'M' ? 'medição' : 'sem forma')), w: 1},
    {t: 'Município', v: (x) => MUN[L[x.k].m].n}, {t: 'Tipo', v: (x) => L[x.k].t || '–'},
    {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)},
    {t: 'Amostras UMCQA', num: 1, v: (x) => x.r.amU.size}, {t: 'Amostras CISAB', num: 1, v: (x) => x.r.amC.size},
    {t: 'Análises concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)}]});
}
function tabParametros(ks, o) {
  const g = porGrupo(ks, (k) => R.p[k]);
  return tabela({nome: 'parametros', unid: 'parâmetros', ord: o && o.ord != null ? o.ord : 5, alto: 1, lim: o && o.lim || 40, rows: g, sel: (x) => x.k === S.par, onRow: (x) => abrePar(x.k, o && o.empilha), cols: [
    {t: 'Parâmetro', v: (x) => P[x.k].n, f: (x) => el('b', {}, P[x.k].n), w: 1}, {t: 'Instituição', v: (x) => INS[P[x.k].i], f: (x) => el('span', {class: 'tag ' + P[x.k].i}, INS[P[x.k].i])},
    {t: 'Grupo', v: (x) => P[x.k].g}, {t: 'Unidade', v: (x) => P[x.k].u || '–'},
    {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)},
    {t: 'Registros', num: 1, v: (x) => x.r.reg}, {t: 'Concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size},
    {t: 'Municípios', num: 1, v: (x) => x.r.mun.size}, {t: 'Localidades', num: 1, v: (x) => x.r.loc.size},
    {t: 'Resultados', v: (x) => x.r.foraU + x.r.foraC, f: (x) => miniStack(x.ks), x: (x) => foraTxt(x.r) + ' fora da referência', sort: false},
    {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)},
    {t: 'Referência', v: (x) => P[x.k].ref, f: (x) => el('span', {style: 'font-size:12px'}, P[x.k].ref), w: 1}]});
}
function tabAmostras(ks) {
  const g = porGrupo(ks, (k) => R.a[k]);
  return tabela({nome: 'amostras', unid: 'amostras', ord: 0, dir: 1, alto: 1, lim: 50, rows: g, onRow: (x) => abreAmostra(x.k, true), cols: [
    {t: 'Campanha', v: (x) => A[x.k].c, f: (x) => 'C' + A[x.k].c}, {t: 'Instituição', v: (x) => A[x.k].i, f: (x) => el('span', {class: 'tag ' + A[x.k].i}, INS[A[x.k].i])},
    {t: 'Amostra', v: (x) => A[x.k].id}, {t: 'Data', v: (x) => A[x.k].d, f: (x) => br(A[x.k].d)},
    {t: 'Município', v: (x) => MUN[A[x.k].m].n}, {t: 'Localidade ou ponto', v: (x) => L[A[x.k].l].n, w: 1},
    {t: 'Análises', num: 1, v: (x) => x.r.reg}, {t: 'Concluídas', num: 1, v: (x) => x.r.conc}, {t: 'Fora da referência', num: 1, v: (x) => x.r.foraU + x.r.foraC, f: (x) => foraTxt(x.r)},
    {t: 'Observação', v: (x) => (A[x.k].cm ? 'Mesma coleta da UMCQA' : '') + (A[x.k].od ? ' ' + A[x.k].od : ''), w: 1}]});
}
function tabRegistros(ks, o) {
  const cols = [
    {t: 'Campanha', v: (k) => rC[k], f: (k) => 'C' + rC[k]}, {t: 'Instituição', v: (k) => INS[rI[k] ? 'C' : 'U']},
    {t: 'Amostra', v: (k) => A[R.a[k]].id, f: (k) => el('button', {type: 'button', class: 'lk', onclick: () => abreAmostra(R.a[k], true)}, A[R.a[k]].id)},
    {t: 'Data', v: (k) => A[R.a[k]].d, f: (k) => br(A[R.a[k]].d)},
    {t: 'Município', v: (k) => MUN[rM[k]].n}, {t: 'Localidade ou ponto', v: (k) => L[rL[k]].n, w: 1},
    {t: 'Parâmetro', v: (k) => P[R.p[k]].n, f: (k) => linkPar(R.p[k]), w: 1},
    {t: 'Resultado na planilha', v: (k) => STR[R.r[k]]}, {t: 'Valor', num: 1, v: (k) => R.v[k], f: (k) => vf(R.v[k])}, {t: 'Unidade', v: (k) => P[R.p[k]].u || '–'},
    {t: 'Referência', v: (k) => refTxt(k)}, {t: 'Classificação', v: (k) => rcls(k), f: (k) => resTag(k)}, {t: 'Situação da análise', v: (k) => SIT[R.s[k]]},
    {t: 'Origem (arquivo · linha)', v: (k) => arq(k) + ' · linha ' + R.ln[k], f: (k) => el('span', {style: 'font-size:11.5px', class: 'muted'}, arq(k) + ' · linha ' + R.ln[k])}];
  const usa = o && o.sem ? cols.filter((c) => !o.sem.includes(c.t)) : cols;
  return tabela({nome: (o && o.nome) || 'registros', unid: 'registros', ord: null, alto: 1, lim: 80, rows: ks, cols: usa});
}
// amostra: todos os registros, com origem
function abreAmostra(ai, empilha) {
  const a = A[ai], ks = []; for (let k = 0; k < NR; k++) if (R.a[k] === ai) ks.push(k);
  abreDrawer('Amostra ' + a.id, INS[a.i] + ' · Campanha ' + a.c + ' · ' + munNome(a.m), (b) => {
    const r = resumo(ks);
    b.append(el('div', {class: 'mk'}, [['Data da coleta', br(a.d)], ['Análises', n(r.reg)], ['Concluídas', n(r.conc)], ['Fora da referência', foraTxt(r)]].map(([l, v]) => el('div', {}, el('div', {class: 'v'}, v), el('div', {class: 'l'}, l)))));
    b.append(el('div', {class: 'nota'}, el('div', {}, el('b', {}, 'Localidade: '), linkLoc(a.l), ' · ', linkMun(a.m)), a.pc ? el('div', {}, el('b', {}, 'Ponto de coleta: '), a.pc) : '', a.mx ? el('div', {}, el('b', {}, 'Matriz: '), a.mx) : '',
      a.cm ? el('div', {}, 'Mesma coleta da amostra ' + (a.tw || a.id) + ' da UMCQA (mesmo ponto de medição, município e campanha); conta uma vez nas amostras coletadas.') : '', a.od ? el('div', {}, el('b', {}, 'Data: '), a.od) : '',
      el('div', {class: 'muted', style: 'font-size:12.5px'}, 'Arquivo: ' + C[a.c - 1][a.i === 'C' ? 'arqC' : 'arqU'])));
    b.append(el('h3', {class: 'h4', style: 'margin-top:14px'}, 'Resultados da amostra'), tabRegistros(ks, {sem: ['Campanha', 'Instituição', 'Amostra', 'Data', 'Município', 'Localidade ou ponto'], nome: 'amostra_' + a.id}));
  }, empilha);
}
