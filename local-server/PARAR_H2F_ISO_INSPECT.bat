@echo off
setlocal
cd /d "%~dp0"
set "PIDFILE=%~dp0runtime\server.pid"

if not exist "%PIDFILE%" (
  echo O servidor H2F ISO INSPECT nao parece estar em execucao.
  exit /b 0
)

set /p SERVERPID=<"%PIDFILE%"
powershell.exe -NoProfile -Command "$p=Get-CimInstance Win32_Process -Filter 'ProcessId = %SERVERPID%' -ErrorAction SilentlyContinue; if(-not $p){exit 0}; if($p.CommandLine -notmatch 'H2F\.LocalServer\.ps1'){exit 2}; Stop-Process -Id %SERVERPID% -Force -ErrorAction Stop; exit 0"
set "RC=%errorlevel%"

if "%RC%"=="0" (
  del /q "%PIDFILE%" >nul 2>&1
  echo Servidor H2F ISO INSPECT encerrado.
  exit /b 0
)

if "%RC%"=="2" (
  echo O PID armazenado nao pertence ao servidor H2F. O arquivo de PID sera removido por seguranca.
  del /q "%PIDFILE%" >nul 2>&1
  exit /b 2
)

echo Nao foi possivel encerrar o processo %SERVERPID%.
exit /b 1
