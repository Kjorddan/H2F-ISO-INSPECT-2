# UX-08 — Plano de QA e matriz de conformidade interna

## Gates automatizados
| Teste / compromisso | Evidência esperada |
|---|---|
| `npm test` | Todos os testes prévios + **40/40 UX-08** |
| `npm run build` | Vite produção bem sucedido |
| `npx playwright test -c playwright.ux08.config.mjs` | **11/11 Chromium**, capturas de tela |
| Testes UX-02 a UX-07 | Regressão integral, sem alteração indevida de bibliotecas e geometria |
| A0–A4, retrato/paisagem, CUSTOM | Proporção física preservada sem redimensionar PipeRun |
| Margens e zonas inválidas | Recusa e feedback sem travar o editor |
| Carimbo e título da folha | Editor persistente e overlay no desenho |
| Tabelas de END/TML | PLANNED / SEM MEDIÇÃO sem fabricação de resultado |
| Formas UX-07 / símbolos UX-06 | Sem redefinição de geometria ou associação física |
| Duplicar/Excluir folha | IDs próprios, marcadores editoriais isolados por folha |
| Local Server Windows | Montagem sob CI Ubuntu; smoke test em Windows real **não executado** |

## Evidências visuais Chromium
`ux08-a3-corporate-preview.png`, `ux08-a4-portrait-scene.png`, `ux08-title-block-technical.png`, `ux08-field-end-template.png`, `ux08-notes-table.png`, `ux08-multiple-sheet-layouts.png`, `ux08-validation-recovery.png`, `ux08-duplicate-sheet-preserves-tables.png`.

## Critérios de não conformidade
- Qualquer mutação de conectividade hidráulica em operação puramente documental.
- Qualquer aceitação, resultado, espessura ou assinatura inventada.
- Duplicação de marcador editorial vinculada à folha antiga sem remapeamento.
- Falha de validação que derrube a aplicação.
- Divulgação de conformidade ISO 5457/7200/7573 sem análise de contrato, norma completa e homologação.

**Observação:** o conteúdo desta matriz não substitui relatórios dos jobs CI e deve ser atualizado com commits e resultados reais.
