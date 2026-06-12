@echo off
setlocal

cd /d "%~dp0"

echo [1/2] Atualizando www do Cordova...
call npm.cmd run vendor
if errorlevel 1 goto erro

call npm.cmd run cordova:config
if errorlevel 1 goto erro

call npm.cmd run cordova:sync
if errorlevel 1 goto erro

echo [2/2] Abrindo teste no navegador...
echo.
echo URL: http://127.0.0.1:8080/
echo Para parar o servidor, pressione Ctrl+C nesta janela.
echo.

start "" "http://127.0.0.1:8080/"
node scripts\serve-cordova-www.js
goto fim

:erro
echo.
echo Falha ao preparar o teste.
exit /b 1

:fim
endlocal
