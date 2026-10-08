# H2F ISO INSPECT 2.0 — FASE UX-04
## Tubulações, conexões, flanges e válvulas

Status: `CONCLUIDA_AUDITADA`

Branch: `ux-evolution`  
Commit técnico final validado: `c896f4ab8772eb92366c4736e3975267df7ae04b`  
Workflow UX-04 final: `37711453184` — SUCCESS  
Workflow UX-02 de regressão: `37711453400` — SUCCESS

## Resultado executivo

A UX-04 substituiu a representação excessivamente genérica dos principais elementos de piping por uma infraestrutura visual e topológica mais coerente com isométricos industriais, sem acoplar geometria gráfica às propriedades físicas.

O catálogo built-in passou de 86 para **110 símbolos**, com:
- TUBULAÇÃO: 3
- CONEXÕES: 29
- FLANGES: 9
- VÁLVULAS: 19
- demais categorias preservadas para as fases UX-05 e UX-06.

## Tubulação

Foram implementados oito estilos visuais independentes dos dados de engenharia:
PROCESS, EXISTING, FUTURE, REMOVED, BURIED, JACKETED, INSULATED e BATTERY_LIMIT.

Alterar o estilo visual não altera:
- Line Number;
- diâmetro nominal;
- schedule;
- spec;
- serviço;
- material;
- comprimento físico.

Os estilos são carregados no PipeRun e preservados em operações de split e criação de branch.

## Conexões

A biblioteca foi ampliada e passou a diferenciar graficamente:
- cotovelo 90° LR;
- cotovelo 90° SR;
- cotovelo 45°;
- bend;
- miter;
- tee igual;
- tee redutor;
- lateral;
- cross;
- coupling;
- half coupling;
- union;
- nipple;
- cap;
- plug;
- reducer genérico;
- reducer concêntrico;
- reducer excêntrico;
- swage;
- weldolet;
- sockolet;
- threadolet;
- nipolet;
- derivação soldada;
- derivação reforçada;
- olet genérico;
- spectacle blind;
- spacer.

## Topologia

Foram criados comportamentos distintos de inserção:
- INLINE: componente de dois ports que divide o run de maneira transacional;
- JUNCTION 3 vias: tee, tee redutor e lateral;
- CROSS 4 vias: cria duas branches explicitamente;
- TERMINAL: cap, plug e blind flange conectam-se ao endpoint sem dividir o run;
- ATTACHED BRANCH: olets/derivações são anexados semanticamente ao segmento hospedeiro sem destruir a continuidade do PipeRun.

O Engineering Graph ganhou `attachments` explícitos para representar componente anexado a um PipeSegment. O vínculo é validado, participa da conectividade e acompanha atualizações semânticas do run.

Cruzamentos gráficos continuam NÃO criando conexão automaticamente.

## Flanges

Foram diferenciados:
- Welding Neck;
- Long Welding Neck;
- Slip-On;
- Socket Weld;
- Lap Joint;
- Blind;
- Threaded;
- Orifice;
- par flangeado.

Blind flange passou a possuir comportamento terminal de um port. Os demais aplicáveis permanecem inline com dois ports.

## Válvulas

Foram criadas representações diferenciadas para:
- gate;
- globe;
- ball;
- butterfly;
- check genérica;
- swing check;
- lift check;
- dual plate check;
- needle;
- plug;
- diaphragm;
- control;
- PSV;
- PRV;
- MOV;
- AOV;
- atuador hidráulico;
- operação manual;
- válvula genérica.

As variantes inseridas inline preservam duas conexões explícitas no Engineering Graph.

## Glyph system

A renderização saiu do bloco monolítico do `main.jsx` para:
`src/ui/industrial-symbol-glyphs.jsx`.

Os glyphs são desenhos H2F próprios, construídos em SVG local e inspirados em convenções públicas de desenho industrial. Não são cópia literal de bibliotecas externas.

## Qualidade

- regressão acumulada: PASS;
- UX-02 Shell: 20/20 PASS;
- UX-03 Library Schema: 20/20 PASS;
- UX-04 Piping Library: 24/24 PASS;
- build Vite 8.3.3: PASS;
- Playwright/Chrome UX-04: 6/6 PASS;
- Local Server UX-04 montado pelo workflow: PASS;
- UX-02 browser regression no mesmo commit final: PASS.

## Decisão

**FASE UX-04 CONCLUÍDA E AUDITADA.**

Próxima fase: **UX-05 — Instrumentação, suportes e equipamentos**.
