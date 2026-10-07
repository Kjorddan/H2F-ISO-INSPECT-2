param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\www")).Path,
  [string]$ConfigPath = (Join-Path $PSScriptRoot "..\config\server.json")
)

$ErrorActionPreference = "Stop"
$scriptRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$runtimeDir = Join-Path $scriptRoot "runtime"
$logDir = Join-Path $scriptRoot "logs"
New-Item -ItemType Directory -Force -Path $runtimeDir, $logDir | Out-Null

$config = @{ host = "127.0.0.1"; port = 8787 }
if (Test-Path $ConfigPath) {
  try {
    $loaded = Get-Content -Raw -LiteralPath $ConfigPath | ConvertFrom-Json
    if ($loaded.host) { $config.host = [string]$loaded.host }
    if ($loaded.port) { $config.port = [int]$loaded.port }
  } catch { throw "Falha ao ler config/server.json: $($_.Exception.Message)" }
}

$ip = if ($config.host -eq "127.0.0.1" -or $config.host -eq "localhost") {
  [System.Net.IPAddress]::Loopback
} elseif ($config.host -eq "0.0.0.0") {
  [System.Net.IPAddress]::Any
} else {
  [System.Net.IPAddress]::Parse($config.host)
}

$port = [int]$config.port
$listener = [System.Net.Sockets.TcpListener]::new($ip, $port)
$utf8 = [System.Text.UTF8Encoding]::new($false)
$pidPath = Join-Path $runtimeDir "server.pid"
$logPath = Join-Path $logDir "server.log"
Set-Content -LiteralPath $pidPath -Value $PID -Encoding ascii

function Write-Log([string]$Message) {
  $line = "{0:u} {1}" -f (Get-Date), $Message
  Add-Content -LiteralPath $logPath -Value $line -Encoding utf8
}

function Get-Mime([string]$Path) {
  switch ([IO.Path]::GetExtension($Path).ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8" }
    ".js" { "text/javascript; charset=utf-8" }
    ".mjs" { "text/javascript; charset=utf-8" }
    ".css" { "text/css; charset=utf-8" }
    ".json" { "application/json; charset=utf-8" }
    ".svg" { "image/svg+xml" }
    ".png" { "image/png" }
    ".jpg" { "image/jpeg" }
    ".jpeg" { "image/jpeg" }
    ".webp" { "image/webp" }
    ".ico" { "image/x-icon" }
    ".woff" { "font/woff" }
    ".woff2" { "font/woff2" }
    ".txt" { "text/plain; charset=utf-8" }
    default { "application/octet-stream" }
  }
}

function Send-Response(
  [System.Net.Sockets.NetworkStream]$Stream,
  [int]$Status,
  [string]$StatusText,
  [byte[]]$Body,
  [string]$ContentType,
  [bool]$HeadOnly = $false
) {
  $headers = @(
    "HTTP/1.1 $Status $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Cache-Control: no-store",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: no-referrer",
    "Permissions-Policy: geolocation=(), camera=(), microphone=()",
    "Connection: close",
    "",
    ""
  ) -join "`r`n"
  $headerBytes = $utf8.GetBytes($headers)
  $Stream.Write($headerBytes,0,$headerBytes.Length)
  if (-not $HeadOnly -and $Body.Length -gt 0) { $Stream.Write($Body,0,$Body.Length) }
}

try {
  $listener.Start()
  Write-Log "Servidor iniciado em http://$($config.host):$port/ raiz=$Root pid=$PID"
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream,$utf8,$false,4096,$true)
      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line -eq "") { break }
      }
      $parts = $requestLine.Split(" ")
      if ($parts.Count -lt 2) {
        Send-Response $stream 400 "Bad Request" $utf8.GetBytes("Bad Request") "text/plain; charset=utf-8"
        continue
      }
      $method = $parts[0].ToUpperInvariant()
      $rawPath = $parts[1].Split("?")[0]
      if ($method -notin @("GET","HEAD")) {
        Send-Response $stream 405 "Method Not Allowed" $utf8.GetBytes("Method Not Allowed") "text/plain; charset=utf-8"
        continue
      }
      if ($rawPath -eq "/__health") {
        $body = $utf8.GetBytes('{"status":"ok","app":"H2F ISO INSPECT 2.0","mode":"local"}')
        Send-Response $stream 200 "OK" $body "application/json; charset=utf-8" ($method -eq "HEAD")
        continue
      }
      $decoded = [Uri]::UnescapeDataString($rawPath)
      $relative = $decoded.TrimStart("/").Replace("/",[IO.Path]::DirectorySeparatorChar)
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }
      $candidate = [IO.Path]::GetFullPath((Join-Path $Root $relative))
      $rootFull = [IO.Path]::GetFullPath($Root)
      if (-not $candidate.StartsWith($rootFull,[StringComparison]::OrdinalIgnoreCase)) {
        Send-Response $stream 403 "Forbidden" $utf8.GetBytes("Forbidden") "text/plain; charset=utf-8"
        continue
      }
      if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { $candidate = Join-Path $Root "index.html" }
      if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        Send-Response $stream 404 "Not Found" $utf8.GetBytes("Not Found") "text/plain; charset=utf-8"
        continue
      }
      $bytes = [IO.File]::ReadAllBytes($candidate)
      Send-Response $stream 200 "OK" $bytes (Get-Mime $candidate) ($method -eq "HEAD")
    } catch {
      try {
        $stream = $client.GetStream()
        Send-Response $stream 500 "Internal Server Error" $utf8.GetBytes("Internal Server Error") "text/plain; charset=utf-8"
      } catch {}
      Write-Log "Erro de requisicao: $($_.Exception.Message)"
    } finally { $client.Close() }
  }
} finally {
  try { $listener.Stop() } catch {}
  Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
  Write-Log "Servidor encerrado."
}
