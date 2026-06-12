const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..', 'www');
const port = Number(process.env.PORT || 8080);

const contentTypes = {
	'.css': 'text/css; charset=utf-8',
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.md': 'text/markdown; charset=utf-8',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
	'.xml': 'application/xml; charset=utf-8',
};

function sendFile(response, filePath) {
	fs.readFile(filePath, (error, data) => {
		if (error) {
			response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
			response.end('Arquivo nao encontrado.');
			return;
		}

		const extension = path.extname(filePath).toLowerCase();
		response.writeHead(200, {
			'Content-Type': contentTypes[extension] || 'application/octet-stream',
		});
		response.end(data);
	});
}

const server = http.createServer((request, response) => {
	const urlPath = decodeURIComponent((request.url || '/').split('?')[0]);
	const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
	const filePath = path.resolve(root, relativePath);

	if (!filePath.startsWith(root)) {
		response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
		response.end('Acesso negado.');
		return;
	}

	sendFile(response, filePath);
});

server.listen(port, '127.0.0.1', () => {
	console.log(`Servidor de teste: http://127.0.0.1:${port}/`);
});
