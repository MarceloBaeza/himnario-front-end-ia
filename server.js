/**
 * Servidor de producción para Himnario.
 *
 * - Sirve los archivos estáticos del build (dist/)
 * - Hace proxy de /api/backend/* al backend configurado en BACKEND_URL
 * - SPA fallback: cualquier ruta desconocida devuelve index.html
 *
 * Variables de entorno:
 *   PORT         Puerto en que escucha este servidor (default: 3000)
 *   BACKEND_URL  URL del backend, ej. http://localhost:8080 (default: http://localhost:8080)
 */

import { createServer } from 'node:http';
import { request as makeRequest } from 'node:http';
import { request as makeRequestHttps } from 'node:https';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(__dirname, 'dist');
const PORT = process.env['PORT'] ?? 3000;
const BACKEND_URL = process.env['BACKEND_URL'] ?? 'http://localhost:8080';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

/** Redirige /api/backend/* al backend configurado en BACKEND_URL. */
function proxyToBackend(req, res, pathname, search) {
  const targetPath = pathname.replace('/api/backend', '') || '/';
  const backendUrl = new URL(`${BACKEND_URL}${targetPath}${search}`);
  const isHttps = backendUrl.protocol === 'https:';
  const requester = isHttps ? makeRequestHttps : makeRequest;

  const options = {
    hostname: backendUrl.hostname,
    port: backendUrl.port || (isHttps ? 443 : 80),
    path: `${backendUrl.pathname}${backendUrl.search}`,
    method: req.method,
    headers: { ...req.headers, host: backendUrl.host },
  };

  const proxyReq = requester(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Error al conectar con el backend.');
  });

  req.pipe(proxyReq);
}

/** Sirve un archivo estático del build o devuelve index.html como SPA fallback. */
async function serveStatic(res, pathname) {
  const filePath = join(DIST, pathname);

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] ?? 'application/octet-stream' });
    res.end(data);
  } catch {
    // Cualquier ruta no encontrada devuelve index.html (SPA)
    const html = await readFile(join(DIST, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname.startsWith('/api/backend')) {
    proxyToBackend(req, res, url.pathname, url.search);
    return;
  }

  serveStatic(res, url.pathname);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Himnario server running on http://0.0.0.0:${PORT}`);
  console.log(`Backend proxy → ${BACKEND_URL}`);
});
