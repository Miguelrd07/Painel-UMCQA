// ===== Áreas, rotas e filtros globais =====
const AREAS = [['geral', 'Visão Geral'], ['municipios', 'Análise por Município'], ['localidades', 'Análise por Localidade'], ['parametros', 'Parâmetros Monitorados'], ['instituicoes', 'Comparativo UMCQA x CISAB'], ['campanhas', 'Comparativo entre Campanhas'], ['achados', 'Achados e Encaminhamentos']];
const V = {};
let atual = null;
const main = $('#main');
AREAS.forEach(([id, t], i) => {
  $('#abas').append(el('a', {href: '#/' + id, 'data-v': id}, el('span', {class: 'k'}, String(i + 1)), t));
  main.append(el('section', {class: 'view', id: 'v-' + id, 'aria-label': t}));
});
function render(v) { const X = V[v]; if (!X) return; if (!X.ok) { X.init($('#v-' + v)); X.ok = true; } if (X.ver !== S.ver) { X.render(); X.ver = S.ver; } }
function mostra(v, sub) {
  if (!V[v]) v = 'geral';
  const nova = $('#v-' + v), old = $('.view.ativo');
  $$('#abas a').forEach((a) => a.setAttribute('aria-current', a.dataset.v === v ? 'page' : 'false'));
  const ativa = () => {
    atual = v; render(v); nova.classList.add('ativo');
    if (sub != null && V[v].sub) V[v].sub(sub);
    const lim = $('.fixo').offsetTop; if (scrollY > lim) scrollTo({top: lim, behavior: RM.matches ? 'auto' : 'smooth'});
    const aba = $('#abas a[data-v="' + v + '"]'); if (aba) aba.scrollIntoView({block: 'nearest', inline: 'nearest'});
  };
  if (old === nova) { ativa(); return; }
  if (old && !RM.matches) { old.classList.add('saindo'); setTimeout(() => { old.classList.remove('ativo', 'saindo'); ativa(); }, 130); }
  else { if (old) old.classList.remove('ativo'); ativa(); }
}
function rota() { const [v, ...s] = location.hash.replace(/^#\/?/, '').split('/'); mostra(v || 'geral', s.length && s[0] !== '' ? decodeURIComponent(s.join('/')) : null); }
function ir(v, sub) { const h = '#/' + v + (sub != null ? '/' + encodeURIComponent(sub) : ''); if (location.hash === h) rota(); else location.hash = h; }
addEventListener('hashchange', rota);
// filtros
const fInst = $('#f-inst'), fCamp = $('#f-camp'), fMun = $('#f-mun'), fPar = $('#f-par');
CS.forEach((c) => fCamp.append(el('button', {type: 'button', 'data-v': c, 'aria-pressed': 'true', title: 'Campanha ' + c + ' (clique para incluir ou retirar)'}, 'C' + c)));
fMun.append(el('option', {value: '-1'}, 'Todos (' + MUN.length + ')'), ...[...MUN].sort((a, b) => a.n.localeCompare(b.n, 'pt-BR')).map((m) => el('option', {value: m.ix}, m.n + ' · ' + m.uf)));
{
  fPar.append(el('option', {value: '-1'}, 'Todos (' + P.length + ')'));
  fPar.append(el('optgroup', {label: 'UMCQA'}, P.filter((p) => p.i === 'U').map((p) => el('option', {value: p.ix}, p.n))));
  const gs = [...new Set(P.filter((p) => p.i === 'C').map((p) => p.g))].sort();
  for (const g of gs) fPar.append(el('optgroup', {label: 'CISAB · ' + g}, P.filter((p) => p.i === 'C' && p.g === g).sort((a, b) => a.n.localeCompare(b.n, 'pt-BR')).map((p) => el('option', {value: p.ix}, p.n))));
}
function pintaFiltros() {
  $$('button', fInst).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === S.inst)));
  $$('button', fCamp).forEach((b) => b.setAttribute('aria-pressed', String(S.camps.has(+b.dataset.v))));
  fMun.value = String(S.mun); fPar.value = String(S.par);
  const r = resumo(FR);
  $('#f-sel').textContent = n(FR.length) + ' registros · ' + n(r.amU.size + r.amC.size) + ' amostras analisadas';
  const ativos = (S.inst ? 1 : 0) + (S.camps.size < 4 ? 1 : 0) + (S.mun >= 0 ? 1 : 0) + (S.par >= 0 ? 1 : 0);
  $('#f-tog').textContent = 'Filtros' + (ativos ? ' (' + ativos + ')' : '');
  $('#f-limpa').disabled = !ativos;
}
let tAtu = 0;
function atualiza() {
  S.ver++; document.body.classList.add('carregando');
  clearTimeout(tAtu);
  tAtu = setTimeout(() => {
    FR = filtra(); pintaFiltros();
    if (atual) render(atual);
    setTimeout(() => document.body.classList.remove('carregando'), 200);
  }, 40);
}
function defFiltro(k, v) {
  if (k === 'camp') { if (S.camps.has(v)) { if (S.camps.size > 1) S.camps.delete(v); } else S.camps.add(v); }
  else S[k] = v;
  atualiza();
}
fInst.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) defFiltro('inst', b.dataset.v); });
fCamp.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) defFiltro('camp', +b.dataset.v); });
fMun.addEventListener('change', () => defFiltro('mun', +fMun.value));
fPar.addEventListener('change', () => defFiltro('par', +fPar.value));
$('#f-limpa').addEventListener('click', () => { S.inst = ''; S.camps = new Set(CS); S.mun = -1; S.par = -1; atualiza(); });
$('#f-tog').addEventListener('click', () => { const o = $('#filtros').classList.toggle('aberto'); $('#f-tog').setAttribute('aria-expanded', String(o)); });
// descrição textual dos filtros ativos
function descFiltros(o) {
  const t = [];
  if (S.inst && !(o && o.noInst)) t.push(INS[S.inst]);
  if (S.camps.size < 4 && !(o && o.noCamp)) t.push('Campanhas ' + [...S.camps].sort().join(', '));
  if (S.mun >= 0 && !(o && o.noMun)) t.push(munNome(S.mun));
  if (S.par >= 0 && !(o && o.noPar)) t.push(P[S.par].n + ' (' + INS[P[S.par].i] + ')');
  return t.length ? 'Filtros: ' + t.join(' · ') : 'Sem filtros: todas as campanhas, instituições, municípios e parâmetros';
}
const cabView = (titulo, texto, extra) => el('div', {class: 'vh'}, el('div', {}, el('h2', {}, titulo), el('p', {}, texto)), extra || '');
// selecionar município: filtra todo o painel e abre a análise detalhada
function selecionaMun(m, abrir) {
  if (S.mun !== m) { S.mun = m; atualiza(); }
  if (abrir !== false) abreMun(m);
}
$('#rodape').append(
  el('p', {}, el('b', {}, 'Fonte: '), 'planilhas originais das campanhas 1 a 4 de 2026 (arquivos da UMCQA e arquivos complementares do CISAB). Cada registro do painel traz o arquivo e a linha da planilha de origem.'),
  el('p', {}, 'Referências: UMCQA, Portaria GM/MS nº 888/2021 (cloro residual livre de 0,2 a 5 mg/L; turbidez até 5 uT; pH de 6,0 a 9,0; ausência de coliformes totais e E. coli). CISAB, valor máximo permitido (VMP) que consta na própria planilha. Resultados sem referência não são classificados.'),
  el('p', {}, 'Elaboração: Coordenação-Geral de Saúde Ambiental (CGSAM) · DESAM · FUNASA · 2026'));
