# ALTERAÇÕES — UX-05

## Escopo exclusivamente UX-05
**Branch:** `ux-evolution`. `main` não alterada.
Baseline UX-04 mantida; não reiniciar Editor Core, não executar UX-06.

### Biblioteca
- `src/editor-core/ux05-catalog.js`: 63 símbolos adicionais (23 instrumentação, 21 suportes, 19 equipamentos).
- `src/editor-core/library.js`: catálogo **110 → 173**; categoria Instrumentação **11 → 34**, Suportes **8 → 29**, Equipamentos **11 → 30**; schema v2 e proveniência preservados.
- Instrumentação P&ID-only segregada de instrumentação física do isométrico; componentes inline físicos receberam 2 process ports.
- Suportes sem ports hidráulicos e família de equipamentos com nozzles variáveis.

### Glyph Engine
- `src/ui/ux05-glyphs.jsx`: novas silhuetas SVG H2F de instrumentos, suportes e equipamentos; 29 padrões de suporte e 30 padrões de equipamento mapeados.
- `src/ui/industrial-symbol-glyphs.jsx`: roteamento por categoria sem reinstalar renderização monolítica no `main.jsx`.
- `src/editor-core/ux05-geometry.js`: TAG/text-fit instrumental determinístico.
- `src/main.jsx`: exibição de TAG dentro do balão e não abaixo nos instrumentos.

### Engenharia e topologia
- `src/editor-core/engineering-graph.js`: mapa de vínculos mecânicos `mounts` independente de `attachments`, `edges`, `connections` e `ports`; invariância de `graphStats()` UX-04 e nova `graphMountStats()`.
- `src/editor-core/ux05-associations.js`: transações atômicas para inserção/vínculo do suporte, instrumento físico e equipamento; conexão física explícita PipeRun→nozzle, candidatos apenas por proximidade para escolha; rejeição de ID/port duplicado e remoção de nozzle já conectado.
- `src/editor-core/snap.js`: ports/nozzles expostos ao snap, com rotação real do equipamento e identificadores estáveis.
- `src/main.jsx`: ferramentas para criar/remover/configurar bocais, anexar símbolos físicos ao segmento, conectar bocal mediante ação deliberada; sincronizar posição de suportes em movimentação de trechos; limpar componentes gráficos excluídos.
- `src/style.css`: configuração compacta de bocais sem alterar a toolbar.

### QA e entrega
- `tests/ux05-instrument-support-equipment.test.mjs`: testes de catálogo/schema, semântica, topologia, mounts, nozzles, TAG, snap e integridade transacional.
- `tests/browser/ux05.spec.mjs`: testes Chromium e screenshots das três famílias, montagem, conexão/nozzle, TAG e configuração.
- `playwright.ux05.config.mjs`: execução separada.
- `.github/workflows/ux05.yml`: npm ci, regressão, build, Chromium, montagem/upload Local Server, evidence.
- `package.json`: inclui testes UX-05 na regressão.

### Compatibilidade
O contrato antigo de `graphStats()`, `inst-pi` e `equip-nozzle` foi preservado para UX-03/UX-04. `main` não alterada.

Não há código ou funcionalidade da UX-06 neste conjunto.
