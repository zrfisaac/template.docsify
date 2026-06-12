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

echo [2/2] Gerando APK Android...
call npm.cmd run cordova:fix-android
if errorlevel 1 goto erro

call npx.cmd cordova prepare android
if errorlevel 1 goto erro

call npm.cmd run cordova:fix-android
if errorlevel 1 goto erro

call npx.cmd cordova compile android
if errorlevel 1 goto erro

echo.
echo Build concluido.
echo APK:
echo %CD%\platforms\android\app\build\outputs\apk\debug\app-debug.apk
goto fim

:erro
echo.
echo Falha no build Android.
exit /b 1

:fim
endlocal
