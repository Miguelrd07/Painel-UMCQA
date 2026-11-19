# Monta o painel em arquivo único: python3 build.py (gera ../../Execucao_2026_UMCQA_CISAB.html)
import os
D = os.path.dirname(os.path.abspath(__file__)) + '/'
PARTES = ['core.js', 'nav.js', 'common.js', 'v_geral.js', 'v_mun.js', 'v_loc.js', 'v_par.js', 'v_inst.js', 'v_camp.js', 'ach_head.js', 'ach_body.js', 'start.js']
js = '\n'.join(open(D + f, encoding='utf-8').read() for f in PARTES)
dados = open(D + 'data.json', encoding='utf-8').read().replace('</', '<\\/')
html = open(D + 'shell.html', encoding='utf-8').read().replace('/*APP*/', js.replace('/*DADOS*/null', dados, 1))
open(D + '../../Execucao_2026_UMCQA_CISAB.html', 'w', encoding='utf-8').write(html)
print('ok', len(html.encode()) // 1024, 'KB')
