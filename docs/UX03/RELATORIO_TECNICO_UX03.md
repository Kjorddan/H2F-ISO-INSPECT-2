# H2F ISO INSPECT 2.0 — FASE UX-03
## Arquitetura e infraestrutura da nova biblioteca industrial

Status: `CONCLUIDA_AUDITADA`

Branch: `ux-evolution`  
Commit técnico validado: `709b2802fe98c2b1f6e1b12ff0fdc914f43cf339`  
Workflow UX-03: `37707891597` — SUCCESS  
Workflow UX-02 de regressão visual após UX-03: `37707891599` — SUCCESS

## Objetivo

Criar a infraestrutura técnica para que a biblioteca deixe de ser apenas um catálogo visual e passe a possuir semântica industrial explícita, auditável e extensível.

Esta fase NÃO redesenha ainda a simbologia. O redesenho visual/técnico começa na UX-04 e continua nas UX-05/UX-06.

## Implementado

- schema da biblioteca elevado para v2;
- metadados obrigatórios em todos os 86 símbolos built-in;
- categoria e subcategoria;
- descrição técnica;
- contextos de uso separados: ISOMETRIC, P&ID, INSPECTION, NDT, SHEET e ANNOTATION;
- referências técnicas associadas por contexto;
- status normativo explícito;
- flag H2F custom;
- provenance e status de revisão técnica;
- modos de inserção: DRAW, INLINE, JUNCTION, TERMINAL, ATTACHED, FREE e SHEET;
- política de snap por símbolo;
- portDefinitions semânticos e normalizados;
- validação estrutural do schema;
- geração automática da Matriz de Validação da Biblioteca;
- busca ampliada para descrição, subcategoria, contexto e referências;
- favoritos e recentes persistentes;
- metadados da biblioteca preservados na entidade inserida;
- visualização dos metadados no painel de Propriedades;
- exportação de biblioteca custom migrada para schema v2;
- importação retrocompatível de bibliotecas custom v1.

## Correções topológicas preventivas

A antiga regra atribuía genericamente dois ports a praticamente todas as conexões e flanges. Isso foi removido.

Agora:
- Tee: 3 ports (main-in, main-out, branch);
- Cross: 4 ports;
- Lateral: 3 ports;
- Cap: 1 port terminal;
- Plug: 1 port terminal;
- Blind flange: 1 port terminal;
- Olets: host + branch;
- válvulas e flanges inline aplicáveis: 2 ports;
- nozzle de equipamento: 1 port de equipamento;
- instrumentos não recebem process ports inventados.

Cross, lateral, cap, plug, flange blind e olets deixaram de ser tratados como componentes genéricos de split inline de dois ports. Isso evita criar topologia fisicamente incorreta.

## Governança técnica

Os símbolos built-in continuam marcados como `TECHNICAL_REVIEW_REQUIRED`.

A presença de uma referência técnica no schema NÃO significa que a forma gráfica já foi certificada como reprodução normativa. O redesenho e a validação símbolo a símbolo ocorrerão nas fases seguintes.

## Qualidade

Regressão acumulada: PASS  
Build Vite: PASS  
UX-03 Library Schema: 20/20 PASS  
Matriz gerada: 86/86 símbolos  
UX-02 browser regression após as mudanças da UX-03: SUCCESS

## Próxima fase

UX-04 — Tubulações, conexões, flanges e válvulas.
