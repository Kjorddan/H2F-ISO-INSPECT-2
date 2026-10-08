# H2F ISO INSPECT 2.0 — RELATÓRIO TÉCNICO UX-05
## Instrumentação, suportes e equipamentos

**Status:** CONCLUIDA_AUDITADA (escopo da UX-05)
**Branch exclusiva:** `ux-evolution`
**Commit de runtime validado:** `942bcfd0b598332c01273490f718f43bea468de9`
**Progresso geral:** UX-05 **5/10**; após esta fase faltam **5** (UX-06 a UX-10).
**Regra:** PARAR após UX-05; só prosseguir quando o usuário disser "Pode seguir". `main` intocada.

## Resultado executivo

A fase evoluiu exclusivamente as famílias de instrumentação, suportes e equipamentos a partir do sistema real UX-04 auditado, sem recriar arquitetura, editor ou biblioteca:

| Categoria | UX-04 | UX-05 | Novos |
|---|---:|---:|---:|
| Instrumentação | 11 | **34** | +23 |
| Suportes | 8 | **29** | +21 |
| Equipamentos | 11 | **30** | +19 |
| Todas as categorias | **110** | **173** | **+63** |

As demais categorias foram mantidas: TUBULAÇÃO 3, CONEXÕES 29, FLANGES 9, VÁLVULAS 19, INSPEÇÃO 4, END 7, ANOTAÇÕES 4, SÍMBOLOS DE FOLHA 5.

## 1. Instrumentação

- Diferenciação explícita de uso `ISOMETRIC` e `P&ID`. Indicação em DCS, PLC, painel ou sala de controle é funcional P&ID; não forma uma ligação física de processo.
- Instrumentos físicos (p. ex. manômetro, poço termométrico, tomada) podem acompanhar segmento de tubulação por vínculo mecânico/funcional **não condutor**, sem quebrar o run.
- Elementos primários fisicamente inline recebem **duas portas** e utilizam a semântica de transação inline existente.
- Novos glyphs locais SVG diferenciados por classe de representação, tags centralizadas e com ajuste de largura e quebra; círculo de instrumento não recebe texto externo obrigatório.

## 2. Suportes

- Adicionadas famílias reconhecíveis, p. ex. sapata deslizante, trunnion, dummy leg, stanchion, clevis, U-bolt, clamp, saddle, trapeze, sway brace, snubber, mola variável/constante, estrutura, rack e sleeper, preservando os oito modelos anteriores.
- SVG próprio por variante, sem reutilizar triângulo universal.
- Nenhum suporte possui porta de processo; não é tratado como válvula, componente inline ou nó de fluido.
- Associação ao PipeSegment com `runId`, `segmentId`, parâmetro `t` normalizado, TAG e metadados de classificação. Movimentações geométricas do trecho reposicionam suporte associado quando o segmento preserva identidade; exclusão é tratada separadamente.

## 3. Equipamentos

- Catálogo com silhuetas específicas de vaso vertical/horizontal, tanque, coluna, torre, drum, separator, reactor, trocadores verticais/horizontais, air cooler, bombas, compressor, blower, filtros, forno, heater, boiler, skid, package, mixer, cyclone e ejector.
- Cada família incorpora template inicial de nozzles identificado por IDs como N1, N2 etc.; nunca se assume duas portas genéricas universais.
- Usuário consegue adicionar/remover **bocais livres** e editar coordenadas locais X/Y; tentativa de excluir bocal já conectado é rejeitada de forma atômica.
- Portas de equipamentos entram no Engineering Graph como `equipment-nozzle`; o snap considera rotação do símbolo, pontos físicos do bocal e coordenadas locais.
- Aproximação não conecta; o usuário deve executar a ligação explicitamente, seja selecionando destino pelo endpoint, seja por gesto de snap deliberado durante desenho do tubo.

## 4. Arquitetura e invariantes

- **Scene Graph ≠ Engineering Graph.**
- Montagens mecânicas `graph.mounts` não criam `graph.connections`; conexões físicas de bocais permanecem explícitas.
- `graphStats()` da UX-04 preservou contrato público; montagens contabilizadas por `graphMountStats()`.
- Documentos `.h2fiso` continuam incluindo entidades e Engineering Graph; novos metadados e vínculos são serializáveis.
- Componentes removidos no editor são desregistrados do grafo, evitando vínculos órfãos.
- Local-first/offline preservado, React é adaptador de interface e a lógica de associação reside no Editor Core.
- Pesquisa registrada em `docs/UX05/PESQUISA_TECNICA_UX05.md`: ISO, ISA, MSS, ASME, API servem de referências de contexto, nunca declaração de certificação da silhueta H2F.

## 5. Qualidade

A revisão consolidada em `docs/UX05/QA_UX05.md` atesta:
- UX-05 core: **21/21 PASS**
- UX-05 browser Chromium: **7/7 PASS**
- UX-02 shell core: **20/20 PASS**
- UX-03 schema core: **20/20 PASS**
- UX-04 piping core: **24/24 PASS**
- regressão acumulada, build, fluxo Windows Local Server (montagem) e evidências: **PASS**

Esses resultados foram executados no GitHub Actions; não são resultados presumidos. A distribuição Windows empacotada utiliza PowerShell/batch sem Python/Node/Docker instalado pelo usuário; a montagem em CI não substitui prova de execução em todas as versões de Windows.

## 6. Limites honestos

- Validação visual e semântica definitiva por cliente/projeto: `TECHNICAL_REVIEW_REQUIRED`.
- Cálculos de suportação, esforços de bocal, posicionamento real de nozzles e análise de conformidade normativa NÃO fazem parte do escopo.
- Cenas de edição estrutural extrema do host e perfis normativos específicos por cliente permanecem como débito direcionado UX-10.
- Não foram implementadas telas, elementos de inspeção END, símbolos de folha ou funcionalidades da UX-06 neste ciclo.

**DECISÃO:** UX-05 CONCLUÍDA E AUDITADA. Próxima **UX-06**, somente mediante "Pode seguir".
