// interface dos achados: filtros, cards expansíveis e evidências ligadas a município, localidade, parâmetro e registros
const corTipo = {'Microbiológica': 'var(--t1)', 'Desinfecção': 'var(--t2)', 'Química (metais)': 'var(--t3)', 'Tipo de abastecimento': 'var(--t4)', 'Física (turbidez)': 'var(--t5)'};
const PAR_IT = {ec: ['E. coli'], cl: ['Cloro residual livre'], tu: ['Turbidez'], sai: ['E. coli', 'Coliformes totais', 'Cloro residual livre', 'Turbidez', 'pH']};
ITENS.forEach((it) => { it.pars = it.id === 'met' ? ['Ferro', 'Alumínio', 'Manganês'].map((x) => pIx(x, 'C')) : PAR_IT[it.id].map((x) => PU[x]); });
const munIx = (nome) => { const m = MUN.find((x) => x.n === nome); return m ? m.ix : -1; };
function miniEnc(it, cSel) {
  const W = 300, H = 92, mb = 18, bw = 38, max = Math.max(...CS.map((c) => pc(...it.serie[c])));
  const svg = sv('svg', {viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': '% de ' + it.rotSerie + ' por campanha'});
  CS.forEach((c, j) => {
    const v = pc(...it.serie[c]), h = ((H - mb - 16) * v) / (max || 1), x = 20 + j * 70;
    const r = sv('rect', {class: 'bar', x, y: H - mb - h, width: bw, height: Math.max(1, h), rx: 2, fill: corTipo[it.tipo], opacity: cSel && cSel !== c ? 0.3 : 1, tabindex: '0', role: 'button', 'aria-label': 'Campanha ' + c + ': ' + p1(v) + '%'});
    r.addEventListener('pointermove', (e) => dica(e, ['Campanha ' + c, n(it.serie[c][0]) + ' de ' + n(it.serie[c][1]) + ' ' + it.rotSerie + ' (' + p1(v) + '%)', 'Clique para filtrar os achados pela campanha']));
    r.addEventListener('pointerleave', someDica);
    const go = () => { V.achados.campanha(cSel === c ? 0 : c); }; r.addEventListener('click', go); r.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    const t = sv('text', {x: x + bw / 2, y: H - mb - h - 4, 'text-anchor': 'middle', class: 'v'}); t.textContent = p1(v) + '%';
    const t2 = sv('text', {x: x + bw / 2, y: H - 4, 'text-anchor': 'middle'}); t2.textContent = 'C' + c;
    svg.append(r, t, t2);
  });
  return el('div', {class: 'chart hist'}, svg);
}
function ptsFiltrados(it, cSel, sit, mun) { return it.pts ? it.pts.filter((p) => (!cSel || p.cs.includes(cSel)) && (!sit || (sit === 'rec' ? p.cs.length >= 2 : p.cs.length === 1)) && (mun < 0 || p.m === MUN[mun].n)) : []; }
function tabelaPts(it, cSel, sit, mun) {
  const pts = ptsFiltrados(it, cSel, sit, mun);
  if (!pts.length) return el('p', {class: 'fonte'}, 'Nenhum ponto com esses filtros.');
  const cel = (p, c) => (it.id === 'met' ? p.occ.filter((o) => o[0] === c).map((o) => o[1].slice(0, 2) + ' ' + vf(o[2])).join(' · ') || '–' : it.id === 'ec' ? (p.cs.includes(c) ? 'Presença' : '–') : p.v[c] != null ? vf(p.v[c]) : '–');
  const unid = it.id === 'cl' ? 'mg/L, só abaixo de 0,2' : it.id === 'tu' ? 'uT, só acima de 5' : it.id === 'met' ? 'mg/L, só acima do VMP; Fe, Al, Mn' : '';
  return el('div', {}, el('p', {class: 'fonte', style: 'margin:0 0 6px'}, n(pts.length) + ' de ' + n(it.pts.length) + ' pontos' + (unid ? ' · valores em ' + unid : '') + ' · clique na localidade para ver os resultados individuais'),
    tabela({nome: 'achado_' + it.id, unid: 'pontos', barra: true, lim: 30, ord: null, rows: pts, cols: [
      {t: it.id === 'met' ? 'Local (como na planilha do CISAB)' : 'Localidade', v: (p) => p.n, f: (p) => (p.li >= 0 ? el('button', {type: 'button', class: 'lk', onclick: () => ir('localidades', p.li)}, (p.p ? p.p + ' · ' : '') + p.n) : p.n), w: 1},
      {t: 'Município', v: (p) => p.m, f: (p) => { const m = munIx(p.m); return m >= 0 ? linkMun(m) : p.m; }}, {t: 'Tipo', v: (p) => p.t + (p.mat ? ' · ' + p.mat.replace('Água ', '') : '')},
      ...CS.map((c) => ({t: 'C' + c, v: (p) => cel(p, c), f: (p) => el('span', {style: p.cs.includes(c) ? 'font-weight:600;color:var(--tc)' : 'color:var(--muted)'}, cel(p, c)), sort: false})),
      {t: 'Campanhas', num: 1, v: (p) => p.cs.length, f: (p) => el('span', {class: 'tag', style: p.cs.length >= 2 ? 'color:var(--bad)' : ''}, p.cs.length >= 2 ? 'Recorrente · ' + p.cs.length : '1')}]}));
}
function tabelaSai(cSel) {
  const ps = ['E. coli', 'Coliformes totais', 'Cloro residual livre', 'Turbidez', 'pH'];
  return el('div', {class: 'tb-box'}, el('table', {}, el('caption', {style: 'text-align:left;font-size:12px;color:var(--muted);padding:6px 10px'}, 'Conformidade das medições da UMCQA por tipo de abastecimento'),
    el('thead', {}, el('tr', {}, el('th', {class: 'l'}, 'Tipo'), el('th', {}, 'Pontos'), CS.map((c) => el('th', {style: cSel === c ? 'background:var(--hi)' : ''}, 'C' + c)), el('th', {}, 'Total'), ps.map((p) => el('th', {}, p)))),
    el('tbody', {}, ['SAA', 'SAC', 'SAI'].map((tp) => el('tr', {style: tp === 'SAI' ? 'font-weight:600' : ''}, el('td', {class: 'l'}, tp), el('td', {}, n(E.tipo_pts[tp])), CS.map((c) => el('td', {title: n(E.tipo[tp][c][0]) + ' de ' + n(E.tipo[tp][c][1]), style: cSel === c ? 'background:var(--hi)' : ''}, pcs(...E.tipo[tp][c]))),
      el('td', {}, pcs(...T3[tp])), ps.map((p) => el('td', {title: n(E.tipo_par[tp][p][0]) + ' de ' + n(E.tipo_par[tp][p][1])}, pcs(...E.tipo_par[tp][p]))))))));
}
function extraEnc(it) {
  if (it.id !== 'met') return '';
  const o = E.outros.filter((x) => !['Ferro', 'Alumínio', 'Manganês'].includes(x[0]));
  return el('div', {class: 'ctx'}, el('b', {}, 'Contexto: outros parâmetros do CISAB acima do VMP (Campanhas 1 a 4): '),
    el('div', {class: 'pchips', style: 'margin-top:4px'}, o.map((x) => { const pi = pIx(x[0], 'C'); return el('button', {type: 'button', class: 'pchip bad', onclick: () => abrePar(pi)}, x[0] + ' ' + n(x[1]) + '/' + n(x[2])); })),
    el('div', {style: 'margin-top:6px'}, 'Não geram encaminhamento próprio nesta versão. Municípios com mais resultados de Fe, Al e Mn acima do VMP: ' + E.met.mun.slice(0, 6).map((x) => x[0] + ' (' + x[1] + ')').join(' · ') + '.'));
}
V.achados = (() => {
  let desc, fC, fT, fP, fS, ind, box, info, sync;
  const abertos = new Set();
  function init(s) {
    desc = el('p', {});
    const opt = (pairs) => pairs.map(([v, t]) => el('option', {value: v}, t));
    fC = el('select', {onchange: render}, opt([['', 'Campanhas 1 a 4'], ...CS.map((c) => [c, 'Campanha ' + c])]));
    fT = el('select', {onchange: render}, opt([['', 'Todos'], ...[...new Set(ITENS.map((i) => i.tipo))].map((t) => [t, t])]));
    fP = el('select', {onchange: render}, opt([['', 'Todas'], ['Alta', 'Alta'], ['Média', 'Média'], ['Acompanhamento', 'Acompanhamento']]));
    fS = el('select', {onchange: render}, opt([['', 'Todas'], ['rec', 'Recorrentes (2 ou mais campanhas)'], ['uma', 'Em uma campanha']]));
    const lab = (t, e) => el('label', {style: 'display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted);flex:1 1 170px;max-width:240px'}, t, e);
    ind = el('div', {class: 'mis'}); box = el('div', {class: 'enc-lista'}); info = el('p', {class: 'fonte', style: 'margin:-4px 0 10px'}); sync = el('div', {});
    s.append(el('div', {class: 'vh'}, el('div', {}, el('h2', {}, 'Principais Achados e Encaminhamentos'), desc)),
      el('div', {class: 'aviso'}, el('b', {}, 'Encaminhamentos sugeridos a partir dos resultados das campanhas. '), 'Não são providências já adotadas: as planilhas não registram decisões ou ações. Só há alerta onde existe referência (Portaria GM/MS nº 888/2021 para a UMCQA; VMP da planilha para o CISAB).'),
      el('div', {class: 'card'}, el('div', {style: 'display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end'}, lab('Campanha', fC), lab('Tipo de ocorrência', fT), lab('Prioridade', fP), lab('Situação dos pontos', fS),
        el('button', {type: 'button', class: 'btn', onclick: () => { fC.value = fT.value = fP.value = fS.value = ''; render(); }}, 'Limpar'),
        el('button', {type: 'button', class: 'btn', onclick: () => { const cs = $$('.ec', box), ab = cs.some((c) => !c.classList.contains('aberto')); cs.forEach((c) => (ab ? c.abre() : c.fecha())); }}, 'Abrir ou fechar todos')), sync),
      ind, info, box,
      acc('Como a prioridade é calculada', el('div', {style: 'font-size:13.5px'}, el('p', {style: 'margin:0'}, 'A prioridade conta quantos destes três critérios os dados atendem: alta = 3; média = 2; acompanhamento = 1 ou nenhum. Nenhuma gravidade é atribuída sem esses critérios.'),
        el('ol', {}, ['Recorrência: a ocorrência se repete nos mesmos pontos em duas ou mais campanhas', 'Piora: o percentual de ocorrência subiu da Campanha 3 para a Campanha 4', 'Segurança microbiológica: E. coli ou desinfecção (cloro residual livre)'].map((t) => el('li', {}, t))))));
  }
  function render() {
    const c = +fC.value || 0, tp = fT.value, pr = fP.value, sit = fS.value, mun = S.mun;
    desc.textContent = 'Cada achado mostra parâmetro, município e localidade, campanha, instituição, o resultado que o fundamenta e a providência técnica possível. Clique num card para abrir.' + (mun >= 0 ? ' Mostrando só os pontos de ' + munNome(mun) + ' (filtro do topo).' : '');
    sync.replaceChildren(mun >= 0 ? el('div', {class: 'selbar', style: 'margin:10px 0 0'}, 'Pontos limitados a ', el('b', {}, munNome(mun)), el('button', {type: 'button', class: 'lk', onclick: () => { S.mun = -1; atualiza(); }}, 'mostrar todos os municípios')) : '');
    const lista = ITENS.filter((it) => (!tp || it.tipo === tp) && (!pr || it.prio === pr) && (!c || it.serie[c][0] > 0) && (!sit || !it.pts || ptsFiltrados(it, c, sit, -1).length) && (mun < 0 || !it.pts || ptsFiltrados(it, c, sit, mun).length));
    const vals = [['Achados exibidos', n(lista.length) + ' de ' + n(ITENS.length)], ['Prioridade alta', n(lista.filter((i) => i.prio === 'Alta').length)], ['Pontos ou locais citados', n(lista.reduce((a, i) => a + ptsFiltrados(i, c, sit, mun).length, 0))], ['Recorrentes (2+ campanhas)', n(lista.reduce((a, i) => a + ptsFiltrados(i, c, sit, mun).filter((p) => p.cs.length >= 2).length, 0))]];
    ind.replaceChildren(...vals.map(([l, v]) => el('div', {class: 'mi'}, el('div', {class: 'v'}, v), el('div', {class: 'l'}, l))));
    info.textContent = c ? 'Números da Campanha ' + c + '.' : 'Números das Campanhas 1 a 4.';
    box.replaceChildren();
    if (!lista.length) box.append(el('div', {class: 'card vazio'}, 'Nenhum achado com esses filtros.'));
    for (const it of lista) {
      const num = ITENS.indexOf(it) + 1, sc = c ? it.serie[c] : CS.reduce((a, k) => [a[0] + it.serie[k][0], a[1] + it.serie[k][1]], [0, 0]);
      const cab = el('div', {style: 'display:contents'}, el('span', {class: 'num'}, String(num)),
        el('div', {}, el('div', {class: 'chips'}, el('span', {class: 'chip tipo'}, it.tipo), el('span', {class: 'chip prio ' + it.prio.toLowerCase()}, 'Prioridade ' + it.prio.toLowerCase()), el('span', {class: 'chip'}, it.fonte + (c ? ' · Campanha ' + c : ' · Campanhas 1 a 4'))),
          el('b', {class: 'tit'}, it.titulo), el('p', {class: 'rs'}, it.ident(c))),
        el('div', {class: 'big'}, el('div', {class: 'v'}, pcs(...sc)), el('div', {class: 'l'}, n(sc[0]) + ' de ' + n(sc[1]) + ' ' + it.rotSerie)));
      const corpo = () => {
        const q = (t, x) => el('div', {class: 'q'}, el('h4', {}, t), el('p', {}, x));
        return el('div', {},
          el('div', {class: 'qs'}, q('1. O que foi identificado', it.ident(c)), q('2. Onde foi identificado', it.onde), q('3. Relevância para o monitoramento', it.relev), q('4. Providência técnica possível', it.prov),
            el('div', {class: 'q'}, el('h4', {}, '5. Fundamento'), el('ul', {class: 'crit'}, it.crit.map((k) => el('li', {class: k.ok ? 'ok' : 'no'}, k.txt))), el('p', {class: 'fonte', style: 'margin:4px 0 0'}, 'Prioridade ' + it.prio.toLowerCase() + ': ' + it.crit.filter((k) => k.ok).length + ' de 3 critérios.'))),
          el('div', {style: 'margin-top:10px;font-size:13px'}, el('b', {}, 'Parâmetro' + (it.pars.length > 1 ? 's' : '') + ' relacionado' + (it.pars.length > 1 ? 's' : '') + ': '), el('span', {class: 'pchips', style: 'display:inline-flex'}, it.pars.map((pi) => el('button', {type: 'button', class: 'pchip', onclick: () => abrePar(pi)}, P[pi].n))), ' · Instituição responsável pela análise: ' + it.fonte),
          el('div', {class: 'ev-grid'}, el('div', {}, el('h4', {class: 'h4'}, '% de ' + it.rotSerie + ' por campanha'), miniEnc(it, c)), el('div', {style: 'min-width:0'}, it.pts ? tabelaPts(it, c, sit, mun) : tabelaSai(c))),
          extraEnc(it),
          el('div', {class: 'acoes'}, el('button', {type: 'button', class: 'lk', onclick: () => { const ks = filtra({noPar: true, noCamp: !!c}, (k) => it.pars.includes(R.p[k]) && (!c || rC[k] === c) && fora(k)); abreDrawer('Registros que fundamentam o achado', it.titulo, (b) => b.append(tabRegistros(ks, {nome: 'fundamento_' + it.id}))); }}, 'Ver os registros fora da referência →'),
            el('button', {type: 'button', class: 'lk', onclick: () => abrePar(it.pars[0])}, 'Abrir o parâmetro →'), el('button', {type: 'button', class: 'lk', onclick: () => ir('campanhas')}, 'Comparar campanhas →')));
      };
      const card = acc(cab, corpo, abertos.has(it.id), null, 'ec');
      card.style.setProperty('--tc', corTipo[it.tipo]);
      card.addEventListener('alterna', (e) => { e.detail ? abertos.add(it.id) : abertos.delete(it.id); });
      box.append(card);
    }
    anima(box);
  }
  return {init, render, campanha: (c) => { fC.value = c ? String(c) : ''; render(); }};
})();
// achados de um município (para o painel lateral)
function achadosMun(nome) {
  const m = munIx(nome), blocos = [];
  for (const it of ITENS) {
    if (!it.pts) continue;
    const pts = it.pts.filter((p) => p.m === nome);
    if (!pts.length) continue;
    blocos.push(el('div', {style: 'margin-bottom:12px'}, el('div', {style: 'display:flex;gap:8px;align-items:center;flex-wrap:wrap'}, el('span', {class: 'chip prio ' + it.prio.toLowerCase()}, 'Prioridade ' + it.prio.toLowerCase()), el('b', {}, it.titulo)),
      el('ul', {style: 'margin:4px 0 0;padding-left:18px;font-size:13px'}, pts.map((p) => el('li', {}, p.li >= 0 ? el('button', {type: 'button', class: 'lk', onclick: () => { fechaDrawer(); ir('localidades', p.li); }}, p.n) : p.n, ' · campanhas ' + p.cs.join(', ') +
        (it.id === 'met' ? ' · ' + p.occ.map((o) => o[1] + ' ' + vf(o[2]) + ' mg/L (C' + o[0] + ')').join('; ') : it.id === 'ec' ? ' · presença de E. coli' : ' · ' + Object.entries(p.v).map(([c, v]) => vf(v) + (it.id === 'cl' ? ' mg/L' : ' uT') + ' (C' + c + ')').join('; ')))))));
  }
  return el('div', {}, blocos.length ? blocos : el('p', {class: 'muted'}, 'Nenhum ponto deste município entre os achados.'), el('button', {type: 'button', class: 'btn', onclick: () => { fechaDrawer(); ir('achados'); }}, 'Abrir Achados e Encaminhamentos'));
}
