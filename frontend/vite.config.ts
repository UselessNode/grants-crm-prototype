import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@frontend': path.resolve(__dirname, './src'),
      'frontend': path.resolve(__dirname, './src'), // Fix for 'frontend/' imports
      '@shared': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
