const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const javaRoot = path.join(root, 'platforms', 'android', 'app', 'src', 'main', 'java');
const packageName = 'zrfisaac.template.docsify';
const packagePath = path.join(javaRoot, ...packageName.split('.'));
const targetFile = path.join(packagePath, 'MainActivity.java');

function findMainActivity(directory) {
	if (!fs.existsSync(directory)) {
		return null;
	}

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const fullPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			const found = findMainActivity(fullPath);
			if (found) {
				return found;
			}
			continue;
		}

		if (entry.isFile() && entry.name === 'MainActivity.java') {
			const content = fs.readFileSync(fullPath, 'utf8');
			if (content.includes('extends CordovaActivity')) {
				return fullPath;
			}
		}
	}

	return null;
}

const sourceFile = findMainActivity(javaRoot);

if (!sourceFile) {
	throw new Error('Nao encontrei MainActivity.java do Cordova.');
}

fs.mkdirSync(packagePath, { recursive: true });

let content = fs.readFileSync(sourceFile, 'utf8');
content = content.replace(/package\s+[^;]+;/, `package ${packageName};`);
fs.writeFileSync(targetFile, content, 'utf8');

if (path.resolve(sourceFile) !== path.resolve(targetFile)) {
	fs.rmSync(sourceFile, { force: true });
}

console.log(`Android MainActivity ajustado para package ${packageName}`);
