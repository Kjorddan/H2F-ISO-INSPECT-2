# H2F ISO INSPECT 2.0 — FASE UX-02
## Shell, toolbar, ícones, tooltips, menus e responsividade

**Branch:** `ux-evolution`  
**Commit de runtime validado:** `d5ab69abb6816c5cc79af2f32b66204d4f6fc655`  
**Workflow final:** `37705093738` — SUCCESS

## Implementado

- menu superior funcional para Arquivo, Editar, Exibir, Inserir, Organizar, Inspeção, Revisão e Ajuda;
- comandos indisponíveis permanecem desabilitados com motivo explícito;
- toolbar redesenhada com ícones SVG locais, sem CDN;
- tooltips em português com suporte a hover e foco;
- agrupamento lógico de ferramentas;
- botão de overflow "Mais ferramentas" para comandos secundários;
- remoção da rolagem horizontal da toolbar;
- breakpoints responsivos;
- biblioteca lateral recolhível;
- painel Propriedades recolhível e com modo auto-hide;
- persistência local do estado dos painéis;
- auto-recolhimento de painéis em 1024 px;
- Navigator ocultável e persistente;
- paleta Ctrl+K passou a executar os comandos selecionados;
- Exportar PDF passou a estar disponível pelo menu Arquivo;
- ações existentes foram reaproveitadas sem substituir Editor Core, Scene Graph ou Engineering Graph.

## Menus

Os menus agora possuem ações reais. Funções ainda não pertencentes à UX-02 — por exemplo editor gráfico de página/carimbo, histórico persistente de arquivos recentes e diff visual de revisões — aparecem desabilitadas com justificativa; nenhum item é apresentado como funcional sem implementação correspondente.

## Responsividade validada

Playwright/Google Chrome validou:

- 1920×1080
- 1600×900
- 1536×864
- 1440×900
- 1366×768
- 1280×720
- 1024×768

Critérios: toolbar contida, sem scroll horizontal, página sem overflow horizontal, menu Arquivo acessível e viewport do editor utilizável.

Em 1024×768 a biblioteca e as Propriedades são recolhidas automaticamente na inicialização, preservando o canvas. O usuário pode reabri-las pelos comandos do shell.

## Evidência

- regressão acumulada: SUCCESS;
- build Vite de produção: SUCCESS;
- teste estrutural UX-02: 20/20 PASS;
- Playwright UX-02: 9/9 PASS;
- pacote Local Server montado pelo mesmo workflow: SUCCESS.

## Decisão

**FASE UX-02 CONCLUÍDA E AUDITADA.**

Próxima fase: **UX-03 — Arquitetura e infraestrutura da nova biblioteca industrial**.
