# H2F ISO INSPECT 2.0 — RELATÓRIO TÉCNICO UX-07

## Criador de Formas Personalizadas — Fase 7/10

**Branch:** `ux-evolution`; sem alterações em `main`.
**Base:** `CHECKPOINT_UX06.json` aprovado, catálogo industrial de **227 símbolos**.
**Status:** CONCLUÍDA E AUDITADA.
**Progresso:** UX-07/10, restam **três fases**: UX-08, UX-09, UX-10.

### Entregas
Implementado criador vetorial completo H2F: tela de edição com oito ferramentas, desenho por gesto, prévia, grades, edição de parâmetros, mover e ordenar primitivas, exclusão, desfazer/refazer, criação de pontos de referência, cadastro, versões, importação/exportação de bibliotecas JSON v2 e biblioteca armazenada localmente.

O símbolo autoral é uma **definição gráfica de projeto**. Mesmo quando classificado em família de inspeção, END, suportação ou equipamentos, não cria ligação de fluido, conexão mecânica de porta ou registro aprovado sem workflow próprio.

### Retenção do legado
Todas as definições antigas da biblioteca continuam disponíveis. Os IDs de formas e os documentos `.h2fiso` armazenam a geometria e metadados necessários para exibição offline. Editar uma forma aumenta sua versão, sem alterar a forma usada em um documento salvo anteriormente. Dados de bibliotecas antigas sem geometria permanecem editáveis como rascunhos.

### Segurança
Validação estrita da geometria, detecção de IDs não seguros e reservados, rejeição de números infinitos, limites de tamanho, primitive count, pontos referenciais e detecção de conflito ao importar versões idênticas. Não existe eval, script SVG, HTML arbitrário nem carga de código de terceiros via editor.

### Limites
Não se certifica conformidade normativa de símbolos desenhados. Escopos são metadados locais. Recursos multiusuário, sincronização central e RBAC de bibliotecas estão fora do escopo desta fase. As fases UX-08 (folhas), UX-09 (publicação/ impressão/PDF) e UX-10 (homologação integrada) ainda não foram executadas.

### Aceitação
A regressão `npm test`, build e Playwright Chromium da UX-07 passaram com **32/32 testes de núcleo** e **9/9 testes Chromium** no workflow GitHub Actions de referência. O instalador Local Server é gerado pelo CI, mas não se alega execução em computador Windows de produção.

### Regra operacional
**Aguardar exclusivamente “Pode seguir” para iniciar UX-08.** Nenhum avanço automático.

### Acabamento gráfico final
O editor UX-07 usa precisão de entrada de 0,1 unidade gráfica nos movimentos do ponteiro, preservando resultados numéricos legíveis nas propriedades. O último pipeline validou a alteração, sem introduzir conexões físicas.
