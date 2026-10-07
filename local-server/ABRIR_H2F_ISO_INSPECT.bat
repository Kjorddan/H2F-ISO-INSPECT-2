@echo off
setlocal
cd /d "%~dp0"

set "CONFIG=%~dp0config\server.json"
set "PORT=8787"
for /f "usebackq delims=" %%P in (`powershell.exe -NoProfile -Command "$p=8787; try{$c=Get-Content -Raw -LiteralPath '%CONFIG%'|ConvertFrom-Json; if($c.port){$p=[int]$c.port}}catch{}; Write-Output $p"`) do set "PORT=%%P"
set "URL=http://127.0.0.1:%PORT%/"

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "%URL%"
  exit /b 0
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" "%URL%"
  exit /b 0
)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
  start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" "%URL%"
  exit /b 0
)

start "" "%URL%"
