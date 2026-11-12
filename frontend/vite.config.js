import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En desarrollo, Vite reenvía la API y Socket.IO al backend de Express (puerto 4000).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
