// ===== 3. Análise por Localidade =====
const KS_LOC = L.map(() => []); for (let k = 0; k < NR; k++) KS_LOC[rL[k]].push(k);
const PU = Object.fromEntries(P.filter((p) => p.i === 'U').map((p) => [p.n, p.ix]));
V.localidades = (() => {
  let lista, det, selMun, q = '', cls = '', sel = -1, desc, filtroLoc = {c: 0, t: '', fora: false};
  function init(s) {
    desc = el('p', {});
    selMun = el('select', {'aria-label': 'Município', onchange: () => selecionaMun(+selMun.value, false)}, [...fMun.options].map((o) => el('option', {value: o.value}, o.textContent)));
    const busca = el('input', {type: 'search', placeholder: 'Buscar localidade ou código', 'aria-label': 'Buscar localidade', style: 'width:100%', oninput: (e) => { q = semAc(e.target.value.trim()); desenhaLista(); }});
    const tg = el('div', {class: 'toggles', style: 'margin-top:8px'}, [['', 'Todas'], ['F', 'Formas de abastecimento'], ['M', 'Medição na cidade']].map(([v, t]) => el('button', {type: 'button', class: 'tg', 'aria-pressed': String(cls === v), onclick: (e) => { cls = v; $$('.tg', tg).forEach((b) => b.setAttribute('aria-pressed', String(b === e.currentTarget))); desenhaLista(); }}, t)));
    lista = el('div', {class: 'loc-lista', role: 'list'});
    det = el('div', {});
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Análise por Localidade'), desc)),
      el('div', {class: 'loc-g'}, el('div', {class: 'card'}, el('label', {class: 'h4', style: 'display:block'}, 'Município'), selMun, el('div', {style: 'margin-top:8px'}, busca), tg, lista), det));
  }
  function itens() { return porGrupo(FR.filter((k) => (S.mun < 0 || rM[k] === S.mun)), (k) => rL[k]).filter((x) => (!cls || L[x.k].c === cls) && (!q || semAc(L[x.k].n + ' ' + L[x.k].k).includes(q))).sort((a, b) => MUN[L[a.k].m].n.localeCompare(MUN[L[b.k].m].n, 'pt-BR') || L[a.k].n.localeCompare(L[b.k].n, 'pt-BR')); }
  function desenhaLista() {
    const it = itens();
    lista.replaceChildren(...(it.length ? it.slice(0, 200).map((x) => el('button', {type: 'button', class: 'li', role: 'listitem', 'aria-current': String(x.k === sel), onclick: () => escolhe(x.k)},
      el('b', {}, L[x.k].n), el('span', {}, (L[x.k].c === 'F' ? L[x.k].k + ' · ' : L[x.k].c === 'M' ? 'Medição · ' : 'Sem forma · ') + (S.mun < 0 ? MUN[L[x.k].m].n + ' · ' : '') + (L[x.k].t || '') + ' · ' + n(x.r.amU.size + x.r.amC.size) + ' amostras'), el('div', {}, campDots(x.ks)))) : [el('div', {class: 'vazio'}, 'Nenhuma localidade com esses filtros.')]));
    if (it.length > 200) lista.append(el('p', {class: 'fonte'}, 'Mostrando 200 de ' + n(it.length) + '. Escolha um município ou use a busca.'));
  }
  function escolhe(li) {
    sel = li; filtroLoc = {c: 0, t: '', fora: false};
    if (history.replaceState) history.replaceState(null, '', '#/localidades/' + li);
    $$('.li', lista).forEach((b) => b.setAttribute('aria-current', 'false'));
    detalhe(true);
    desenhaLista();
    if (innerWidth < 900) det.scrollIntoView({behavior: RM.matches ? 'auto' : 'smooth', block: 'start'});
  }
  function render() {
    selMun.value = String(S.mun);
    desc.textContent = 'Escolha uma localidade para ver amostras, parâmetros, resultados individuais (até a linha da planilha) e a comparação com as demais localidades do município. ' + descFiltros() + '.';
    desenhaLista(); detalhe(false);
  }
  function detalhe(anim) {
    if (sel < 0) { det.replaceChildren(el('div', {class: 'card vazio'}, 'Selecione uma localidade na lista.', el('br'), el('span', {style: 'font-size:13px'}, 'Dica: escolha um município para reduzir a lista.'))); return; }
    const lo = L[sel], ks = KS_LOC[sel].filter((k) => passa(k, {noMun: true})), todos = KS_LOC[sel], r = resumo(ks);
    const box = el('div', {});
    box.append(el('div', {class: 'card'}, el('div', {class: 'muted', style: 'font-size:12px;text-transform:uppercase;letter-spacing:.05em'}, lo.c === 'F' ? 'Forma de abastecimento · ' + lo.k : lo.c === 'M' ? 'Ponto de medição na cidade (não conta como localidade)' : 'Registro sem forma de abastecimento identificada'),
      el('h3', {style: 'font-size:19px;margin:2px 0 4px'}, lo.n),
      el('div', {style: 'font-size:13.5px'}, 'Município: ', linkMun(lo.m), ' · ', MUN[lo.m].uf, lo.t ? ' · Tipo: ' + lo.t : '', ' · Campanhas: ', campDots(todos)),
      lo.o ? el('div', {class: 'nota'}, lo.o) : '',
      el('div', {class: 'mk mt'}, [['Amostras UMCQA', r.amU.size], ['Amostras CISAB', r.amC.size], ['Análises concluídas', r.conc], ['Parâmetros', r.parU.size + r.parC.size], ['Fora da referência', r.foraU + r.foraC]].map(([l, v]) => { const e = el('div', {class: 'v'}, '0'); conta(e, v); return el('div', {}, e, el('div', {class: 'l'}, l)); })),
      ks.length < todos.length ? el('p', {class: 'fonte'}, descFiltros({noMun: true}) + ' · ' + n(ks.length) + ' de ' + n(todos.length) + ' registros desta localidade.') : ''));
    if (!ks.length) { box.append(el('div', {class: 'card vazio mt'}, 'Sem registros desta localidade com os filtros atuais.')); det.replaceChildren(box); return; }
    box.append(acc('Amostras por campanha e instituição', () => tabAmostras(ks), true, n(r.amU.size + r.amC.size) + ' amostras'));
    box.append(acc('Parâmetros analisados', () => {
      const pU = [...r.parU], pC = [...r.parC], gC = agrupa(pC, (p) => P[p].g);
      const ac = (p) => ks.some((k) => R.p[k] === p && fora(k));
      return el('div', {}, pU.length ? el('div', {}, el('h4', {class: 'h4'}, 'UMCQA (' + pU.length + ')'), el('div', {class: 'pchips'}, pU.map((p) => el('button', {type: 'button', class: 'pchip' + (ac(p) ? ' bad' : ''), onclick: () => abrePar(p)}, P[p].n + (ac(p) ? ' ▲' : ''))))) : '',
        pC.length ? el('div', {style: 'margin-top:10px'}, el('h4', {class: 'h4'}, 'CISAB (' + pC.length + ')'), [...gC].sort().map(([g, ps]) => el('div', {style: 'margin:6px 0'}, el('div', {class: 'muted', style: 'font-size:12.5px'}, g), el('div', {class: 'pchips'}, ps.map((p) => el('button', {type: 'button', class: 'pchip' + (ac(p) ? ' bad' : ''), onclick: () => abrePar(p)}, P[p].n + (ac(p) ? ' ▲' : ''))))))) : '',
        el('p', {class: 'fonte'}, '▲ ao menos um resultado fora da referência nesta localidade.'));
    }, false, n(r.parU.size + r.parC.size) + ' parâmetros'));
    box.append(acc('Resultados individuais', () => {
      const alvo = el('div', {});
      const camps = [...r.camps].sort();
      const fc = el('select', {'aria-label': 'Campanha', onchange: () => { filtroLoc.c = +fc.value; aplica(); }}, el('option', {value: 0}, 'Todas as campanhas'), camps.map((c) => el('option', {value: c}, 'Campanha ' + c)));
      const ft = el('input', {type: 'search', placeholder: 'Filtrar parâmetro', 'aria-label': 'Filtrar parâmetro', oninput: () => { filtroLoc.t = semAc(ft.value.trim()); aplica(); }});
      const ff = el('label', {style: 'font-size:13px;display:inline-flex;gap:6px;align-items:center'}, el('input', {type: 'checkbox', onchange: (e) => { filtroLoc.fora = e.target.checked; aplica(); }}), 'Só fora da referência');
      let tb = null;
      const linhas = () => ks.filter((k) => (!filtroLoc.c || rC[k] === filtroLoc.c) && (!filtroLoc.t || semAc(P[R.p[k]].n).includes(filtroLoc.t)) && (!filtroLoc.fora || fora(k))).sort((a, b) => rC[a] - rC[b] || rI[a] - rI[b] || P[R.p[a]].n.localeCompare(P[R.p[b]].n, 'pt-BR'));
      function aplica() { if (tb) tb.atualiza(linhas()); else { tb = tabRegistros(linhas(), {sem: ['Município', 'Localidade ou ponto'], nome: 'resultados_' + lo.n}); alvo.append(tb); } }
      aplica();
      return el('div', {}, el('div', {class: 'controles', style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px'}, fc, ft, ff), alvo);
    }, true, n(ks.length) + ' registros'));
    box.append(acc('Comparação com as outras localidades de ' + MUN[lo.m].n, () => comparaLocs(lo.m), false));
    det.replaceChildren(box);
    if (anim) anima(box);
  }
  function comparaLocs(m) {
    const ks = KS_MUN[m].filter((k) => passa(k, {noMun: true, noPar: true}));
    const g = porGrupo(ks, (k) => rL[k]);
    const val = (x, par, f) => { const v = x.ks.filter((k) => R.p[k] === PU[par] && R.v[k] != null).map((k) => R.v[k]); return v.length ? f(...v) : null; };
    return el('div', {}, tabela({nome: 'comparacao_localidades_' + MUN[m].n, unid: 'localidades e pontos', lim: 60, ord: 0, dir: 1, rows: g, sel: (x) => x.k === sel, onRow: (x) => escolhe(x.k), cols: [
      {t: 'Localidade ou ponto', v: (x) => L[x.k].n, w: 1}, {t: 'Tipo', v: (x) => L[x.k].t || '–'}, {t: 'Campanhas', v: (x) => x.r.camps.size, f: (x) => campDots(x.ks), x: (x) => campLista(x.ks)},
      {t: 'Amostras', num: 1, v: (x) => x.r.amU.size + x.r.amC.size},
      {t: 'UMCQA não conformes', num: 1, v: (x) => pct(x.r.foraU, x.r.avU), f: (x) => (x.r.avU ? n(x.r.foraU) + ' de ' + n(x.r.avU) : '–')},
      {t: 'E. coli presente', num: 1, v: (x) => x.ks.filter((k) => R.p[k] === PU['E. coli'] && R.q[k] === 1).length},
      {t: 'Turbidez máx. (uT)', num: 1, v: (x) => val(x, 'Turbidez', Math.max), f: (x) => vf(val(x, 'Turbidez', Math.max))},
      {t: 'Cloro mín. (mg/L)', num: 1, v: (x) => val(x, 'Cloro residual livre', Math.min), f: (x) => vf(val(x, 'Cloro residual livre', Math.min))},
      {t: 'CISAB acima do VMP', num: 1, v: (x) => pct(x.r.foraC, x.r.avC), f: (x) => (x.r.avC ? n(x.r.foraC) + ' de ' + n(x.r.avC) : '–')},
      {t: 'Parâmetros acima do VMP', v: (x) => [...new Set(x.ks.filter((k) => R.f[k] === 'A').map((k) => P[R.p[k]].n))].join(', '), w: 1}]}),
      el('p', {class: 'fonte'}, 'Comparação com as mesmas regras para todas as localidades: UMCQA pela Portaria GM/MS nº 888/2021 e CISAB pelo VMP da planilha. Respeita os filtros de instituição e campanha.'));
  }
  return {init, render, sub: (li) => { li = +li; if (!L[li]) return; if (S.mun !== L[li].m) selecionaMun(L[li].m, false); sel = li; filtroLoc = {c: 0, t: '', fora: false}; render(); anima(det); }};
})();
