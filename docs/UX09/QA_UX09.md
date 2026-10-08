# UX-09 — QA e critérios de aceitação

**Status: CONCLUÍDA E AUDITADA nos testes automatizados.** Pipeline de validação [GitHub Actions 37760055985](https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37760055985), `35/35` core, `8/8` Chromium, build e regressão PASS. O CI monta os arquivos Windows offline, mas **não executa smoke test num Windows real**.

| Gate | Regra |
|---|---|
| Core UX-09 | 35/35 PASS sobre plano, dimensões reais, paginação e SHA-256 |
| Chromium UX-09 | 8 cenários; PDF real `%PDF-`, duas folhas e dimensão física, impressão no visualizador |
| Regressão UX-02 a UX-08 | Sem perda de símbolos, PipeRuns, mounts, tabelas ou snapshots |
| PDF em milímetros | Formatos A0–A4/CUSTOM, retrato e paisagem |
| Todas as folhas vs atual | Contagem, ordem, escopo e isolamento editorial corretos |
| END/TML e soldas | Tabelas geradas de registros existentes; status PLANNED e SEM MEDIÇÃO intactos |
| Continuação de tabela | Nenhuma linha é descartada silenciosamente quando habilitada |
| Emissão controlada | Apenas snapshot imutável aprovado e SHA-256 atual |
| Pós-edição | SHA divergente bloqueia liberação controlada |
| PDF sem assinatura | Identificação explícita e ledger de `DOWNLOAD_SOLICITADO_NAO_ASSINADO` |
| UI isolada | Nenhum botão, menu, cursor ou seleção impressos |
| Montagem Windows | CI gera pacote, smoke test em Windows real pendente |

## Evidências geradas pelo Chromium
- `ux09-document-dialog-a3.png`
- `ux09-multipage-size-plan.png`
- `ux09-table-continuation-plan.png`
- `ux09-controlled-hash-gate.png`
- `ux09-actual-one-page.pdf`
- `ux09-actual-mixed-formats.pdf`
- `ux09-multipage-pdf-download.png`

## Limites de conformidade
Testes automatizados não substituem auditoria independente de paginação em drivers reais, assinaturas digitais, materiais normativos licenciados, fidelidade de underlays/fontes externas, validação legal do documento ou conferência metrológica de uma impressão física.

**Próxima fase**: UX-10 somente mediante comando “Pode seguir”, após entrega final UX-09.

## Revisão visual final
Foram detectadas e corrigidas margens brancas excessivas em A4 retrato decorrentes de dupla preservação de aspecto entre canvas 1120×720 e papel físico. O exportador passou a renderizar o viewBox diretamente no retângulo físico calculado por `ux08FrameGeometry`. O novo CI/Playwright deve verificar o arquivo final após essa correção. Foram incluídos 3 testes do preflight para limites de papel, carimbo e imutabilidade de geometria.

## Evidência PDF independente em 08/10/2026
O artefato `test-results/ux09-actual-mixed-formats.pdf` foi examinado com `pdfinfo`: 2 páginas, A4 retrato 595,276 × 841,89 pt e A3 paisagem 1190,55 × 841,89 pt. Revisão visual do raster confirmou que o conteúdo preenche corretamente cada papel, com carimbo e rodapé dentro da MediaBox, após correção do viewBox. O arquivo `test-results/ux09-actual-end-table-continuation.pdf` foi examinado e contém **3 páginas**: N-0 a N-4 na primeira, N-5 a N-9 na segunda, N-10 a N-13 na terceira, todos com `PLANNED`. O navegador confirmou os downloads reais em PDF, sem captura da interface CAD. A captura de tela da página 2 confirmou legibilidade, identificação e rodapé Página 2/3.
