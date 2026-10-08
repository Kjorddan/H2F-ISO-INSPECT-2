# UX-09 — Registro de mudanças

**Repositório:** `Kjorddan/H2F-ISO-INSPECT-2`, **branch:** `ux-evolution`, **baseline** `CHECKPOINT_UX08.json` e commit `ca3a56bba572013c6174d10644c2cbffeb92a1d3`.

### Core novo
- `src/editor-core/ux09-print-plan.js`: plano determinístico de páginas por documento/folha; formatos físicos mm; filtros de marcadores editoriais por `sheetId`; agrupamento e continuação de tabelas; validação, alertas de colisão, máximo de páginas, nomenclatura de arquivos; gate documental SHA-256; log explícito de tentativas de emissão.
- Mantido o schema `document-structure.js` e `io-reporting.js`; nenhum dado antigo é descartado.

### UI e saída PDF
- `src/ui/ux09-export-canvas.jsx`: SVG independente da seleção e do viewport; entidades reutilizam renderer do Editor Core; sobreposição de folha UX-08; páginas de continuação; numeração automática; identificação **PRÉVIA NÃO CONTROLADA** / **EMISSÃO CONTROLADA — NÃO ASSINADA**.
- `src/ui/ux09-document-dialog.jsx`: seleção de todas as folhas/folha atual, inclusão ou não de continuação, prévia/controle formal, estado do SHA-256, plano de páginas, warnings, download e abertura no visualizador para impressão, histórico local de tentativas.
- `src/main.jsx`: substitui o exportador antigo de SVG da folha visível por renderização vetorial multipágina usando `react-dom/server` no navegador, `jsPDF` e `svg2pdf.js`; exporta PDF em mm, mantém tamanhos distintos por folha, registra tentativa controlada sem fingir assinatura.
- `src/style.css`: modal responsivo, controles limitados à viewport CAD; nada disso é desenhado na saída PDF.
- `emissionLog` incluído no arquivo nativo `.h2fiso`; log não integra o hash de um snapshot imutável já emitido.

### Testes e empacotamento
- `tests/ux09-print-workflow.test.mjs`: **35 testes** de plano, limites, paginação, dimensões, escopo, transações, controle SHA e registro honesto.
- `tests/browser/ux09.spec.mjs`: **8 cenários** Chromium sobre diálogos, emissão, PDFs reais, arquivo único multipágina, continuidade, gate aprovado e impressão.
- `playwright.ux09.config.mjs` e `.github/workflows/ux09.yml`: full regression, build Vite, Playwright Chromium, ZIP Windows Local Server, código-fonte rastreado e evidência.
- `package.json`: adiciona UX-09 ao `npm test`; preservados os gates UX-01 a UX-08.

### Exclusões
Não há implementação de assinatura ICP-Brasil, QR de autenticação documental remoto, comprovação de impressão física, integração com GED/PLM, aceite normativo, inspeção END concluída ou homologação integral UX-10.

## Evidências de inspeção PDF
- A auditoria PDF verificou arquivos reais A4 e A3 com `pdfinfo` e `pdftotext`, confirmando duas páginas, dimensões de MediaBox e rodapés documentais.
- `src/ui/ux09-export-canvas.jsx`: refinamento final de SVG viewBox com enquadramento no papel físico, de acordo com a orientação; rodapés adaptados à área útil de cada folha e continuação em diferentes formatos.
- `src/editor-core/ux09-print-plan.js`: preflight não destrutivo alerta se entidades extrapolam o papel ou invadem carimbo; não altera Engineering Graph.
- Testes Chromium preservam amostras PDF reais `ux09-actual-one-page.pdf` e `ux09-actual-mixed-formats.pdf` para inspeção independente.
