@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "CONFIG=%~dp0config\server.json"
set "PORT=8787"
for /f "usebackq delims=" %%P in (`powershell.exe -NoProfile -Command "$p=8787; try{$c=Get-Content -Raw -LiteralPath '%CONFIG%'|ConvertFrom-Json; if($c.port){$p=[int]$c.port}}catch{}; Write-Output $p"`) do set "PORT=%%P"

set "URL=http://127.0.0.1:%PORT%/"
set "HEALTH=http://127.0.0.1:%PORT%/__health"

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
echo Verifique se a porta %PORT% esta livre e consulte logs\server.log.
pause
exit /b 1

:OPEN
if /I "%H2F_NO_BROWSER%"=="1" exit /b 0
call "%~dp0ABRIR_H2F_ISO_INSPECT.bat"
exit /b 0
