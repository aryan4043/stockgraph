import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    optimizeDeps: {
        exclude: ['react-force-graph-3d', 'three-forcegraph']
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-3d': ['three', 'react-force-graph-3d', 'three-forcegraph']
                }
            }
        }
    },
    define: {
        global: 'window',
    },
})
