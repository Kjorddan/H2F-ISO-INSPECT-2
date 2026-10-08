# QA — UX-05 Instrumentação, Suportes e Equipamentos

**Branch:** `ux-evolution`
**Runtime submetido aos testes:** `942bcfd0b598332c01273490f718f43bea468de9`
**Status:** `CONCLUIDA_AUDITADA`

| Gate | Evidência/resultados |
|---|---|
| npm ci | PASS — workflow UX-05 |
| npm test (regressão completa) | PASS — workflow UX-05 |
| Core dedicado UX-05 | **21/21 PASS** |
| UX-02 Shell Core | **20/20 PASS** |
| UX-03 Library Schema Core | **20/20 PASS** |
| UX-04 Piping Core | **24/24 PASS** |
| npm run build | PASS — Vite |
| Chromium UX-05 | **7/7 PASS** |
| Browser UX-02 compatibilidade | PASS — workflow UX-02 |
| Browser UX-04 compatibilidade | PASS — workflow UX-04 do último commit alterando arquitetura UX-05 |
| Export matrix UX-03 | PASS — workflow UX-03 |
| Port/nozzle snap e rotação | PASS |
| Sem conexão por proximidade | PASS |
| Suporte sem process ports | PASS |
| Remoção de nozzle conectado bloqueada | PASS |
| TAG dentro do instrumento | PASS — screenshots e revisão visual |
| SVG local/sem CDN | PASS |
| Local Server — montagem CI/ZIP | PASS |
| Smoke test real Windows | NÃO EXECUTADO NESTE AMBIENTE; homologação com usuários permanece recomendada |

## Workflows verificáveis

- UX-05 em commit runtime final `942bcfd0b598332c01273490f718f43bea468de9`: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37715413516
- UX-02 em commit runtime final: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37715413507
- UX-03 matriz em último commit com mudanças correlatas: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37715215529
- UX-04 regressão em último commit com mudanças correlatas: https://github.com/Kjorddan/H2F-ISO-INSPECT-2/actions/runs/37715215624

## Evidências Playwright

- `test-results/ux05-instrument-library.png`
- `test-results/ux05-support-library.png`
- `test-results/ux05-equipment-library.png`
- `test-results/ux05-support-attached-to-pipe.png`
- `test-results/ux05-equipment-nozzle-connection.png`
- `test-results/ux05-instrumentation-tag-fit.png`
- `test-results/ux05-equipment-configurable-nozzles.png`

Os screenshots foram visualizados durante a auditoria; um desvio de rótulo no manômetro foi corrigido antes do commit final testado. Os screenshots são indicadores do comportamento observado, não prova de validação normativa específica do símbolo.

## Local Server

O workflow de distribuição gera `H2F_ISO_INSPECT_2.0_UX05_LOCAL_SERVER.zip`, contendo `www/`, `server/`, `config/`, `runtime/`, `logs/`, `data/`, `backups/`, scripts `INICIAR`, `PARAR`, `ABRIR`, documentação e `VERSION.json`. Sem dependência de internet, Python, Node ou Docker no computador Windows do operador.

**Regra de aprovação:** somente a UX-05 está encerrada; UX-06 permanece bloqueada até comando do usuário.
