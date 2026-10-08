# UX-07 — QA E GATES

**Resultado de referência:** `4c5f7a9c532bd268d94d11cd0e4539117694c906` (última alteração de testes antes da documentação).
**Workflow de referência:** https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37722020368

| Gate | Evidência / resultado |
|---|---|
| Full `npm test` | PASS |
| Núcleo específico UX-07 | **32/32 PASS** |
| Playwright Chromium UX-07 | **9/9 PASS** |
| `npm run build` | PASS |
| Shell UX-02 / teste de regressão antigo de biblioteca fase 10 | PASS |
| Bibliotecas UX-03, PipeRun UX-04, instrumentação/suportes/equipamentos UX-05, inspeção/END/folha UX-06 | Preservadas, execução CI regressiva |
| Montagem de distribuição Local Server Windows via GitHub Actions | PASS na montagem CI; **smoke test físico Windows NÃO executado** |
| Símbolos gráficos personalizados | Sem equivalência normativa automática nem ligação de processo |
| Importação malformada | Rejeitada com feedback, sem executar script |
| Revisão de símbolo | Novo versionamento da biblioteca, snapshots antigos no documento preservados |
| Compatibilidade biblioteca v2 sem primitivas | Abre como rascunho editável, não como objeto invisível |

### Evidências de browser
- `ux07-shape-designer-empty.png` — bloqueio de salvamento sem geometria
- `ux07-shape-designer-drawn.png` — círculo + retângulo e propriedades
- `ux07-custom-library-card.png` — biblioteca personalizada
- `ux07-revision-v2.png` — alteração de definição com versão 2
- `ux07-graphic-reference.png` — referência gráfica não condutora
- `ux07-custom-shape-in-scene.png` — forma criada inserida no editor, PipeRun preservado

### Testes que não são reivindicados como executados
- Homologação de todas as dimensões, fontes e locais de distribuição em cada estação Windows real.
- Autorização corporativa de publicação por tenant/usuário em servidor.
- Qualificação de símbolos específicos junto a contratantes, normas ou certificados de END.
- Testes de integração entre formas autorais e conexões físicas do Engineering Graph, deliberadamente fora de escopo.

**Gate de UX-07**: aprovado tecnicamente no CI para o escopo contratado; nenhuma abertura automática de UX-08.
