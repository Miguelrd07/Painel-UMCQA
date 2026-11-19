# Painel UMCQA – Campanhas

Análise da qualidade da água nas quatro campanhas UMCQA (MG e ES): 2.445 registros, 489 amostras, 173 pontos e 32 municípios, com cinco parâmetros por amostra (cloro residual livre, turbidez, pH, coliformes totais e *E. coli*).

**Autoria:** Miguel Rodrigues · 2026

## Execução 2026 · UMCQA e CISAB (campanhas 1 a 4)

| Arquivo | O que é |
|---|---|
| `Execucao_2026_UMCQA_CISAB.html` | Painel interativo em arquivo único (funciona sem internet). Sete áreas: Visão Geral, Análise por Município, Análise por Localidade, Parâmetros Monitorados, Comparativo UMCQA x CISAB, Comparativo entre Campanhas e Achados e Encaminhamentos. Traz os 32.091 registros das oito planilhas originais, cada um com arquivo e linha de origem. Elaboração: CGSAM/DESAM/FUNASA. |
| `Execucao_Campanhas_UMCQA_CISAB_2026.xlsx` | Planilha consolidada de execução das campanhas para instrução de processo no SEI, com memória de cálculo por fórmula. |
| `fonte/painel-interativo/` | Código-fonte do painel. Para gerar de novo o HTML: `python3 fonte/painel-interativo/build.py`. |

Números da base: 4 campanhas, 32 municípios, 109 localidades (formas de abastecimento), 897 amostras coletadas (961 analisadas: UMCQA 489, CISAB 472; 64 amostras do CISAB da Campanha 1 são as mesmas coletas da UMCQA), 30.676 análises concluídas e 102 parâmetros distintos (UMCQA 5, CISAB 97, nenhum equivalente entre as instituições).

## Arquivos do painel UMCQA (versão anterior)

| Arquivo | O que é |
|---|---|
| `Painel_UMCQA.html` | Dashboard interativo em arquivo único. Baixe e abra no navegador; funciona sem internet. |
| `Painel_UMCQA.xlsx` | Base consolidada e resumos por campanha, parâmetro, tipo de abastecimento e município, calculados por fórmula. |
| `Relatorio_UMCQA.docx` | Relatório executivo e analítico com tabelas, gráficos, conclusões e encaminhamentos. |
| `dados/umcqa_registros.csv` | Base consolidada das quatro planilhas, um registro por parâmetro e amostra. |

## Método

- Referências de conformidade adotadas com base na Portaria GM/MS nº 888/2021: cloro residual livre de 0,2 a 5,0 mg/L; turbidez de até 5,0 uT; pH de 6,0 a 9,0; coliformes totais e *E. coli* ausentes.
- Conformidade é a parcela das medições com resultado que atende à referência. Registros sem resultado, "não se aplica" ou inconsistentes ficam fora do cálculo.
- A planilha "Resultados básicos UMCQA final" (coletas de junho) foi tratada como 2ª campanha.
- Valores de pH idênticos à turbidez da mesma amostra, ou fora de faixa plausível, foram marcados como inconsistentes.

## Aviso

Os arquivos contêm nomes de moradores usados como identificação de pontos de coleta. Mantenha este repositório privado e não redistribua os dados sem autorização.
