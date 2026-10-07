# UX-01 — Auditoria completa do H2F ISO INSPECT 2.0

**Status:** CONCLUIDA_AUDITADA_SEM_MODIFICACAO_DE_RUNTIME  
**HEAD auditado:** `52eb1e59a15edf14b66893680d36b09b82436a5e`  
**Versão:** `0.32.0`  
**Baseline técnica validada:** `c39a95645387a96ef8076075ab6f6280a2d63774`

## Conclusão executiva
A arquitetura técnica existente deve ser preservada. O principal débito está na experiência CAD, na fidelidade/semântica da biblioteca e na composição documental profissional.

## Achados principais
1. Menu superior é texto estático sem ações.
2. Toolbar usa botões textuais, sem sistema consistente de ícones/tooltips.
3. Toolbar admite `overflow-x:auto`, incompatível com o novo requisito sem scroll horizontal.
4. Biblioteca fixa 292 px + propriedades 260 px comprimem o canvas em notebooks.
5. Painéis não possuem collapse próprio, auto-hide ou estado persistente.
6. Pipe Run da biblioteca não possui glyph específico e cai no fallback genérico.
7. Coupling/union/cap/plug/olets têm diferenciação gráfica insuficiente.
8. `defaultSymbolPorts` aplica dois ports genericamente a CONEXÕES/FLANGES, incorreto para terminais e cross.
9. Todos os suportes usam essencialmente a mesma geometria base.
10. Vaso/coluna/tanque/reator compartilham forma; bomba/compressor também; vários equipamentos caem no genérico.
11. INSPEÇÃO possui 4 itens; END possui 7 e usa um único glyph base.
12. Built-ins não carregam subcategoria, descrição, usage context, referência técnica, flag normativo/H2F, política inline/free placement ou snap por símbolo.
13. Criador de formas existe, porém é rudimentar e não é editor visual completo.
14. O Core possui A0–A4, mas o shell usa `PAPER={1120,720}`; `sheetSize()` não controla o canvas.
15. `titleBlock` existe como dados/formulário, mas não como carimbo gráfico profissional.
16. PDF vetorial existe, mas é folha ativa em tamanho fixo, sem workflow multi-folha, margens, carimbo, range ou layers configuráveis.
17. Snap é global, sem propriedade por objeto.
18. O E2E atual aceita `overflowX=auto|scroll` na toolbar, comportamento que deve ser invertido na UX-02.
19. Testes da biblioteca validam catálogo/API, não fidelidade visual/técnica nem ports por tipo.
20. `main.jsx` concentra grande parte da UI/orquestração, aumentando risco de regressão no novo ciclo.

## Inventário built-in
- TUBULAÇÃO 3
- CONEXÕES 14
- FLANGES 7
- VÁLVULAS 12
- INSTRUMENTAÇÃO 11
- SUPORTES 8
- EQUIPAMENTOS 11
- INSPEÇÃO 4
- END 7
- ANOTAÇÕES 4
- SÍMBOLOS DE FOLHA 5

Total: **86 símbolos**.

## Próxima fase
UX-02 — Shell, toolbar, ícones SVG locais, tooltips, menus reais e responsividade sem scroll horizontal.

Nenhum arquivo de runtime foi alterado nesta auditoria.
