const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

const includeEntries = [
	'.nojekyll',
	'about.zrfi',
	'index.html',
	'logo.png',
	'logo.svg',
	'pauta-docsify.js',
	'README.md',
	'academia',
	'botanica',
	'calculo',
	'culinaria',
	'eletronica',
	'harmonica',
	'link',
	'planta',
	'software',
	'svg',
	'temporario',
	'vendor',
	'web',
];

const textExtensions = new Set(['.html', '.htm', '.md', '.js', '.css', '.xml', '.txt', '.zrfi']);

function removeDirectoryContents(directory) {
	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, { recursive: true });
		return;
	}

	for (const entry of fs.readdirSync(directory)) {
		if (entry === '.gitkeep') {
			continue;
		}

		fs.rmSync(path.join(directory, entry), { recursive: true, force: true });
	}
}

function patchForCordova(content, relativePath) {
	let patched = content;

	if (relativePath === 'index.html') {
		patched = patched.replace(/href="\/logo\.png"/g, 'href="logo.png"');
	}

	if (relativePath.endsWith('.md') || relativePath.endsWith('.html')) {
		patched = patched.replace(/(["'(])\/template.docsify\//g, '$1');
	}

	return patched;
}

function copyEntry(source, target, relativePath) {
	const stat = fs.statSync(source);

	if (stat.isDirectory()) {
		fs.mkdirSync(target, { recursive: true });
		for (const child of fs.readdirSync(source)) {
			copyEntry(
				path.join(source, child),
				path.join(target, child),
				path.posix.join(relativePath, child)
			);
		}
		return;
	}

	fs.mkdirSync(path.dirname(target), { recursive: true });

	if (textExtensions.has(path.extname(source).toLowerCase())) {
		const content = fs.readFileSync(source, 'utf8');
		fs.writeFileSync(target, patchForCordova(content, relativePath), 'utf8');
		return;
	}

	fs.copyFileSync(source, target);
}

removeDirectoryContents(www);

for (const entry of includeEntries) {
	const source = path.join(root, entry);
	if (!fs.existsSync(source)) {
		continue;
	}

	copyEntry(source, path.join(www, entry), entry);
}

console.log(`Cordova www atualizado em ${www}`);
