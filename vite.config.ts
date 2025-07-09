import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['pdfjs-dist', 'pdfjs-dist/build/pdf.worker.js'],
  },
  define: {
    global: 'globalThis',
  },
  assetsInclude: ['**/*.worker.js'],
});
