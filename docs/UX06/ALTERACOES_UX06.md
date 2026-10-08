# ALTERAÇÕES — UX-06

## Baseline imutável
- Repositório: `Kjorddan/H2F-ISO-INSPECT-2`
- Branch: `ux-evolution` — **nenhum push para `main`**
- Checkpoint anterior: `CHECKPOINT_UX05.json`; UX-01 a UX-05 preservadas, sem reinstalação ou reinício do Editor Core.

## Biblioteca industrial
- Catálogo: **173 → 227** (+54). INSPEÇÃO 4→19 (+15), END 7→23 (+16), ANOTAÇÕES 4→16 (+12), SÍMBOLOS DE FOLHA 5→16 (+11); categorias de piping, instrumentação, suportes e equipamentos preservadas.
- `src/editor-core/ux06-catalog.js`: definições próprias H2F, classificação funcional e metadados.
- `src/editor-core/library.js`: novos símbolos no schema v2, portDefinitions vazias, ausência de conectividade hidráulica, `REFERENCE_GUIDED`.

## Renderização
- `src/ui/ux06-glyphs.jsx`: glyphs SVG diferenciados por família, sem CDN, sem reprodução de bibliotecas externas.
- `src/ui/ux06-glyphs.jsx`: mapeamento final das variantes WELD_BUTT/FILLET/FIELD/SHOP para os paths CAD específicos, validado por teste visual.
- `src/ui/industrial-symbol-glyphs.jsx`: registro modular e roteamento de glyph por categoria.
- `src/main.jsx`: atributos, rótulos editáveis e propriedades contextuais dos marcadores.
- `src/style.css`: painel de propriedades e legibilidade do marcador.

## Engenharia e registros
- `src/editor-core/ux06-markers.js`: transação de inserção free/attached; vínculo de inspeção/END ao PipeSegment via montagem não condutora no Engineering Graph; rollback em alvo inválido.
- Registro explícito de TML/CML, solda ou END inicia em `PLANNED`; **não** cria resultado, medição, laudo, indicação ou aceitação.
- Técnicas com mapeamento END preexistente mantêm o código; variantes que não constam no vocabulário do core usam `OTHER` com identificação da técnica em observação.
- Associação END opcional à solda ou TML/CML existente; IDs de vínculo estáveis e validação de registros órfãos.
- Símbolos de folha mantêm `sheetId` na entidade e são filtrados pelo `activeSheetId`; símbolos editoriais não criam conexões de processo.

## QA e regressão
- `tests/ux06-inspection-ndt-annotations-sheet.test.mjs`: 22 testes automáticos.
- `tests/browser/ux06.spec.mjs`: 9 testes Chromium, screenshots de diferenciação, anexação, registro e escopo de folha.
- `playwright.ux06.config.mjs` e `.github/workflows/ux06.yml`: build, npm test, browser acceptance e empacotamento Windows Local Server + fonte + evidências.
- `tests/ux05-instrument-support-equipment.test.mjs`: **única adaptação de regressão** do passado: total mínimo `>=173` em vez de total congelado `=173`; os 21 testes UX-05 e contagens exatas das suas três categorias permanecem inalterados.
- `package.json`: adiciona o novo gate UX-06 ao comando `npm test`.

Não há funcionalidades UX-07 (editor de formas personalizadas), UX-08 (formatação de folha), UX-09 (PDF/impressão) nem UX-10 (homologação final) criadas nesta fase.
