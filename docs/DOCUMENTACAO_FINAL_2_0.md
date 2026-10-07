# Documentação Final — H2F ISO INSPECT 2.0

## Produto

Editor industrial inteligente de isométricos, inspeção e END com Scene Graph e Engineering Graph separados, topologia explícita, entidades editáveis e rastreabilidade.

## Fluxo IA final

1. importar referência rasterizável;
2. rasterizar no navegador;
3. binarizar;
4. detectar linhas;
5. detectar regiões candidatas de símbolo;
6. executar OCR local em português;
7. classificar/rankear símbolos;
8. apresentar confidence e alternativas;
9. gerar dúvidas HITL;
10. receber resposta humana;
11. vincular resposta ao reconhecimento;
12. gerar propostas;
13. materializar PipeRuns/símbolos nativos;
14. editar, comparar e salvar.

O OCR é autocontido na distribuição local. **Limite conhecido:** PDF é aceito como referência/underlay, mas uma página PDF precisa ser rasterizada antes do pipeline CV/OCR browser.

## Formatos

- nativo: `.h2fiso`;
- JSON;
- CSV técnico;
- SVG;
- PDF vetorial dedicado;
- preview de impressão.

## Execução local

Extraia `H2F_ISO_INSPECT_2.0_PHASE32_PRE_RELEASE_LOCAL_SERVER.zip`, execute `INICIAR_H2F_ISO_INSPECT.bat` e acesse `http://127.0.0.1:8787/`. Encerre com `PARAR_H2F_ISO_INSPECT.bat`.

## Estado de release

Versão interna: `0.32.0`.

Distribuição: `2.0.0-phase32-pre-release`.

A promoção para `2.0.0` estável depende de `CORPORATE_SIGNOFF`.
