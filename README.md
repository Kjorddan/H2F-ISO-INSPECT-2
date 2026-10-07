# H2F ISO INSPECT 2.0

Editor inteligente de isométricos industriais, inspeção e END. Este repositório contém o Release Candidate da linha 2.0.

## Release atual

- Aplicação: H2F ISO INSPECT 2.0
- Fase: 30 — Release Candidate
- Distribuição atual: Local Server para Windows
- Release da distribuição: `2.0.0-rc.30`
- Versão interna do pacote: `0.30.0`

A implantação Railway foi preservada no código, mas deixou de ser requisito para esta RC por decisão de implantação local. O GitHub continua sendo a fonte de desenvolvimento e versionamento.

## Arquitetura

O produto mantém separação entre Scene Graph e Engineering Graph, geometria visual e propriedades físicas, topologia explícita de portas/conexões, ferramentas de desenho, biblioteca industrial, documentação de engenharia, inspeção/END, evidências, integridade, colaboração, offline/PWA e pipeline de reconstrução assistida.

O frontend é React/Vite. A distribuição local é compilada para arquivos estáticos e servida por um pequeno servidor PowerShell/TCP incluído no pacote. O computador não precisa ter Node.js, Python ou Docker instalados para usar o pacote já compilado.

## Execução local offline

O workflow `RC30 Local Server` gera o pacote:

`H2F_ISO_INSPECT_2.0_RC30_LOCAL_SERVER.zip`

Depois de extrair:

1. execute `INICIAR_H2F_ISO_INSPECT.bat`;
2. acesse `http://127.0.0.1:8787/`;
3. encerre com `PARAR_H2F_ISO_INSPECT.bat`.

Consulte `local-server/README_LOCAL.md` para detalhes.

## Desenvolvimento

Requer Node.js 22.

```bash
npm install
npm test
npm run build
```

Para desenvolvimento:

```bash
npm start
```

## Build e qualidade

Há dois workflows:

- `RC Quality Gate`: instala dependências, executa testes acumulados e build Vite;
- `RC30 Local Server`: repete o gate, compila o frontend e monta o ZIP offline para Windows.

O Golden Dataset industrial usa o manifesto versionado em `golden_dataset/GOLDEN_DATASET_MANIFEST.json`. Os arquivos binários de referência completos permanecem fora do repositório operacional quando não são necessários para o build.

## Deploy

- **Local Server:** modalidade principal desta RC; não requer internet durante a execução.
- **Docker/Railway:** arquivos `Dockerfile`, `deploy/nginx.conf` e `railway.toml` permanecem preservados para implantação futura.
- **Outros provedores:** o build `dist/` pode ser servido por qualquer host estático compatível com SPA.

## Testes

`npm test` executa a regressão acumulada das fases anteriores, incluindo viewport, grid, seleção, polylines, piping, Engineering Graph, snapping, biblioteca, inline components, documentação, annotations, document structure, produtividade, underlay, visão/OCR, reconhecimento, HITL, reconstrução, inspeção, evidências, integridade, colaboração, offline/sync, I/O, hardening, Golden Master, beta/homologação e gate RC.

## Troubleshooting local

- Se o navegador não abrir, execute `ABRIR_H2F_ISO_INSPECT.bat`.
- Se a porta 8787 estiver ocupada, altere `config/server.json`.
- Consulte `logs/server.log` em caso de falha do servidor local.
- O modo local padrão escuta apenas em `127.0.0.1`, não ficando exposto à LAN/internet.

## Estado de homologação

A existência do RC não equivale a homologação corporativa final. Testes de navegador, validações humanas, Golden Masters visuais e demais gates pendentes devem continuar sendo registrados explicitamente nas fases de validação subsequentes.
