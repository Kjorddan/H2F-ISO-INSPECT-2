# H2F ISO INSPECT 2.0 — Plano de homologação operacional Windows
**Estado:** PENDENTE DE EXECUÇÃO EM MÁQUINA WINDOWS REAL. Nenhum item deste formulário deve ser marcado como PASS automaticamente pelo pipeline Ubuntu.

## 1. Identificação do ensaio
- Técnico responsável: ______________________
- Contrato / unidade industrial: ______________________
- Data, ambiente e versão do SO: ______________________
- Versão Google Chrome / Microsoft Edge: ______________________
- Antivírus/EDR e políticas de execução: ______________________
- Driver e modelo de impressora / plotter A0–A4: ______________________
- Nome do pacote/commit em VERSION.json: ______________________
- Hash SHA256 do ZIP vs manifesto: ______________________

## 2. Pré-requisitos e implantação
- [ ] Extrair totalmente o ZIP `H2F_ISO_INSPECT_2.0_UX10_LOCAL_SERVER.zip` em pasta local gravável.
- [ ] Conferir `VERSION.json`, `LEIA_PRIMEIRO.md`, `www/`, `config/`, `server/`, `runtime/`, `logs/` e scripts BAT.
- [ ] Executar `INICIAR_H2F_ISO_INSPECT.bat` (sem Python, Node.js, Docker, Railway ou internet).
- [ ] Verificar `http://127.0.0.1:8787/__health` (porta padrão; se editada, adaptar no JSON).
- [ ] Verificar que porta não é publicada no endereço IP de rede; configuração `0.0.0.0` deve ser recusada.
- [ ] Testar abrir no Chrome e no Edge, reiniciar e parar o servidor sem processos órfãos.
- [ ] Conferir logs de erro e bloqueios da política corporativa do PowerShell.

## 3. E2E técnico industrial
- [ ] Biblioteca industrial com **227 símbolos built-in**, buscando válvula, flange, conexão, instrumento, suporte, equipamento, inspeção, END e legenda.
- [ ] PipeRun/segmentos, tee com branch, válvula inline, conexões e snap sem alteração de conectividade não solicitada.
- [ ] Criar TML; símbolo visual sem registro não deve significar medição realizada. Registro explícito deve ficar **PLANNED**.
- [ ] Criar END planejado PAUT/IRIS; não declarar método executado ou aprovado.
- [ ] Inserir símbolos de folha; conferir isolamento ao trocar, duplicar e excluir folhas.
- [ ] Criar forma gráfica com UX-07, versioná-la, exportar/importar biblioteca JSON e verificar símbolo inserido após reload.
- [ ] Editar margens, carimbo, zonas, tabelas END/TML, formatos A0–A4 e orientação; abrir `.h2fiso` novamente e conferir layout.
- [ ] Anexar foto PNG/JPEG e PDF permitido menor que 8 MiB; conferir SHA-256 e persistência de bytes ao salvar/reabrir documento nativo.
- [ ] Confirmar que URL temporária `blob:` de arquivo legado bloqueia emissão controlada até reinserir original.

## 4. Emissão PDF e impressão real
- [ ] Gerar um único PDF de múltiplas folhas, incluindo A4 retrato e A3 paisagem; conferir dimensões no visualizador externo.
- [ ] Exportar tabela END maior que 5 linhas; confirmar páginas de continuação e correspondência de TODOS os registros.
- [ ] Verificar rodapé `Página N / total`, identificação `PRÉVIA NÃO CONTROLADA` e preservação do carimbo.
- [ ] Testar impressão A4 em escala física e orientação correta, sem corte de bordas, marcações editoriais ou elementos interativos.
- [ ] Testar A3/A2/A1/A0 nos plotters disponíveis, medindo com régua quando escala física declarada for requisito do cliente.
- [ ] Importar arquivos de referência PNG/SVG/PDF e conferir fidelidade do underlay na exportação para PDF; registrar limitações.
- [ ] Tentar emitir documento APROVADO com snapshot antigo UX09: deve bloquear.
- [ ] Criar novo snapshot UX10; confirmar SHA-256 v2 e emissão controlada sem alegar assinatura.
- [ ] Editar um END, espessura ou foto após snapshot; confirmar bloqueio da emissão até nova revisão formal.
- [ ] Confirmar visualmente ausência de comprovante de impressão ou assinatura ICP-Brasil automática.

## 5. Critérios de aceite e evidência
Cada item marcado PASS deve ser acompanhado de screenshot/log/arquivo de teste, responsável, hora e resultado observado. Anotar defeitos, tags e referências técnicas.

- Resultado homologação funcional Windows: PASS / FAIL / PENDENTE
- Resultado impressão/plotagem: PASS / FAIL / PENDENTE
- Resultado segurança Local Server: PASS / FAIL / PENDENTE
- Resultado simbologia contratual: PASS / FAIL / PENDENTE
- Resultado integridade dos registros END: PASS / FAIL / PENDENTE
- Pendências impeditivas: ______________________
- Assinatura/aprovação do responsável técnico PLH, se aplicável: ______________________

**Regra:** não considerar homologação física, certificação normativa ou aceite do cliente executados sem documentação comprobatória.