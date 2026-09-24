import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api/copilot': {
            target: 'http://172.208.104.111:7002',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/copilot/, ''),
            timeout: 60000
          }
        }
      },
      plugins: [react()],
      build: {
        outDir: 'dist',
        sourcemap: false,
        chunkSizeWarningLimit: 2000,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('recharts')) return 'vendor-recharts';
                if (id.includes('xlsx')) return 'vendor-xlsx';
                if (id.includes('jspdf') || id.includes('docx')) return 'vendor-docs';
                return 'vendor';
              }
            }
          }
        }
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
