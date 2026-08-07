import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@frontend': path.resolve(import.meta.dirname, './src'),
      'frontend': path.resolve(import.meta.dirname, './src'),
      '@shared': path.resolve(import.meta.dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: { 'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || 'dev') },
  logLevel: 'info',
});
