import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Babel fast-refresh only on dev; no extra transforms in production
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [] : []
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.jpg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'SoulThread',
        short_name: 'SoulThread',
        description: 'Anonymous Emotional Support & Safe Space',
        theme_color: '#9fc5c1',
        icons: [
          {
            src: 'logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        // Cache assets from external domains (fonts, avatars)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'dicebear-avatars-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // <== 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],

  build: {
    // Terser for maximum compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info', 'console.debug'],
        passes: 3,              // Three compression passes for smallest output
        unsafe_arrows: true,
        unsafe_methods: true,
        toplevel: false,
      },
      mangle: {
        toplevel: false,
        safari10: false,        // No need to support Safari 10
      },
      format: { comments: false },  // Strip all comments
    },

    // CSS code-split so only the CSS for the current route is loaded
    cssCodeSplit: true,
    cssMinify: true,  // esbuild CSS minification — fast and always available

    // Granular manual chunks — browser caches unchanged vendor chunks across deploys
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // ── Firebase — split by service (each is ~60–200kb) ───────────
          if (id.includes('/firebase/auth')) return 'vendor-firebase-auth';
          if (id.includes('/firebase/firestore')) return 'vendor-firebase-firestore';
          if (id.includes('/firebase/storage')) return 'vendor-firebase-storage';
          if (id.includes('/firebase/functions')) return 'vendor-firebase-functions';
          if (id.includes('/firebase/app-check')) return 'vendor-firebase-appcheck';
          if (id.includes('/firebase/messaging')) return 'vendor-firebase-messaging';
          if (id.includes('firebase')) return 'vendor-firebase-core';

          // ── Core Bundle (Global Consolidation) ────────────────────────
          // To definitively resolve circular dependencies between React, 
          // React-Router, Framer Motion, and other standard UI libs, 
          // we consolidate them into one single vendor bundle.
          return 'vendor-core-all';
        },
        // Deterministic filenames — CDN/browser can cache by hash
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop();
          if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) return 'assets/fonts/[name]-[hash].[ext]';
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext)) return 'assets/images/[name]-[hash].[ext]';
          if (ext === 'css') return 'assets/css/[name]-[hash].[ext]';
          return 'assets/[ext]/[name]-[hash].[ext]';
        },
      },
    },

    // Allow large firebase chunks; suppress noise
    chunkSizeWarningLimit: 1000,

    // No source maps in production
    sourcemap: false,

    // Inline small assets (<8kb) as base64 to save HTTP requests
    assetsInlineLimit: 8192,

    // Target modern browsers — no legacy polyfills needed
    target: ['es2020', 'chrome90', 'firefox88', 'safari14'],

    // Module preloading for instant chunk resolution
    modulePreload: { polyfill: false },

    // Report final compressed sizes
    reportCompressedSize: true,
  },

  // Pre-bundle Firebase modules to prevent duplicate code across chunks
  optimizeDeps: {
    include: [
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'firebase/functions',
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      'firebase/app-check',  // Lazy-loaded after first paint
      'firebase/messaging',  // Lazy-loaded on demand
    ],
  },

  // Dev server
  server: {
    port: 5173,
    strictPort: false,
    // HMR overlay is useful in dev
    hmr: { overlay: true },
  },
  preview: {
    port: 4173,
  },
})
