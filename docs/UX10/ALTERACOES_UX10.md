# UX-10 — Diferenças sobre a UX-09

## Arquitetura de integridade documental
`src/editor-core/ux10-final-audit.js`: esquema de controle `h2f-controlled-release/v2`, fingerprint determinístico incluindo dados END, soldas, espessuras, evidências, integridade, underlays, traceState e formas customizadas; criação e validação de snapshots formais. Registros antigos sem fingerprint v2 seguem importáveis, mas **não liberam emissão controlada** até nova revisão aprovada. O controle se baseia no estado do aplicativo, não em autenticação certificada.

`src/main.jsx` e `src/ui/ux09-document-dialog.jsx`: integração com o gate v2 antes do download e com o formulário de emissão. Ambas as opções de `Criar snapshot formal` usam o novo digest. Diagnóstico técnico exibido nas propriedades, sem escrever no grafo como efeito colateral.

## Reparos de regressão industrial
- Retomada do painel de inspeção/END/símbolos de folha UX-06. Identificação de formas realmente autorais baseada em `symbolDefinition.custom`, não em `libraryMeta.h2fCustom`.
- `local-server/server/H2F.LocalServer.ps1`: loopback apenas, socket timeouts, prefixo estrito de diretório para bloquear traversal lateral.

## Integração e cobertura
- `tests/ux10-integrated-final.test.mjs`: hashes de aprovação, mudança posterior em END/TML/evidência/material, orfandade em grafo, catálogo autoral, limite de folha, segurança do server e manifesto industrial de 9 páginas.
- `tests/browser/ux10.spec.mjs`: painel de diagnóstico, snapshot UX10 aprovado, rejeição de alteração pós-aprovação, bloqueio de snapshot legado, exportação PDF e coexistência UX07/UX08/UX09.
- `tests/browser/ux09.spec.mjs`: adaptação do teste legado de aprovação ao novo gate v2.
- `playwright.ux10.config.mjs`: executa Chromium combinado UX-02, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09 e UX-10.
- `.github/workflows/ux10.yml`, `package.json`: regressão completa, build, browser, Local Server Windows offline, código-fonte rastreado e evidências.
- `CHECKPOINT_UX10.json` fecha o roteiro de 10 fases com pendências de testes físicos explícitas.

## Itens não implementados / não reivindicados
Assinatura ICP-Brasil e autenticação de emitente; backend de biblioteca por empresa; certificação ISO e aprovação formal de simbologias do cliente; execução do instalador na estação Windows do cliente; equivalência demonstrada com todos os PDFs de referência por inspeção humana.

## EVIDENCE-006 — bytes de anexos nativos
Detectada perda de persistência de evidências importadas apenas por URLs `blob:`, inválidas após reinício do navegador. `src/main.jsx` agora incorpora arquivos permitidos até **8 MiB** como Data URI no arquivo `.h2fiso`, preservando `sha256` do conteúdo e metadados de arquivo. São aceitos PNG/JPEG/WEBP/GIF/PDF/TXT/CSV; SVG executável e tipos inesperados são recusados. `ux10AuditIntegrated` detecta `EVIDENCE_UNARCHIVED` e o gate bloqueia emissão controlada com anexo temporário. **Anexos legados `blob:` não são recuperáveis automaticamente**: o arquivo original deve ser reinserido manualmente. A foto no JSON ocupa mais espaço que o binário; usuário deve evitar registros enormes.
