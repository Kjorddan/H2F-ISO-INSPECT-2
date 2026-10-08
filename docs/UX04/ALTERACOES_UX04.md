# ALTERAÇÕES — UX-04

Principais arquivos:
- `src/editor-core/piping.js`
- `src/editor-core/library.js`
- `src/editor-core/inline-components.js`
- `src/editor-core/engineering-graph.js`
- `src/editor-core/topology.js`
- `src/ui/industrial-symbol-glyphs.jsx`
- `src/main.jsx`
- `src/style.css`
- `tests/library.test.mjs`
- `tests/engineering-graph.test.mjs`
- `tests/ux03-library-schema.test.mjs`
- `tests/ux04-piping-library.test.mjs`
- `tests/browser/ux04.spec.mjs`
- `playwright.ux04.config.mjs`
- `.github/workflows/ux04.yml`

Melhorias estruturais:
- catálogo 86 → 110;
- pipe visual style independente;
- novo glyph engine de piping;
- topologia 3 e 4 vias;
- componentes terminais;
- attachments para branch outlets;
- inserção direta sobre entidades existentes;
- sincronização de attachments durante atualização semântica do PipeRun.
