# Cordova

Este projeto continua funcionando como site Docsify na raiz. Para gerar o app Cordova, o conteudo da wiki e copiado para `www/` durante a preparacao/build.

## Android

```powershell
npm.cmd install
npx.cmd cordova platform add android
npm.cmd run cordova:build:android
```

O script `scripts/sync-cordova-www.js` limpa e recria `www/` antes do `cordova prepare`, mantendo o site original sem mudancas estruturais. As dependencias externas ficam em `vendor/` e sao copiadas junto para o app.

## Atalhos

```powershell
.\teste.bat
.\build-android.bat
```

O `run.bat` atualiza `www/`, abre `http://127.0.0.1:8080/` no navegador e mantem um servidor local ativo ate voce pressionar `Ctrl+C`.

Antes do teste ou build, `npm.cmd run vendor` atualiza as dependencias locais que substituem as CDNs.

Antes de preparar ou buildar, o script `scripts/update-cordova-config.js` le a versao em `about.zrfi` e atualiza o `config.xml` com:

- id: `zrfisaac.wiki`
- nome: `ZR WIKI`
- icone: `logo.png`

Como o identificador Android do app e `zrfisaac.wiki`, o build tambem ajusta a `MainActivity` gerada em `platforms/android` depois do `cordova prepare`.
