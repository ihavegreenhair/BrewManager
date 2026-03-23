import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/rapt-auth': {
        target: 'https://id.rapt.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rapt-auth/, '/connect/token')
      },
      '/rapt-api': {
        target: 'https://api.rapt.io/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/rapt-api/, '')
      }
    }
  }
})
