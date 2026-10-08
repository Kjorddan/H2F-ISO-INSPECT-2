# UX-07 — ALTERAÇÕES E AUDITORIA DE DIFERENÇAS

## Baseline controlado
- `CHECKPOINT_UX06.json` preservado; baseline `a79f2297a8509f592951be664d38add8cda1937f`.
- Branch exclusiva `ux-evolution`; `main` não modificada.
- O catálogo de 227 símbolos built-in das UX-01 a UX-06 não foi alterado.

## Core novo
- `src/editor-core/ux07-custom-shapes.js`: geometria local 72×46, oito primitivas, gestos de construção, edição segura, 96 primitivas/símbolo, 16 referências, versionamento, compatibilidade com JSON v2, detecção de colisões e conflito de versões, importação limitada a 1,5 MB/250 definições e controle de segurança.
- `src/ui/ux07-shape-editor.jsx`: editor vetorial H2F em janela responsiva, canvas gradeado, desenho com arrasto, propriedades e coordenadas, seleção e movimentação, ordem das camadas, exclusão, desfazer/refazer, pontos de referência gráficos, painel de validação e salvamento de nova revisão.
- `src/main.jsx`: substitui painel rudimentar pelo novo editor; cards personalizados editáveis; bibliotecas `USER/PROJECT/TENANT/CORPORATE` classificadas, persistência offline local, importação validada, documento com símbolos personalizados embutidos; formas customizadas não entram automaticamente no fluxo de montagem mecânica ou de inspeção/END de símbolos certificados.
- `src/style.css`: interface em modal delimitado à janela, layout responsivo, barras, inspeção de primitivas, botões e feedback de validação.

## Retrocompatibilidade e revisão
- Símbolos preexistentes continuam sendo importados no formato `h2f-symbol-library` schema v2.
- Símbolos v2 sem primitivas são preservados como **rascunhos editáveis**, sem serem inseridos invisivelmente no isométrico.
- Definições existentes somente recebem nova `version` após salvar; o ID permanece estável.
- Entidades já colocadas preservam o snapshot `symbolDefinition`; revisões posteriores da biblioteca não mudam retroativamente geometrias inseridas.
- Escopo CORPORATE/TENANT/PROJECT/USER é metadado local, sem implicar autorização RBAC em servidor.

## Testes e CI
- `tests/ux07-custom-shapes.test.mjs`: 32 casos de geometria, validação, export/import, migração, versão, limites e segurança.
- `tests/browser/ux07.spec.mjs`: 9 casos de interface Chromium, com screenshots de editor, persistência e formas no CAD.
- `playwright.ux07.config.mjs`, `.github/workflows/ux07.yml`: regressão integral, build, Playwright, Local Server Windows offline, fonte e evidências.
- `package.json`: gate UX-07 incluído no `npm test`.
- `tests/shell-phase10.test.mjs`: teste de regressão de delegação do editor antigo para o novo módulo; cobertura preservada em editor, escopos, import/export, revisão e referências.

## Escopo excluído
Sem editor paramétrico de engenharia, importador SVG arbitrário, conexão hidráulica de formas customizadas, backend de biblioteca corporativa, formatação de folha UX-08, exportação de documentos UX-09 ou homologação E2E final UX-10.

### Correção de acabamento posterior à auditoria inicial
- `src/ui/ux07-shape-editor.jsx`: arredondamento de coordenadas de ponteiro em 0,1 unidade gráfica, evitando ruído de ponto flutuante nas propriedades.
- `tests/browser/ux07.spec.mjs`: validação explícita da precisão no formulário da primitiva após desenhar um retângulo.
