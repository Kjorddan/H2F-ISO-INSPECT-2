# UX-10 — Auditoria final integrada, metodologia e referências
## Referência de controle
Baseline congelada em `CHECKPOINT_UX09.json`, commit `294a30aa9c118b2a6992d527d2e710320019c797`, branch `ux-evolution`. A branch `main` permanece fora de escopo.

## Golden Masters disponíveis
- `golden_dataset/GOLDEN_DATASET_MANIFEST.json` retém 9 páginas de referência industrial vetorial, hash do PDF fonte e hashes de renderização por página. O arquivo contém **manifesto e hashes**; não representa, por si, inspeção humana de paridade com cada desenho de cliente.
- Testes estruturais e de vetor em `tests/golden-master.test.mjs`; testes UX-02, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09 e UX-10 são executados conjuntamente no Chrome do GitHub Actions.
- Capturas do Chromium e exemplos PDF fazem parte do artefato de evidências. Golden Master visual do browser em CI é evidência automatizada, não homologação do Windows de campo.

## Constatações identificadas e tratadas
1. **CTRL-001 (ALTO)**: o snapshot da UX-09 cobria somente documento e geometria. Resultados END, TML, inspeção, fotos, evidências, mecanismos de dano, underlays e catálogo autoral podiam mudar após aprovação sem invalidar SHA-256. Implementado `h2f-controlled-release/v2` com hash expandido e revalidação antes do download.
2. **MARKER-002 (ALTO)**: o painel de propriedades de símbolos UX-06 era ocultado pela verificação `libraryMeta.h2fCustom`, sinal verdadeiro inclusive em símbolos da biblioteca built-in. Agora reconhece símbolos autorais pela definição `custom`; blocos de TML, PAUT, END, inspeção e folha voltam a permitir ações qualificadas.
3. **SERVER-003 (ALTO)**: Local Server Windows permitia configuração para `0.0.0.0` (exposição de servidor estático sem autenticação em rede). O servidor agora somente aceita loopback, com timeouts em sockets.
4. **SERVER-004 (MÉDIO)**: verificação `StartsWith($rootFull)` podia aceitar irmãos de diretório como `www-backup`; validação passou a usar prefixo com separador de diretório.
5. **AUDIT-005**: diagnóstico integrado reúne esquema da folha, medições, END, orfandade de anexos/marcadores, dados de corrosão, modelos personalizados, ligações do Engineering Graph e alertas de conflitos de apresentação.

## Metodologia de aceite
- Gates compilação Vite, full `npm test`, Chromium e artefatos Windows por CI.
- Verificação CRC, nomes, hashes SHA-256 e presença de VERSION.json/launcher no arquivo distribuído.
- Testes do gate de aprovação verificam **mutação após assinatura de snapshot de estado**, mas **nenhum PDF possui assinatura eletrônica ICP-Brasil** ou autenticação remota.
- Advertências não bloqueantes exigem checagem humana antes do uso em contratos. Problemas com severidade BLOCKER precisam ser solucionados antes de emitir documentação controlada em obra.

## Limitações irredutíveis neste ambiente
- **Não houve teste operacional numa estação Windows/Edge/driver físico**, embora os scripts e pacote tenham validação estática e o app rode no Chromium de CI.
- **Não houve comparação/revisão de desenhos reais certificados por cliente**, nem leitura integral de normas licenciadas do cliente ou validação do especialista PLH.
- Underlays e fontes externas podem variar entre renderizadores PDF/browser. Não existe assinatura digital verificável e a biblioteca corporativa local não fornece multi-tenant RBAC de servidor.
- O programa não interpreta medidas gráficas como comprimentos físicos por pressuposição.

**Decisão:** ciclo UX-01–UX-10 só pode ser denominado `concluído e auditado no CI`, com pendências explícitas de homologação de campo; nunca `homologação certificada` enquanto essas etapas não forem executadas.
