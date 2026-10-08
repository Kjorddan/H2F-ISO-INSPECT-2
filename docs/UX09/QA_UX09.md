# UX-09 — QA e critérios de aceitação

**Status:** aguardar atualização automática com o workflow de liberação; nenhuma execução em Windows físico alegada.

| Gate | Regra |
|---|---|
| Core UX-09 | 35 testes sobre plano, dimensões reais, paginação e SHA-256 |
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
