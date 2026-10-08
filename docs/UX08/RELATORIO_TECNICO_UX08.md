# H2F ISO INSPECT 2.0 — Relatório técnico UX-08

## Fase 8 de 10 — Formatação de folhas, carimbos, tabelas e templates

**Repositório:** `Kjorddan/H2F-ISO-INSPECT-2`. **Branch exclusiva:** `ux-evolution`. **Baseline auditado:** UX-07 `51449d138491a82264cebb0bb67e7febee0d58b0`.
**Estado documental:** UX-08 CONCLUÍDA E AUDITADA. Confirmação técnica no GitHub Actions 37731318525: núcleo 40/40 PASS, browser Chromium 11/11 PASS, regressão e build PASS.
**Após esta fase, restam duas:** UX-09 (PDF, impressão e workflow documental) e UX-10 (auditoria final).

## Funcionalidades entregues
1. Formatos ISO-A (A0, A1, A2, A3, A4), personalizados em milímetros, retrato/paisagem, moldura técnica com zonas e margens editáveis.
2. Carimbo vetorial editável com empresa, cliente, projeto, área, unidade, linha, título, documento/desenho, revisão, escala, responsáveis, data e notas.
3. Sete famílias de tabelas: materiais, soldas, END, TML/CML, revisões, notas e entradas manuais. Cada tabela possui ID, título, posição-âncora, largura, contagem de linhas e visibilidade.
4. Três layouts-base H2F e modelos pessoais com classificação local, reaplicação e preservação opcional de dados do carimbo.
5. Preview dentro do editor e overlay sobre a folha de desenho; **separação integral entre apresentação e grafo de engenharia**.
6. Duplicação e exclusão de folha com remapeamento/limpeza de símbolos editoriais UX-06, sem replicar tubulações ou alterar conectividade.
7. Persistência do layout por folha no documento nativo `.h2fiso` sem impedir leitura de arquivos das fases anteriores.

## Referências orientativas
ISO 5457:1999+Amd.1:2010 (folha), ISO 7200:2004 (dados de carimbo), ISO 7573:2008 (listas). Fonte primária: links no `PESQUISA_TECNICA_UX08.md`. As dimensões-base, proporções e layouts são convenções H2F que exigem homologação. A UX-08 não conclui requisitos formais de impressão ou emissão de projeto.

## Ações posteriores
- UX-09: paginação, exportação, paginação de tabelas extensas, impressão e PDF finais com conferência de margens e escala.
- UX-10: auditoria integrada, Golden Master, requisitos específicos por cliente, homologação visual e smoke test operacional em Windows real.

**Regra de fase:** UX-09 somente mediante comando explícito “Pode seguir”.
