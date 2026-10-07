@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"
set "URL=http://127.0.0.1:8787/"
set "HEALTH=http://127.0.0.1:8787/__health"

powershell.exe -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 '%HEALTH%'; if($r.StatusCode -eq 200){exit 0}else{exit 1} } catch { exit 1 }"
if %errorlevel%==0 goto OPEN

start "H2F ISO INSPECT Local Server" /min powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0server\H2F.LocalServer.ps1"

for /L %%I in (1,1,30) do (
  powershell.exe -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 1 '%HEALTH%'; if($r.StatusCode -eq 200){exit 0}else{exit 1} } catch { exit 1 }"
  if !errorlevel! equ 0 goto OPEN
  timeout /t 1 /nobreak >nul
)

echo.
echo Nao foi possivel iniciar o H2F ISO INSPECT.
echo Consulte logs\server.log.
pause
exit /b 1

:OPEN
start "" "%URL%"
exit /b 0
