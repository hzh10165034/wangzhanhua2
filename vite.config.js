import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this repository below /huazuopin/.
  // Vite dev server stays at / for local preview.
  base: command === 'build' ? '/huazuopin/' : '/',
  build: {
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
}));
