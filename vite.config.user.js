// vite.config.user.js — builds the SoulThread user app
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  root: '.',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'SoulThread',
        short_name: 'SoulThread',
        description: 'Share what you feel. Connect with people who understand.',
        theme_color: '#0d9488',
        icons: [{ src: 'logo.jpg', sizes: '512x512', type: 'image/jpeg' }]
      }
    })
  ],
  build: {
    outDir: 'dist-user',
    rollupOptions: {
      input: 'index-user.html',
    },
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    sourcemap: false,
  }
})
