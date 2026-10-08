# Pesquisa técnica — UX-06 Inspeção, END, anotações e folha

## Critérios e referências

Esta fase introduz **simbologia H2F própria e orientativa**, sem afirmar que os desenhos reproduzem figuras certificadas de qualquer norma e sem incorporar imagens de terceiros.

| Referência oficial | Edição confirmada | Aplicação na UX-06 | URL |
|---|---|---|---|
| ISO 6412-2 | 2017, edição 2 | representação isométrica e posição das chamadas gráficas | https://www.iso.org/standard/73353.html |
| API RP 574 | 5ª edição (publicada em 2024) | contexto das práticas de inspeção em componentes de tubulação; **não** desenho de glyph certificado | https://www.api.org/products-and-services/standards/important-standards-announcements/rp574 |
| ASME BPVC.V | 2025 | métodos de ensaios não destrutivos no contexto de códigos de fabricação/inspeção pertinentes | https://www.asme.org/codes-standards/find-codes-standards/bpvc-section-v-nondestructive-examination |
| ISO 9712 | 2021, edição 5 | escopo de qualificação/certificação de pessoal END, **não** critério visual de aceitação de indicações | https://www.iso.org/standard/75614.html |

Fontes consultadas em outubro de 2026. O uso contratual deve verificar licenciamento, emendas aplicáveis e código de referência de cada serviço.

## Regras de interpretação

1. Um símbolo de **TML/CML**, solda ou END no CAD significa inicialmente somente **marcação gráfica**; não prova medição, inspeção executada ou laudo aprovado.
2. O registro planejado somente é criado mediante ação explícita e alvo físico existente. A UX-06 não inclui formulário de resultados, laudo técnico, parâmetros de ensaio ou avaliação de aceitação.
3. A classe END preserva as designações do Editor Core anterior: UT, PAUT, TOFD, RT, MT, PT, ET, IRIS, RFA, MFL e OTHER. Técnicas adicionais (PMI/VT/LT/ACFM etc.) usam OTHER quando não possuírem código nativo, com descrição rastreável; não são automaticamente declaradas um método certificado pela ISO 9712.
4. Para o Engineering Graph, marcadores são **montagens não condutoras** ao segmento: não dividem PipeRun nem criam conexão de fluido. Registros de END podem referir um PipeSegment, solda ou TML/CML existentes, conforme validação.
5. Anotações, revision clouds, setas, warnings, match lines, norte e símbolos de seção pertencem ao domínio editorial. Nenhum destes altera automaticamente revisões, carimbos, coordenadas de engenharia ou continuidade física.
6. Símbolos de folha usam `sheetId` explícito e devem renderizar somente quando a folha correspondente estiver ativa.

## Limites de conformidade

Todos os glyphs adicionados permanecem `normativeStatus=REFERENCE_GUIDED` e `provenance.status=TECHNICAL_REVIEW_REQUIRED`. É necessária homologação visual e técnica por cliente/projeto antes de uso em documento de engenharia aprovado. O software não calcula espessura mínima, RBI, integridade, extensão de END, carga de suportes ou critérios normativos de aceitação nesta fase.
