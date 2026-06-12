const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const aboutPath = path.join(root, 'about.zrfi');
const configPath = path.join(root, 'config.xml');

const APP_ID = 'zrfisaac.wiki';
const APP_NAME = 'ZR WIKI';
const ICON = 'logo.png';

function readVersion() {
	const about = fs.readFileSync(aboutPath, 'utf8');
	const match = about.match(/^\s*#\s*-\s*version\s*:\s*zrfisaac\.wiki\s*:\s*([0-9]+(?:\.[0-9]+)*)\s*$/im);

	if (!match) {
		throw new Error('Nao encontrei a versao no about.zrfi.');
	}

	return match[1];
}

function versionCodeFrom(version) {
	const parts = version.split('.').map((part) => Number.parseInt(part, 10));
	while (parts.length < 4) {
		parts.push(0);
	}

	const [major, minor, patch, build] = parts;
	return String((major * 1000000) + (minor * 10000) + (patch * 100) + build);
}

function upsertIcon(xml) {
	if (/<icon\s+src="[^"]+"\s*\/>/.test(xml)) {
		return xml.replace(/<icon\s+src="[^"]+"\s*\/>/, `<icon src="${ICON}" />`);
	}

	return xml.replace(/\n\t<content src="index\.html" \/>/, `\n\t<content src="index.html" />\n\t<icon src="${ICON}" />`);
}

const version = readVersion();
const versionCode = versionCodeFrom(version);
let config = fs.readFileSync(configPath, 'utf8');

config = config.replace(
	/<widget\b([^>]*)>/,
	(match) => match
		.replace(/\sid="[^"]*"/, ` id="${APP_ID}"`)
		.replace(/\sversion="[^"]*"/, ` version="${version}"`)
		.replace(/\sandroid-versionCode="[^"]*"/, '')
		.replace(/>$/, ` android-versionCode="${versionCode}">`)
);

config = config.replace(/<name>[\s\S]*?<\/name>/, `<name>${APP_NAME}</name>`);
config = upsertIcon(config);

fs.writeFileSync(configPath, config, 'utf8');

console.log(`Cordova config: id=${APP_ID}, name="${APP_NAME}", version=${version}, android-versionCode=${versionCode}, icon=${ICON}`);
