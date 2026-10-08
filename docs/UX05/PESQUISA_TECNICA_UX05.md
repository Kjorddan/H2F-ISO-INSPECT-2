# PESQUISA TÉCNICA — UX-05
## Instrumentação, suportes e equipamentos em documentação de tubulações

**Produto:** H2F ISO INSPECT 2.0
**Fase:** UX-05 (instrumentação, suportes e equipamentos)
**Data de verificação das fontes públicas:** 07/10/2026
**Método:** conferência de título, edição e escopo em páginas oficiais ou de distribuição autorizada; sem incorporação de tabelas, esquemas ou imagens protegidos.

## Matriz de referências públicas

| Documento | Edição/publicação verificada | Aplicabilidade contextual | Fonte pública |
|---|---|---|---|
| ISO 6412-2 | **2017**, edição 2, confirmada em 2023 | Representação isométrica simplificada de tubulações | https://www.iso.org/standard/73353.html |
| ISO 14617-1 | **2025** | Símbolos gráficos de diagramas; não equivale a uma biblioteca certificada de isométricos | https://www.iso.org/standard/85641.html |
| ISO 14617-2 | **2025** | Convenções para símbolos de diagramas | https://committee.iso.org/standard/83364.html?browse=ics |
| ISO 10628-1 | **2014** | Regras de diagramas de processos da indústria química/petroquímica, distinta da projeção de isométricos | https://www.iso.org/standard/51840.html |
| ANSI/ISA-5.1 | **2024** | Identificação funcional de instrumentos e controle em diagramas, especialmente P&ID | https://www.isa.org/standards-and-publications/isa-standards/isa-standards-committees/isa5-1 |
| ANSI/MSS SP-58 | **2025** | Terminologia, famílias e contexto de projeto/seleção de suportes e pendurais; não fornece autorização para afirmar que um glyph H2F segue uma figura normativa | https://webstore.ansi.org/standards/mss/ansimsssp582025 |
| ASME B31.3 | **2024** | Contexto de sistemas de tubulações de processo e requisitos de engenharia; não estabelece individualmente todos os pictogramas CAD aqui empregados | https://www.asme.org/codes-standards/find-codes-standards/b31-3-process-piping |
| API 570 / API RP 574 | API 570 5ª edição / RP 574 5ª edição (verificar erratas e adendos na ocasião do uso) | Contexto da interface inspeção de tubulações, sem transplantar requisitos normativos para um glyph | https://www.api.org/products-and-services/standards/important-standards-announcements/570-574-tradepress |

**Natureza das fontes:** as referências definem contexto técnico, escopo e nomenclatura. A UX-05 não adquiriu licenças, reproduziu tabelas originais, copiou assets do diagrams.net ou implementou um módulo de verificação normativa de projeto.

## Separação obrigatória de domínios e conexão

1. **Isométrico:** geometria simplificada de trajetória física, componente ou equipamento, com endpoints/nozzles explícitos e metadados de engenharia separados da representação.
2. **P&ID:** identificação funcional de instrumentos, indicação em painel/sala de controle, DCS e PLC. Esses símbolos NÃO criam continuidade física de PipeRun e devem ser localizados nos contextos permitidos de uso.
3. **Instrumentos físicos:** tomadas de pressão, poço termométrico, gauges etc. são associados mecanicamente ao trecho pelo vínculo não condutor **mount**. Exceção: elementos primários realmente inline (placa de orifício e dispositivos correlatos) possuem dois ports e seguem transação topológica inline.
4. **Suportes:** descanso, guia, batente, âncora, sapata, mola, tirante, trunnion etc. são componentes **mecânicos**, não equipamentos em linha. Vínculo guarda PipeRun/PipeSegment e parâmetro longitudinal normalizado; zero ports de processo.
5. **Equipamentos:** corpos visualmente diferenciados (vasos, tanques, trocadores, bombas, compressores, ciclones etc.). Bocais têm IDs próprios, posição local configurável, rotação espacial e snap geométrico; conexão a tubulação exige gesto explícito no CAD ou comando dedicado.
6. **Sem conexão automática:** cruzamento, sobreposição visual e mera proximidade não são ligações hidráulicas. Um nozzle próximo de um endpoint somente se conecta quando o usuário executa o comando de conexão.
7. **Dois grafos:** Scene Graph é apresentação; Engineering Graph armazena ports e conexões físicas. A representação de mount é distinta de um port de processo.

## Decisões de grafismo H2F

- SVGs locais próprios, monocromáticos, não artísticos, com diferença perceptível entre famílias. A geometria é orientativa e independe de escala real.
- Metadados incluem `schemaVersion=2`, subcategoria, `usageContexts`, `technicalReferences`, `normativeStatus`, `h2fCustom`, `provenance`, `placement`, `snapPolicy`, `portDefinitions`.
- Em todos os novos símbolos, `normativeStatus=REFERENCE_GUIDED`, `provenance.status=TECHNICAL_REVIEW_REQUIRED`.
- O layout de TAG reduz/dobra texto e limita largura disponível no balão; não atribui significado de uma medição de fato.
- Os templates iniciais de bocais são **pontos configuráveis**, não declarações de configuração universal por tipo de equipamento. Número, localização e orientação reais dependem de projeto/documentação do fabricante.
- A nomenclatura de suporte, disposição de nozzles e glyphs H2F devem ser homologados pelas equipes técnicas e, quando aplicável, pela convenção do cliente antes do uso como documento de engenharia aprovado.

## Limites explícitos

Nenhum desenho desta fase é declarado certificado ou literalmente conforme às tabelas de ISO, ISA ou MSS. A UX-05 implementa **convenções H2F guiadas por referências técnicas**, com revisão obrigatória por projeto; não executa cálculo de suporte, carga, perda de carga, esforços em bocal, seleção de instrumentos, P&ID funcional ou verificação de conformidade normativa de fabricação.

Edições e disponibilidade das normas são suscetíveis a atualização; conferir em fontes autorizadas antes de especificação contratual.
