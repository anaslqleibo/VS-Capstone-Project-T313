// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Fix for React Router to support /dashboard etc.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // 👇 This line allows client-side routing to work
  base: '/',
  define: {
    'process.env': {}
  }
})
