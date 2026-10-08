# UX-08 — Alterações consolidadas

**Repositório:** `Kjorddan/H2F-ISO-INSPECT-2`; **branch:** `ux-evolution`; **baseline UX-07:** `51449d138491a82264cebb0bb67e7febee0d58b0`.

## Core documental
- `src/editor-core/ux08-sheet-layout.js` adiciona `UX08_SCHEMA=h2f-sheet-layout/v1` sem migrar ou descartar `document-structure.js`, `sheet.titleBlock`, `sheet.format`, `sheet.orientation` e `sheet.customSize`.
- Formatos A0–A4 e CUSTOM; validações estritas de dimensões, orientação, margens, zonas, carimbos e tabelas; estados de erro recusados, sem mutação parcial.
- `ux08FrameGeometry` calcula projeção física de folha/moldura/carimbo para viewport do CAD de 1120×720 com preservação de proporção.
- `ux08TableData` gera tabelas MATERIAL, WELD, END, TML, REVISION, NOTES e MANUAL a partir das fontes do Editor Core; não gera medições ou aceites fictícios.
- Três presets H2F: CORPORATIVO, CAMPO/END e MINIMALISTA; bibliotecas pessoais de templates em JSON local, com schema e validação de IDs/tamanhos.
- `ux08DuplicateSheetPresentation` remapeia IDs de tabelas e marcadores editoriais UX-06 ao duplicar folha, sem copiar entidades industriais de processo. `ux08DeleteSheetPresentation` limpa exclusivamente as marcações editoriais da folha removida.

## UI/CAD
- `src/ui/ux08-sheet-designer.jsx`: `Ux08SheetDesigner` e `Ux08SheetOverlay` para moldura, zonas, carimbo, tabelas configuráveis, posição por âncora, visibilidade, linhas manuais, prévia e templates.
- `src/main.jsx`: botões de Formatar folha nas abas e nas propriedades; controle de modal; sobreposição SVG não interativa; dados persistem em `documentModel.sheets[].pageLayout` e no pacote nativo `.h2fiso`.
- `src/style.css`: modal H2F responsivo com preview em múltiplos formatos, sem criar scroll lateral na janela CAD.
- Os botões e a UX mantêm edições visuais separadas das entidades e do Engineering Graph.

## Testes / CI
- `tests/ux08-sheet-layout.test.mjs`: 40 testes core cobrindo formatos, moldura, layout, tabelas, templates, duplicação, exclusão, compatibilidade e dados de END reais.
- `tests/browser/ux08.spec.mjs`: 11 cenários Chromium de preview, carimbo, layouts por folha, múltiplas tabelas, templates, invalidação segura e cópia de folha.
- `playwright.ux08.config.mjs`, `.github/workflows/ux08.yml`, `package.json`: execução regressiva, build, Chromium, empacotamento offline Windows Local Server, código e evidências.
- Código e testes históricos UX-01 a UX-07 preservados; nenhuma integração UX-09 foi iniciada.

**Escopo excluído:** PDF/impressão e workflow documental final (UX-09), auditoria E2E/Golden Master completa (UX-10).
