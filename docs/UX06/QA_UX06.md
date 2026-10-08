# QA — UX-06

**Status técnico:** CONCLUIDA_AUDITADA quanto ao escopo e comportamento automatizado; Windows real requer smoke test de campo.
**Branch exclusiva:** `ux-evolution`
**Commit de runtime testado:** `aa84eb5d0642efa9fd3e3732fdea17d4628ef1e9`

| Gate | Resultado |
|---|---|
| `npm ci` | PASS |
| `npm test` — toda regressão acumulada | PASS |
| UX-06 core (biblioteca, mounts, registro e rollback) | **22/22 PASS** |
| UX-06 Playwright/Chrome | **9/9 PASS** |
| UX-02 Shell core | 20/20 PASS |
| UX-03 Library Schema Core | PASS |
| UX-04 Piping Core | 24/24 PASS |
| UX-05 Instrument/Support/Equipment Core | 21/21 PASS |
| `npm run build` | PASS |
| UX-02 Browser regression | PASS |
| UX-03 Library Schema workflow | PASS |
| UX-04 Piping workflow | PASS |
| UX-05 Instruments workflow | PASS |
| Empacotamento Windows Local Server no Ubuntu CI | PASS |
| ZIP de código-fonte + evidências | PASS |
| Smoke test executável em estação Windows real | **PENDENTE, NÃO ALEGAR PASS** |
| Aprovação normativa específica por cliente/projeto | **PENDENTE** |

### Workflows GitHub consultados
- UX-06 runtime final (22 core + 9 browser): https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37719385720
- UX-02 browser no mesmo commit: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37719385844
- UX-03 regressão: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37718901798
- UX-04 regressão: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37718901847
- UX-05 regressão: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37718901721

### Evidências Chromium
- `ux06-inspection-library.png`: TML/CML e solda/anomalia
- `ux06-differentiated-weld-glyphs.png`: topo, filete, campo e fabricação com formas próprias, sem substituição por TML
- `ux06-ndt-library.png`: PAUT, TOFD, IRIS
- `ux06-sheet-and-annotations.png`: formas editoriais
- `ux06-tml-before-registration.png` e `ux06-tml-registered.png`
- `ux06-paut-planned.png`: inserção e registro explícito planejado
- `ux06-match-line-sheet.png` e `ux06-sheet-scope.png`

### Integridade
- Conexões gráficas não se convertem em conexões de fluido.
- NDT/TML/CML/registradores operam exclusivamente com ações explícitas.
- `PLANNED` não significa executado, aprovado, medido ou certificado.
- A relação de escopo `sheetId` do símbolo de folha persiste no documento `.h2fiso`.
- Os testes existentes UX-01 a UX-04 **não foram reescritos**. A UX-05 teve apenas atualização de assertiva para aceitar catálogo maior mantendo o mínimo de 173.

**Gate da UX-06:** aprovado nos testes automatizados indicados. Homologação visual normativa e execução Windows em campo não foram realizadas.
