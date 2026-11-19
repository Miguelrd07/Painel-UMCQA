// ===== 7. Achados e encaminhamentos: cards com filtros, critérios de prioridade e evidências =====
const E = D.enc;
const pc = (a, b) => (b ? 100 * a / b : 0);
const v2 = (x) => x.toLocaleString('pt-BR', {maximumFractionDigits: 2});
const camposCamp = (o) => CS.filter((c) => o[c] != null);
// cada item: série por campanha [ocorrências, base], pontos com campanhas, textos e critérios calculados
const metCamp = Object.fromEntries(CS.map((c) => [c, ['Ferro', 'Alumínio', 'Manganês'].reduce((a, p) => [a[0] + E.met.camp[p][c][0], a[1] + E.met.camp[p][c][1]], [0, 0])]));
const clCamp = Object.fromEntries(CS.map((c) => [c, [E.cl.camp[c].med - E.cl.camp[c].conf, E.cl.camp[c].med]]));
const saiCamp = Object.fromEntries(CS.map((c) => [c, [E.tipo.SAI[c][1] - E.tipo.SAI[c][0], E.tipo.SAI[c][1]]]));
const ptsEc = E.ec.pts.map((p) => ({...p, cs: p.cs}));
const ptsCl = E.cl.pts.map((p) => ({...p, cs: Object.keys(p.v).map(Number).sort()}));
const ptsTu = E.tu.pts.map((p) => ({...p, cs: Object.keys(p.v).map(Number).sort()}));
const ptsMet = E.met.pts.map((p) => ({...p, cs: [...new Set(p.occ.map((o) => o[0]))].sort()}));
const piora = (s) => pc(...s[4]) - pc(...s[3]);
const T3 = E.tipo_tot;
const ITENS = [
  {id: 'ec', tipo: 'Microbiológica', titulo: 'Investigar os pontos com Escherichia coli recorrente', serie: E.ec.camp, rotSerie: 'medições com presença de E. coli', pts: ptsEc, saude: true, fonte: 'UMCQA', par: 'E. coli',
    ident: (c) => c ? 'Na Campanha ' + c + ', houve presença de E. coli em ' + n(E.ec.camp[c][0]) + ' de ' + n(E.ec.camp[c][1]) + ' medições (' + pcs(...E.ec.camp[c]) + '), em ' + n(ptsEc.filter((p) => p.cs.includes(c)).length) + ' pontos.'
      : 'Presença de E. coli em ' + n(E.ec.pres) + ' de ' + n(E.ec.med) + ' medições (' + pcs(E.ec.pres, E.ec.med) + '), em ' + n(ptsEc.length) + ' pontos; em ' + n(E.ec.rec) + ' deles, em duas ou mais campanhas.',
    onde: 'Arquivos da UMCQA das Campanhas 1 a 4, parâmetro E. coli (medições com resultado registrado).',
    relev: 'A Portaria GM/MS nº 888/2021 exige ausência de E. coli em 100 mL de água para consumo; a presença indica contaminação de origem fecal. Dos ' + n(ptsEc.length) + ' pontos com presença, ' + n(E.ec.tipos.SAI || 0) + ' são soluções alternativas individuais (SAI), ' + n(E.ec.tipos.SAA || 0) + ' sistemas de abastecimento (SAA) e ' + n(E.ec.tipos.SAC || 0) + ' soluções coletivas (SAC).',
    prov: 'Inspeção sanitária dos pontos com presença em duas ou mais campanhas, nova coleta para confirmação e orientação aos responsáveis pelo abastecimento e às famílias sobre tratamento e armazenamento da água.'},
  {id: 'cl', tipo: 'Desinfecção', titulo: 'Verificar a desinfecção onde o cloro ficou abaixo do mínimo', serie: clCamp, rotSerie: 'medições fora do intervalo de cloro residual livre', pts: ptsCl, saude: true, fonte: 'UMCQA', par: 'Cloro residual livre',
    ident: (c) => c ? 'Na Campanha ' + c + ', a conformidade do cloro residual livre foi de ' + pcs(E.cl.camp[c].conf, E.cl.camp[c].med) + ': ' + n(E.cl.camp[c].abaixo) + ' de ' + n(E.cl.camp[c].med) + ' medições ficaram abaixo de 0,2 mg/L.'
      : 'A conformidade do cloro residual livre caiu de ' + pcs(E.cl.camp[3].conf, E.cl.camp[3].med) + ' na Campanha 3 para ' + pcs(E.cl.camp[4].conf, E.cl.camp[4].med) + ' na Campanha 4; ' + n(E.cl.camp[4].abaixo) + ' das ' + n(E.cl.camp[4].med) + ' medições da Campanha 4 ficaram abaixo de 0,2 mg/L.',
    onde: 'Arquivos da UMCQA das Campanhas 1 a 4, parâmetro cloro residual livre. Nenhuma medição ficou acima de 5 mg/L.',
    relev: 'A Portaria GM/MS nº 888/2021 estabelece mínimo de 0,2 mg/L de cloro residual livre em toda a rede de distribuição; abaixo disso a água fica sem a proteção residual contra recontaminação. ' + n(ptsCl.length) + ' pontos ficaram abaixo do mínimo em ao menos uma campanha.',
    prov: 'Verificar a dosagem e a operação da desinfecção nos sistemas com pontos abaixo de 0,2 mg/L, sobretudo os da Campanha 4, e repetir a medição após a correção.'},
  {id: 'met', tipo: 'Química (metais)', titulo: 'Acompanhar ferro, alumínio e manganês na água distribuída', serie: metCamp, rotSerie: 'resultados de ferro, alumínio e manganês acima do VMP', pts: ptsMet, saude: false, fonte: 'CISAB', par: 'Ferro, alumínio e manganês',
    ident: (c) => (c ? 'Na Campanha ' + c + ': ' : '') + ['Ferro', 'Alumínio', 'Manganês'].map((p) => { const [a, b] = c ? E.met.camp[p][c] : CS.reduce((s, k) => [s[0] + E.met.camp[p][k][0], s[1] + E.met.camp[p][k][1]], [0, 0]); return p + ' acima do VMP em ' + n(a) + ' de ' + n(b) + ' resultados (' + pcs(a, b) + ')'; }).join('; ') + '.',
    onde: 'Arquivos complementares do CISAB das Campanhas 1 a 4, inclusive a Campanha 1 (' + C[0].arqC + '). Só entram resultados comparáveis ao VMP (quantificados ou com limite de quantificação abaixo do VMP).',
    relev: 'Ferro (VMP ' + v2(+E.met.vmp.Ferro) + ' mg/L), alumínio (' + v2(+E.met.vmp['Alumínio']) + ' mg/L) e manganês (' + v2(+E.met.vmp['Manganês']) + ' mg/L) fazem parte do padrão organoléptico da Portaria GM/MS nº 888/2021: acima do VMP podem alterar cor e sabor da água e manchar louças e roupas, o que leva à rejeição da água. Em água tratada, ' + n(E.met.mat['Água Tratada'][0]) + ' de ' + n(E.met.mat['Água Tratada'][1]) + ' resultados ficaram acima; em água bruta (superficial e subterrânea), ' + n(E.met.mat['Água Bruta Superficial'][0] + E.met.mat['Água Bruta Subterrânea'][0]) + ' de ' + n(E.met.mat['Água Bruta Superficial'][1] + E.met.mat['Água Bruta Subterrânea'][1]) + '.',
    prov: 'Verificar a etapa de tratamento nos sistemas com água tratada acima do VMP, avaliar a qualidade das captações com água bruta acima do VMP e manter os três parâmetros nas próximas campanhas.'},
  {id: 'sai', tipo: 'Tipo de abastecimento', titulo: 'Priorizar as soluções alternativas individuais', serie: saiCamp, rotSerie: 'medições não conformes em SAI', pts: null, saude: false, fonte: 'UMCQA', par: 'Cinco parâmetros da UMCQA, por tipo de abastecimento',
    ident: (c) => c ? 'Na Campanha ' + c + ', as SAI tiveram ' + pcs(...E.tipo.SAI[c]) + ' de conformidade, ante ' + pcs(...E.tipo.SAA[c]) + ' nos SAA e ' + pcs(...E.tipo.SAC[c]) + ' nas SAC.'
      : 'As medições em soluções alternativas individuais (SAI) tiveram ' + pcs(...T3.SAI) + ' de conformidade, ante ' + pcs(...T3.SAA) + ' nos sistemas de abastecimento (SAA) e ' + pcs(...T3.SAC) + ' nas soluções coletivas (SAC). As SAI ficaram abaixo dos SAA nas quatro campanhas.',
    onde: 'Arquivos da UMCQA das Campanhas 1 a 4: medições de E. coli, coliformes totais, cloro residual livre, turbidez e pH classificadas como conformes ou não conformes, por tipo de abastecimento.',
    relev: 'As SAI somam ' + n(E.tipo_pts.SAI) + ' pontos monitorados e concentram ' + n(E.ec.tipos.SAI || 0) + ' dos ' + n(ptsEc.length) + ' pontos com presença de E. coli. Sua conformidade ficou abaixo da dos SAA em todas as campanhas.',
    prov: 'Incluir as SAI como prioridade nas ações de orientação sobre tratamento domiciliar e proteção das fontes e manter seus pontos nas próximas campanhas.'},
  {id: 'tu', tipo: 'Física (turbidez)', titulo: 'Inspecionar os pontos com turbidez elevada recorrente', serie: E.tu.camp, rotSerie: 'medições de turbidez acima de 5 uT', pts: ptsTu, saude: false, fonte: 'UMCQA', par: 'Turbidez',
    ident: (c) => { const j = ptsTu[0]; return c ? 'Na Campanha ' + c + ', ' + n(E.tu.camp[c][0]) + ' de ' + n(E.tu.camp[c][1]) + ' medições ficaram acima de 5 uT (' + pcs(...E.tu.camp[c]) + ')' + (j.v[c] ? '; o ponto ' + j.n + ' (' + j.m + ') teve ' + v2(j.v[c]) + ' uT.' : '.')
      : 'O ponto ' + j.n + ' (' + j.m + ') ficou acima de 5 uT nas ' + n(Object.keys(j.v).length) + ' campanhas, com máximo de ' + v2(Math.max(...Object.values(j.v))) + ' uT. Ao todo, ' + n(ptsTu.length) + ' pontos passaram de 5 uT; ' + n(ptsTu.filter((p) => p.cs.length >= 2).length) + ' em duas ou mais campanhas.'; },
    onde: 'Arquivos da UMCQA das Campanhas 1 a 4, parâmetro turbidez.',
    relev: 'O VMP de turbidez na água distribuída é 5 uT (padrão organoléptico da Portaria GM/MS nº 888/2021). Turbidez elevada também pode reduzir a eficácia da desinfecção.',
    prov: 'Inspecionar o ponto ' + ptsTu[0].n + ' (' + ptsTu[0].m + ') e os demais pontos com turbidez acima de 5 uT em duas ou mais campanhas, identificando a origem e a necessidade de tratamento.'}];
// critérios de prioridade (calculados, não atribuídos)
for (const it of ITENS) {
  const recN = it.pts ? it.pts.filter((p) => p.cs.length >= 2).length : null;
  const persist = it.id === 'sai' && CS.every((c) => pc(...E.tipo.SAI[c]) < pc(...E.tipo.SAA[c]));
  it.crit = [
    {k: 'rec', ok: it.pts ? recN > 0 : persist, txt: it.pts ? 'Recorrência: ' + n(recN) + ' pontos em 2 ou mais campanhas' : 'Recorrência: abaixo dos SAA nas 4 campanhas'},
    {k: 'pio', ok: piora(it.serie) > 0, txt: (piora(it.serie) > 0 ? 'Piora' : 'Sem piora') + ' na Campanha 4: ' + (it.id === 'cl' || it.id === 'sai' ? 'não conformidade ' : '') + pcs(...it.serie[3]) + ' → ' + pcs(...it.serie[4])},
    {k: 'sau', ok: it.saude, txt: it.saude ? 'Parâmetro ligado à segurança microbiológica' : 'Parâmetro organoléptico ou indicador de conjunto'}];
  const k = it.crit.filter((c) => c.ok).length;
  it.prio = k === 3 ? 'Alta' : k === 2 ? 'Média' : 'Acompanhamento';
}
// filtros