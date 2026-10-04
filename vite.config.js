import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { detectTier } from './src/lib/tierDetect.js';

// Inserta la detección de nivel en <head>: se ejecuta antes del primer pintado.
const tierDetect = () => ({
  name: 'tempo-tier-detect',
  transformIndexHtml(html) {
    return html.replace('<!--tier-detect-->', `<script>(${detectTier.toString()})();</script>`);
  },
});

export default defineConfig({
  plugins: [react(), tierDetect()],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1200,
  },
  server: { host: '127.0.0.1', port: 5173 },
  preview: { host: '127.0.0.1' },
});
