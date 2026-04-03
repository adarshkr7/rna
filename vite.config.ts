import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    open: true,
    port: 5173,
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
  },
});
