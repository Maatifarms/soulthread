import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Terser for maximum compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,              // two compression passes for smaller output
      },
      mangle: { toplevel: false },
      format: { comments: false },  // strip all comments from output
    },

    // CSS is already split by route-level code splitting
    cssCodeSplit: true,
    cssMinify: true,

    // Aggressive chunk splitting so the browser can cache granularly
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // ── Firebase Core & Services ────────────────────────
          // Split heavy services (auth, firestore) but keep core together
          if (id.includes('firebase/auth')) return 'vendor-firebase-auth';
          if (id.includes('firebase/firestore')) return 'vendor-firebase-firestore';
          if (id.includes('firebase/storage')) return 'vendor-firebase-storage';
          if (id.includes('firebase')) return 'vendor-firebase-core';

          // ── Third-party Libraries & Framework ──────────────────────
          if (id.includes('react') || id.includes('framer-motion')) return 'vendor-framework';
          if (id.includes('capacitor')) return 'vendor-capacitor';
          return 'vendor-libs';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },

    // Raise warning limit (firebase chunks are expected to be large)
    chunkSizeWarningLimit: 800,

    // No source maps in production – smaller deploy
    sourcemap: false,

    // Inline very small assets
    assetsInlineLimit: 4096,

    // Target modern browsers only (no legacy polyfills = smaller bundles)
    target: ['es2020', 'chrome90', 'firefox88', 'safari14'],
  },

  // Dev server
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
  },
})
