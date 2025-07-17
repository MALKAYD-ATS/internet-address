import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
      base: '/', // ✅ Required for GitHub Pages
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist'],
  },
  define: {
    global: 'globalThis',
  },
  worker: {
    format: 'es'
  },
});
