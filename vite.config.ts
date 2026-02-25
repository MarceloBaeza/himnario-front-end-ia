import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/** Proxy hacia el backend Himnario (desarrollo local).
 *  El target se lee de BACKEND_URL (variable de entorno de Node, sin prefijo VITE_,
 *  por lo que NO se expone al navegador). */
const backendProxy = {
  '/api/backend': {
    target: process.env['BACKEND_URL'] ?? 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/backend/, ''),
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: true,
    proxy: { ...backendProxy },
  },
  preview: {
    proxy: { ...backendProxy },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
