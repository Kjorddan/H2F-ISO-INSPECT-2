# H2F ISO INSPECT 2.0 — UX-07: Criador de Formas Personalizadas

## Arquitetura e premissas
Esta fase evolui o editor de símbolos customizados introduzido antes da UX-01, sem substituição da biblioteca industrial H2F de **227 definições built-in** concluída na UX-06. Todas as alterações permanecem na `ux-evolution`.

**Modelo de coordenadas:** viewBox local `72 × 46`, em unidades **gráficas**. Coordenadas de símbolo não são milímetros, coordenadas de planta, comprimento físico ou cotas.

**Oito primitivas suportadas:**
1. Linha: `x1,y1,x2,y2`.
2. Polilinha: lista ordenada de vértices, mínimo 2.
3. Arco Bézier quadrático: duas extremidades + ponto de controle.
4. Círculo: centro e raio positivo.
5. Elipse: centro e dois semieixos positivos.
6. Retângulo: canto, largura e altura positivas.
7. Polígono: 3 ou mais vértices.
8. Texto: referência textual de até 80 caracteres, renderizada como texto SVG seguro via React.

**Ferramentas:** desenho por ponteiro no canvas, seleção, deslocamento de elementos, coordenadas numéricas, reordenação de camadas, exclusão de elementos, desfazer/refazer em rascunho, pontos de referência gráficos e prévia vetorial. O editor mantém moldura e grade internas, sem impor dimensão física ao isométrico.

## Segurança e topologia
- Geometrias rejeitam valores não finitos, raios negativos, tamanhos inválidos, excesso de primitivas/vértices e texto fora dos limites.
- O desenho é composto exclusivamente por primitivas SVG declarativas. Não são aceitos scripts SVG, `foreignObject`, `onload`, URLs arbitrárias ou HTML injetável por um arquivo importado.
- `connectionPoints` do criador UX-07 significam **referência gráfica**: cada um adota `role=reference`, sem ligação implícita a PipeRun, portas de processo ou Engineering Graph.
- Formas customizadas de categoria INSPEÇÃO/END/SUPORTES/EQUIPAMENTOS continuam **livres**, sem herdar automaticamente as transações físicas normativas das famílias built-in UX-05/UX-06.
- Salvamento de forma requer ID não conflitante, nome válido, pelo menos uma primitiva e pontos referenciais válidos.
- Formas de versões anteriores sem primitivas podem ser importadas como **rascunhos legados editáveis**, porém não inseridas no CAD até concluir desenho e salvar revisão.

## Portabilidade / versionamento
- Biblioteca pessoal local: `localStorage` `h2f.iso.customShapes.ux07.v1`, arquivo de importação/exportação `h2f-symbol-library` schema v2.
- Documento nativo `.h2fiso` mantém o snapshot das formas em `customSymbols`, e cada entidade posicionada conserva uma cópia `symbolDefinition`, evitando perda de geometria quando a biblioteca evolui para versão posterior.
- Revisões aumentam `version` a cada salvamento de uma definição existente, preservando o ID canônico e o desenho já inserido no documento.
- Importações JSON têm limite de tamanho (1,5 MB), número máximo de símbolos (250), limite por símbolo (96 primitivas e 16 pontos de referência), verificação de IDs e detecção de conflito em versões iguais. Atualização por importação só substitui a versão anterior quando a nova for superior.
- Escopos `CORPORATE`, `TENANT`, `PROJECT`, `USER` são **metadados de classificação local** nesta fase. Não estabelecem autenticação, autorização remota, compartilhamento ou RLS entre empresas; esse comportamento depende da arquitetura empresarial futura.

## Base técnica
Reaproveita o schema industrial H2F v2, os mecanismos já existentes de `createCustomSymbol`, `createSymbolEntityFrom`, `SymbolGlyph`, `exportCustomLibrary`, `importCustomLibrary`, persistência do documento `.h2fiso` e o Editor Core UX-02/03. **Nenhuma simbologia criada pelo usuário é automaticamente normatizada, certificada ou considerada aprovada pelo cliente.**

## Limites da UX-07
Estão fora de escopo: editor de símbolos com código arbitrário/JavaScript, desenho paramétrico com restrições mecânicas, cálculos e dimensionamentos, geometria DWG/DXF ou importação direta de SVG de terceiros, conectores físicos homologados para símbolos customizados, biblioteca corporativa em servidor, carimbo/formatos de folha UX-08, exportação documental UX-09, homologação E2E UX-10.
