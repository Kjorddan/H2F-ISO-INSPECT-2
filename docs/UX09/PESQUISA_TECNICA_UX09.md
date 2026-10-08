# UX-09 — Pesquisa técnica, decisões de exportação e limitações

## Fontes técnicas verificadas em 08/10/2026

- **jsPDF 4.2.1**: documentação da API `jsPDF({unit:'mm',format:[w,h],orientation:...})`, `addPage` e `save`. Referência pública: https://github.com/parallax/jsPDF/blob/master/docs/jsPDF.html . Permite definir a MediaBox em milímetros em vez de tratar 1120×720 unidades CAD como pontos PDF.
- **svg2pdf.js 2.8.1**: integração client-side com `pdf.svg(SVGElement,{x,y,width,height})`. O desenho SVG de cada folha é composto a partir dos elementos React declarativos e convertido em PDF no navegador. A biblioteca possui limitações em SVG complexos, recursos externos e fontes não incorporadas. Referências: https://github.com/yWorks/svg2pdf.js ; https://github.com/parallax/jsPDF .
- **MDN, `window.print()` e impressão via iframe/nova janela**: https://developer.mozilla.org/en-US/docs/Web/API/Window/print e https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing . O navegador e o visualizador PDF controlam diálogo e impressora; o sistema apenas abre o arquivo para impressão. Não há confirmação automática de papel impresso.
- O contrato documental existente da H2F (`document-structure.js`, `io-reporting.js`, `ux08-sheet-layout.js`) conserva formatos A0–A4 e CUSTOM, título da folha, revisão, anotações, END, TML e soldas.

## Requisitos e decisões UX-09

1. **Uma fonte visual única** para PDF e impressão: `Ux09ExportCanvas` cria SVG de cada folha com entidades, estilos próprios, `Ux08SheetOverlay`, campos de carimbo, tabelas, status documental e rodapé `Página N / total`.
2. **Páginas individuais**: folha com dimensões físicas `sheetSize(sheet)`, em mm; formato distinto por página, sem forçar toda a impressão a A4 ou 1120×720 pt.
3. **Páginas de continuação**: `ux09BuildPlan` contabiliza as linhas que excedem `table.maxRows`, preservando origem, tipo, cabeçalhos, conteúdo, ordem e contagem. Valor de espessura sem medição continua `SEM MEDIÇÃO`, e END sem execução mantém `PLANNED`.
4. **Redação segura**: SVG é produzido pelo React, com texto escapado e sem executar SVG de terceiros. A composição não captura controles de interface, handles, botões, menus ou canvas selecionado.
5. **Emissão controlada**: não basta selecionar `APROVADO`. É necessário snapshot formal imutável com SHA-256, mesmo estado e digest de `revisionPayload(document,entities)` atual. Mudanças após snapshot bloqueiam o modo controlado. Ainda assim **não existe certificado digital, assinatura ICP-Brasil, validação de identidade ou envio ao cliente**.
6. **Registro de tentativa**: log local no documento nativo `.h2fiso`, marcado `DOWNLOAD_SOLICITADO_NAO_ASSINADO`. O navegador não confirma que o arquivo foi recebido, impresso ou assinado.
7. **Imprimir**: abre o mesmo PDF numa nova aba/visualizador, permitindo imprimir com comando do navegador. Se popup bloqueado, há fallback para download. Não imprime a própria tela do CAD com os botões.
8. **Limites**: 200 páginas por operação; avisos para colisão provável carimbo/tabela; não inventar resultados ou validar automaticamente conteúdo de engenharia.

## Limitações e correções previstas para UX-10

- Renderização de referências/underlays PDF externos, CSS/SVG complexo e fontes especiais pode variar; o exportador não afirma reproduzir raster/arquivo externo com fidelidade certificada.
- Layouts densos ainda podem apresentar sobreposição de tabelas ou entidades no desenho; warnings são exibidos e exigem revisão humana. O planejamento garante continuidades por limite de linhas, não resolve automaticamente cada colisão em SVG.
- O visualizador PDF do Windows, Chrome, Edge e drivers de impressão precisa de teste de campo com tamanhos grandes, orientação e escala.
- A emissão controlada assegura consistência **interna** do snapshot SHA-256, não conformidade normativa nem aprovação de pessoa credenciada.

**A UX-10 é a fase obrigatória de auditoria final; não é antecipada nem considerada concluída nesta etapa.**
