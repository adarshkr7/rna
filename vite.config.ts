import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  server: {
    open: true,
    port: 5173,
  },
  build: {
    // Multi-page: projects.html needs an explicit input or Vite only emits index.
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        projects: resolve(__dirname, 'projects.html'),
      },
    },
    target: 'ES2020',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
  },
});
