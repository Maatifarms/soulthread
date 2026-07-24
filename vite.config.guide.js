// vite.config.guide.js — builds the SoulThread Pro guide app
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: 'dist-guide',
    rollupOptions: {
      input: 'index-guide.html',
    },
    minify: 'terser',
    terserOptions: { compress: { drop_console: true, drop_debugger: true } },
    sourcemap: false,
  }
})
