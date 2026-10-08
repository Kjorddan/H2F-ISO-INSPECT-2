# UX-08 — Pesquisa técnica e premissas de formatação

## Fontes oficiais verificadas em 08/10/2026

1. [ISO 5457:1999, emenda 1:2010 — Technical product documentation — Sizes and layout of drawing sheets](https://www.iso.org/standard/29017.html). A ISO informa que o documento se encontra publicado e foi confirmado em 2026. A norma trata formatos de folhas, disposições gerais, bordas, moldura, marcas de centragem e referências de zonas. A UX-08 adota a família ISO-A no modelo de dados e oferece margens editáveis; **não afirma que valores padrão escolhidos pela H2F reproduzem integralmente todas as prescrições da norma**.
2. [ISO 7200:2004 — Data fields in title blocks and document headers](https://www.iso.org/standard/35446.html). Confirmada em 2025. Orienta a organização de campos documentais e carimbos técnicos. A UX-08 usa nomenclaturas corporativas H2F por projeto, com espaços para cliente, documento, revisão, elaborador, verificador, aprovador e datas. Sem alegação de certificação.
3. [ISO 7573:2008 — Technical product documentation — Parts lists](https://www.iso.org/standard/43883.html). Confirmada em 2023. Direciona listas de peças para fabricação, suprimento e manutenção; na UX-08 as tabelas de materiais são **resumos preliminares do desenho**, não listas de aquisição, listas completas de corte nem medições de campo.
4. Referências de métodos END/gestão de inspeção foram preservadas das fases UX-05/06. Nenhum pictograma ou registro PLANNED corresponde, por si, a ensaio executado, resultado aprovado ou liberação operacional.

## Regras H2F (escolhas do software, não prescrições normativas)

- Orientação `portrait/landscape`, ISO A0–A4 e `CUSTOM` (dimensões em milímetros) são dados da folha.
- Margens-base H2F: esquerda 20 mm; outras 10 mm; usuário pode editar entre 0 e 40 mm, observando validade geométrica.
- Grade de zona editável entre 2 e 12 subdivisões. Esta é uma convenção H2F, sujeita a verificação para cada cliente.
- Carimbo-base `175 × 62 mm`, ancorado ao canto inferior direito da **área útil**. Dimensão configurável; pode exigir ajuste para formatar A4/custom.
- A sobreposição visual SVG ajusta o tamanho de apresentação a `1120 × 720` unidades de CAD via transformação proporcional, sem redimensionar ou alterar pontos de tubulação, segmentos, nozzles, suportes, END ou dados físicos.
- Tabelas de materiais usam contagem de entidades desenhadas; `QTD` não é quantitativo executivo de tubulações em metros. Soldas e END preservam `PLANNED`; TML/CML sem medição aparece `SEM MEDIÇÃO`; valores medidos provêm apenas de registros realmente existentes.
- Os templates CORPORATIVO, CAMPO/END e MINIMALISTA são perfis autorais H2F; customizações permanecem no navegador local; não estabelecem aprovação formal nem direitos de distribuição multiempresa.
- Impressão, escalonamento final e PDF são exclusivos da UX-09. A prévia da UX-08 **não é um PDF homologado**.

## Limitações abertas
Homologação visual com projetos/clientes reais, impressão Windows em campo, fluxo de revisão impresso, sobreposição de tabelas em folhas densas e exportação PDF multipágina são tratados na UX-09/10, sem declaração prematura de atendimento formal.
