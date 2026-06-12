const fs = require('fs');
const https = require('https');
const path = require('path');

const root = path.resolve(__dirname, '..');
const modules = path.join(root, 'node_modules');
const vendor = path.join(root, 'vendor');

function ensureDirectory(directory) {
	fs.mkdirSync(directory, { recursive: true });
}

function cleanDirectory(directory) {
	fs.rmSync(directory, { recursive: true, force: true });
	ensureDirectory(directory);
}

function copyFile(source, target) {
	ensureDirectory(path.dirname(target));
	fs.copyFileSync(source, target);
}

function copyDirectory(source, target) {
	ensureDirectory(target);

	for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
		const sourcePath = path.join(source, entry.name);
		const targetPath = path.join(target, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(sourcePath, targetPath);
			continue;
		}

		copyFile(sourcePath, targetPath);
	}
}

function download(url, target) {
	ensureDirectory(path.dirname(target));

	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			if ([301, 302, 303, 307, 308].includes(response.statusCode)) {
				response.resume();
				download(response.headers.location, target).then(resolve, reject);
				return;
			}

			if (response.statusCode !== 200) {
				response.resume();
				reject(new Error(`Falha ao baixar ${url}: HTTP ${response.statusCode}`));
				return;
			}

			const file = fs.createWriteStream(target);
			response.pipe(file);
			file.on('finish', () => file.close(resolve));
			file.on('error', reject);
		}).on('error', reject);
	});
}

function modulePath(...parts) {
	return path.join(modules, ...parts);
}

async function main() {
	cleanDirectory(vendor);

	copyFile(modulePath('docsify', 'lib', 'docsify.min.js'), path.join(vendor, 'docsify', 'docsify.min.js'));
	copyFile(modulePath('docsify', 'lib', 'plugins', 'zoom-image.min.js'), path.join(vendor, 'docsify', 'plugins', 'zoom-image.min.js'));
	copyFile(modulePath('docsify', 'lib', 'plugins', 'search.js'), path.join(vendor, 'docsify', 'plugins', 'search.js'));
	copyFile(modulePath('docsify-copy-code', 'dist', 'docsify-copy-code.min.js'), path.join(vendor, 'docsify-copy-code', 'docsify-copy-code.min.js'));
	copyFile(modulePath('docsify-latex', 'dist', 'docsify-latex.min.js'), path.join(vendor, 'docsify-latex', 'docsify-latex.min.js'));
	copyFile(modulePath('docsify-mermaid', 'dist', 'docsify-mermaid.js'), path.join(vendor, 'docsify-mermaid', 'docsify-mermaid.js'));

	copyDirectory(modulePath('prismjs', 'components'), path.join(vendor, 'prismjs', 'components'));

	copyFile(modulePath('katex', 'dist', 'katex.min.js'), path.join(vendor, 'katex', 'katex.min.js'));
	copyFile(modulePath('katex', 'dist', 'katex.min.css'), path.join(vendor, 'katex', 'katex.min.css'));
	copyDirectory(modulePath('katex', 'dist', 'fonts'), path.join(vendor, 'katex', 'fonts'));

	copyDirectory(modulePath('mermaid', 'dist'), path.join(vendor, 'mermaid'));

	copyFile(modulePath('@fortawesome', 'fontawesome-free', 'css', 'all.min.css'), path.join(vendor, 'fontawesome', 'css', 'all.min.css'));
	copyDirectory(modulePath('@fortawesome', 'fontawesome-free', 'webfonts'), path.join(vendor, 'fontawesome', 'webfonts'));

	await download(
		'https://cdn.jsdelivr.net/gh/A5yncX/docsify-theme-darcula@v1.0/darcula.css',
		path.join(vendor, 'docsify-theme-darcula', 'darcula.css')
	);

	console.log(`Dependencias locais atualizadas em ${vendor}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exit(1);
});
