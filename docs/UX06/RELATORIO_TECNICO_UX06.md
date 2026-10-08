# H2F ISO INSPECT 2.0 — RELATÓRIO TÉCNICO UX-06

## Escopo: Inspeção, END, Anotações e Símbolos de Folha
**Status:** CONCLUIDA_AUDITADA.
**Base:** checkpoint UX-05 `7595ddef5b3f537675902b08bda89d273d8d28e1`.
**Branch:** `ux-evolution`; `main` não alterada.
**Progresso:** **6/10 fases**, após esta restam quatro (UX-07, UX-08, UX-09, UX-10).
**Regra:** aguardar comando explícito “Pode seguir” para qualquer execução da UX-07.

## Resultados e quantitativos

| Família | UX-05 | UX-06 | Adições |
|---|---:|---:|---:|
| INSPEÇÃO | 4 | 19 | 15 |
| END | 7 | 23 | 16 |
| ANOTAÇÕES | 4 | 16 | 12 |
| SÍMBOLOS DE FOLHA | 5 | 16 | 11 |
| **Catálogo built-in total** | **173** | **227** | **54** |

As demais categorias permaneceram nas quantidades da UX-05: TUBULAÇÃO 3, CONEXÕES 29, FLANGES 9, VÁLVULAS 19, INSTRUMENTAÇÃO 34, SUPORTES 29, EQUIPAMENTOS 30. O schema continua v2.

## Instrumentação de inspeção e END

**INSPEÇÃO:** TML, CML, soldas (campo/oficina, topo/filete), redução de espessura, corrosão, pites, trinca, vazamento, reparo, substituição, revestimento, CUI e hotspot. A marcação de corrosão não equivale a diagnóstico validado.

**END:** UT, PAUT, TOFD, RT, MT, PT, ET, IRIS, RFA, MFL e variantes (PEC, bobbin, RFT, ACFM, PMI, VT, LT, termografia, dureza etc.). As técnicas não suportadas nativamente no vocabulário NDT existente são identificadas com `OTHER` e técnica textual: não se produz uma falsa certificação ou correspondência normativa.

**Metadados:** cada nova definição contém categoria, subcategoria, contextos `ISOMETRIC/INSPECTION/NDT`, provenance, referências e regra de inserção. Todos os novos glyphs são locais, vetoriais e diferenciados por família. A auditoria visual final corrigiu as variantes de solda de topo, filete, campo e fabricação, que antes herdavam indevidamente a forma TML, e adicionou teste de geometria para cada uma.

## Topologia e registros

1. Ao posicionar no PipeRun, marcador de INSPEÇÃO/END cria montagem **não condutora** com `runId`, `segmentId` e parâmetro longitudinal `t`; não interrompe tubulação e não gera port hidráulico.
2. Marcador livre não possui alvo físico implícito. É proibido registrar ensaio sem alvo físico verificável.
3. **Registro planejado somente por comando explícito.** TML/CML, solda e END entram no Inspection Store com estado `PLANNED`; valores de espessura, resultados, aceitação e execução não são preenchidos automaticamente.
4. Uma ligação de END pode apontar para PipeSegment, solda ou TML/CML existentes; vínculos órfãos, duplicidades e reexecuções são recusados ou diagnosticados.
5. Registros de anomalia/fotografia seguem o workflow de evidências já existente; um pictograma de dano isolado não fabrica constatação técnica.

## Anotações e folha

- Nuvem de revisão, balão, warning, pendência, hold, referência cruzada, área delimitada, etiquetas editoriais e textos.
- Match line, norte, continuidade de entrada/saída, seção, detalhe, datum, declividade, referência de folha, legenda.
- Símbolos de folha têm `sheetId` canônico persistente e ficam visíveis somente na folha corrente; no editor não alteram automaticamente título, revisão, continuidade ou dados de engenharia.
- Formatação avançada, carimbos e layout de página permanecem no escopo UX-08.

## Qualidade / distribuição

No commit de runtime `aa84eb5d0642efa9fd3e3732fdea17d4628ef1e9`: regressão completa PASS, UX-06 core **22/22**, Chromium **9/9**, npm build PASS, workflows UX-02/03/04/05 PASS. O workflow UX-06 monta um Local Server Windows e produz ZIP de fonte rastreada e ZIP de evidências.

Não se declara smoke test em máquina Windows real. Pesquisa de fontes oficiais e limitações constam em `docs/UX06/PESQUISA_TECNICA_UX06.md`, alterações em `ALTERACOES_UX06.md`, QA em `QA_UX06.md`.

**Decisão:** UX-06 concluída e auditada. Não avançar automaticamente para UX-07.
