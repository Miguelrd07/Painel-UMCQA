# Painel UMCQA – Campanhas

Análise da qualidade da água nas quatro campanhas UMCQA (MG e ES): 2.445 registros, 489 amostras, 173 pontos e 32 municípios, com cinco parâmetros por amostra (cloro residual livre, turbidez, pH, coliformes totais e *E. coli*).

**Autoria:** Miguel Rodrigues · 2026

## Arquivos

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
