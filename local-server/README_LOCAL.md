# H2F ISO INSPECT 2.0 — RC30 Local Server

Esta distribuição executa o mesmo frontend do RC30 por um servidor HTTP local no Windows, sem Railway e sem acesso à internet durante o uso normal.

## Requisitos

- Windows 10 ou 11.
- PowerShell 5.1 ou superior, já presente no Windows.
- Navegador moderno; o inicializador tenta abrir Google Chrome primeiro e usa o navegador padrão como alternativa.
- Não requer Python, Node.js, Docker, Railway, Cloudflare ou conexão com a internet para executar o pacote já compilado.

## Uso

1. Extraia o ZIP completo para uma pasta local.
2. Execute `INICIAR_H2F_ISO_INSPECT.bat`.
3. O servidor local será iniciado em `http://127.0.0.1:8787/` por padrão.
4. Para encerrar, execute `PARAR_H2F_ISO_INSPECT.bat`.
5. Para apenas reabrir a interface com o servidor já ativo, execute `ABRIR_H2F_ISO_INSPECT.bat`.

A porta pode ser alterada em `config/server.json`. Os inicializadores leem automaticamente essa configuração.

## Segurança e rede

Por padrão o servidor é vinculado somente a `127.0.0.1`. Assim, ele não fica exposto à rede local nem à internet. O servidor possui proteção contra traversal de caminho, aceita apenas GET/HEAD para conteúdo estático e envia cabeçalhos de segurança básicos.

## Persistência nesta RC

O servidor desta RC é um servidor estático local. Ele não transforma automaticamente o armazenamento do navegador em banco de dados no sistema de arquivos. Os mecanismos de persistência/sincronização do editor continuam obedecendo ao estado implementado nas fases anteriores. As pastas `data`, `uploads` e `backups` ficam reservadas para a evolução do backend local.

## GitHub

A modalidade local não substitui o repositório. O GitHub permanece como fonte de desenvolvimento, histórico e versionamento. O pacote offline é gerado automaticamente pelo workflow RC30 a partir do mesmo código-fonte.
