import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['firebase', 'firebase/app', 'firebase/storage'],
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Don't bundle Firebase - it's optional and may not be installed
        if (id.startsWith('firebase/')) {
          return false; // Let Vite handle it, but don't fail if missing
        }
        return false;
      },
    },
  },
})
