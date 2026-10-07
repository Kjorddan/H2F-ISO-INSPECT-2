# H2F ISO INSPECT 2.0

Editor inteligente de isométricos industriais, inspeção e END.

## Estado atual — Fase 32

- Roadmap técnico: **Fases 0–32 executadas**
- Versão interna: `0.32.0`
- Distribuição atual: `2.0.0-phase32-pre-release`
- Release estável `2.0.0`: **não publicada**
- Único gate formal pendente: `CORPORATE_SIGNOFF`

A baseline técnica final passou por regressão acumulada, build de produção, Playwright/Chrome, runtime Windows real, benchmark até 20.000 entidades e auditoria de dependências de produção com zero vulnerabilidades reportadas no gate final.

A tag/release `2.0.0` não deve ser criada antes da homologação corporativa humana explícita H2F.

## Arquitetura

O produto mantém separação entre Scene Graph e Engineering Graph, geometria visual e propriedades físicas, topologia explícita de portas/conexões e IDs estáveis. Cruzamento visual não cria conexão física e saídas de IA de baixa confiança dependem de Human-in-the-loop antes de virarem fatos de engenharia.

O frontend é React/Vite. A distribuição local é compilada para arquivos estáticos e servida pelo servidor PowerShell/TCP incluído no pacote.

## IA e reconstrução

A Fase 32 integrou execução local no navegador para:

- binarização e detecção de linhas;
- regiões candidatas de simbologia;
- OCR local em português;
- confidence e alternativas;
- dúvidas HITL;
- resposta humana vinculada ao reconhecimento;
- geração de propostas;
- materialização de PipeRuns/símbolos nativos editáveis;
- comparação com o underlay original;
- salvamento em `.h2fiso`.

O runtime OCR é empacotado para uso offline na distribuição compilada.

**Limite documentado:** PDF pode ser importado como referência/underlay, mas uma página PDF precisa ser rasterizada antes de entrar no pipeline CV/OCR browser.

## Execução local offline

O workflow `Phase 32 Pre-Release Local Server` gera:

`H2F_ISO_INSPECT_2.0_PHASE32_PRE_RELEASE_LOCAL_SERVER.zip`

Depois de extrair:

1. execute `INICIAR_H2F_ISO_INSPECT.bat`;
2. acesse `http://127.0.0.1:8787/` se necessário;
3. encerre com `PARAR_H2F_ISO_INSPECT.bat`.

O pacote compilado não requer Python ou Node.js no computador de operação.

## Desenvolvimento

Requer Node.js 22.

```bash
npm ci
npm test
npm run build
```

Para desenvolvimento:

```bash
npm start
```

## Gates de qualidade

- `RC Quality Gate`: regressão acumulada + build;
- `Phase 32 Browser Acceptance`: critérios 194–197 no Chrome;
- `Phase 32 Windows Local Runtime`: launcher, servidor, healthcheck e shutdown no Windows;
- `Phase 32 Stable Release Gate`: performance, readiness e auditoria de dependências;
- `Phase 32 Pre-Release Local Server`: distribuição reproduzível com `package-lock.json`.

## Homologação final

Os gates técnicos automatizados estão aprovados. A promoção para `2.0.0` estável depende de uma homologação humana corporativa H2F explicitamente registrada. Consulte `docs/GUIA_HOMOLOGACAO_FINAL.md`.
