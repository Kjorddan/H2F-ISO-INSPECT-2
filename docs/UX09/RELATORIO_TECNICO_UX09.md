# H2F ISO INSPECT 2.0 — RELATÓRIO TÉCNICO UX-09

## Fase 9/10: PDF, impressão e fluxo documental

**Baseline UX-08**: `ca3a56bba572013c6174d10644c2cbffeb92a1d3`. **Branch exclusiva**: `ux-evolution`. **Status**: implementada; auditoria automatizada da entrega na matriz QA.

### Escopo
1. Exportação PDF vetorial com um único arquivo multipágina.
2. Papel em milímetros por folha, incluindo A0–A4 e CUSTOM; suporta orientação diferente entre páginas.
3. Composição independente da interface com moldura, carimbo UX-08, símbolos, tubulação e numeração de páginas.
4. Continuação de tabelas com rastreabilidade de linhas; avisos de dados não incluídos quando a continuação é desativada.
5. Seleção de folha atual ou documento inteiro.
6. Impressão pelo visualizador PDF do navegador, evitando menus e botões.
7. Gate SHA-256 para modo documental controlado e log da tentativa, mantendo ausência de assinatura.
8. ZIP de código, Windows Local Server e evidência CI.

### Limitações expressas
- Não há certificação normativa automática, aplicação de assinatura digital ou comprovação de entrega ao cliente.
- Browser viewers e drivers de impressão reais deverão ser auditados na UX-10.
- Underlays e fontes externas podem ter limitações de fidelidade; warnings de colisão não são correção automática de desenho técnico.
- Dados de END `PLANNED` não são resultados, laudos ou aceite de inspeção.

### Roadmap
A UX-09 encerra o desenvolvimento de impressão e exportação documental do ciclo. **Resta apenas a UX-10**: auditoria final integrada, Golden Masters, correções e validação operacional. A UX-10 não é iniciada automaticamente.

Os resultados do GitHub Actions e a decisão final de fase constam em `docs/UX09/QA_UX09.md` e `CHECKPOINT_UX09.json` quando concluída a liberação.

### Correções pós-auditoria inicial
Foi realizado ajuste de enquadramento do SVG no papel físico, inclusive para A4 em retrato. O rodapé de paginação agora acompanha a área do formato ativo. As páginas de continuação foram redesenhadas com posições relativas ao papel. O preflight alerta para entidades além do limite físico e possível sobreposição do carimbo, sem modificar o isométrico.
