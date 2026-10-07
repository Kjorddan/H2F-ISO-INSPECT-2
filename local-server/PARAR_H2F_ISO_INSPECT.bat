@echo off
setlocal
cd /d "%~dp0"
set "PIDFILE=%~dp0runtime\server.pid"

if not exist "%PIDFILE%" (
  echo O servidor H2F ISO INSPECT nao parece estar em execucao.
  exit /b 0
)

set /p SERVERPID=<"%PIDFILE%"
powershell.exe -NoProfile -Command "try { Stop-Process -Id %SERVERPID% -Force -ErrorAction Stop; exit 0 } catch { exit 1 }"
if %errorlevel%==0 (
  del /q "%PIDFILE%" >nul 2>&1
  echo Servidor H2F ISO INSPECT encerrado.
  exit /b 0
)

echo Nao foi possivel encerrar o processo %SERVERPID%.
exit /b 1
