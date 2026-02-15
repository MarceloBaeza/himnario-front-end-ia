import { createServer } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function proxyToDrive(req, res, url) {
  const targetPath = url.pathname.replace('/api/drive', '/drive/v3/files');
  const targetUrl = new URL(`https://www.googleapis.com${targetPath}${url.search}`);

  const proxyReq = httpsRequest(
    targetUrl,
    { method: req.method, headers: { 'Accept': 'application/json' } },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      });
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error');
  });

  req.pipe(proxyReq);
}

async function serveStatic(res, url) {
  const filePath = join(DIST, url.pathname);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // SPA fallback: cualquier ruta desconocida devuelve index.html
    const html = await readFile(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname.startsWith('/api/drive')) {
    proxyToDrive(req, res, url);
    return;
  }

  serveStatic(res, url);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Himnario server running on http://0.0.0.0:${PORT}`);
});
