import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const driveProxy = {
  '/api/drive': {
    target: 'https://www.googleapis.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/drive/, '/drive/v3/files'),
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
    proxy: driveProxy,
  },
  preview: {
    proxy: driveProxy,
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
