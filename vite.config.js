import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  plugins: [react()],
  // Cloudflare Pages and the wangzhanhua2.pages.dev domain are served at root.
  // GitHub Pages can override this with VITE_BASE_PATH in its workflow.
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
}));
