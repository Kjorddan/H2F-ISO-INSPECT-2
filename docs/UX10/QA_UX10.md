# UX-10 — QA integrada de fechamento

## Execução e evidências
O workflow `UX-10 Final Integrated Golden Master QA` integra full `npm test`, build Vite, Playwright Chrome UX02/04/05/06/07/08/09/10, geração dos pacotes de Windows Local Server, fonte e capturas.

Matriz de aceitação:
| Gate | Critério de aceitação |
|---|---|
| Testes históricos | Sem falhas em UX01–UX09 |
| Núcleo UX10 | SHA-256 v2 de documentos com END, evidências, integridade, underlays, formas personalizadas e revisões |
| Chromium UI | Navegação integrada, UX06, criação de símbolos UX07, UX08, UX09 e UX10 |
| Documento antigo | Importação preservada, emissão controlada BLOQUEADA até snapshot UX10 |
| Documento aprovado e íntegro | Gate v2 liberado apenas se revisão e dados associados coincidirem |
| Documento pós-alteração END | Gate BLOQUEADO |
| PDF visual | Multiformato, controle sem assinatura, evidências PDFs existentes |
| Segurança server | Somente loopback e traversal com raiz delimitada |
| ZIP final | CRC de todos os ZIPs, SHA256 registrado, VERSION.json coerente |
| Windows físico | PENDENTE: não confundir montagem em CI Linux com smoke test operacional |

## Condições que permanecem abertas
Windows 10/11 + Chrome/Edge com antivírus/Defender; impressão A0–A4 em drivers reais; underlays PDF/SVG de contratos reais; conferência de equivalência de simbologia por responsável técnico e normas contratuais; desempenho em desenhos de alta densidade e memória limitada.

Os resultados numéricos, workflow final e hash de commit serão preenchidos somente após conclusão comprovada do pipeline de release.

## QA adicional — persistência de evidências
- 40 testes UX10 de núcleo planejados, incluindo flag de anexo `blob:` não arquivado e fonte `data:` com SHA-256.
- O sétimo cenário UX10 Chromium anexa foto PNG, exporta `.h2fiso`, confere referência `data:image/png;base64,` e SHA-256, reabre o documento e confirma persistência.
- O pacote nativo H2F é JSON com bytes embutidos em base64, não oferece criptografia de anexo no arquivo; proteger o arquivo físico é responsabilidade do ambiente do usuário.

## Gate adicional .h2fiso
43 casos core UX10 previstos. Além da persistência da foto, a validação do manifesto será exercitada em três testes: arquivo H2F íntegro PASS; status END alterado após exportação REJEITADO; manifesto sem SHA-256 REJEITADO. Este check não substitui assinatura digital ou autenticação do autor. O esquema H2F mantém compatibilidade de leitura de documentos JSON, mas pacotes `.h2fiso` legados sem hash documental exigem reexportação.
