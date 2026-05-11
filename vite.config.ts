import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';

const vendors = {
  'vendor-react': /\/(react|react-dom|react-router)\//i,
  'vendor-redux': /\/(@reduxjs|react-redux|redux-persist)\//i,
  // antd and all @ant-design/* packages (cssinjs, icons, colors) must share one chunk --
  // they cross-import antd internals and splitting them creates circular dependencies.
  'vendor-antd': /\/(antd)\//i,
};

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  esbuild: {
    legalComments: 'none',
    drop: ['console', 'debugger'],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
  resolve: {
    alias: {
      lodash: 'lodash-es',
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: 'hidden',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      // monaco-editor is loaded from CDN at runtime -- exclude from bundle
      external: ['monaco-editor'],
      output: {
        // Rename index-[hash].js chunks to their parent directory name for readability
        chunkFileNames(chunkInfo) {
          if (chunkInfo.name === 'index' && chunkInfo.facadeModuleId) {
            const match = chunkInfo.facadeModuleId.match(
              /\/([^/]+)\/index\.[tj]sx?$/
            );
            if (match) return `assets/${match[1]}-[hash].js`;
          }
          return 'assets/[name]-[hash].js';
        },
        manualChunks(id) {
          if (!id.includes('/node_modules/')) return;
          for (const [name, pattern] of Object.entries(vendors)) {
            if (pattern.test(id)) return name;
          }
        },
      },
    },
  },
  plugins: [
    react(),
    tsconfigPaths(),
    analyzer({
      enabled: process.argv.includes('--analyze'),
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'lncrawl.svg',
        'icons/icon-192.png',
        'icons/icon-512.png',
      ],
      manifest: {
        name: 'Lightnovel Crawler',
        short_name: 'LNCrawl',
        description: 'Download novels from online sources and generate e-books',
        theme_color: '#009587',
        background_color: '#1c1c1c',
        display: 'standalone',
        categories: ['reader', 'novel', 'ebook', 'lightnovel'],
        icons: [
          {
            src: '/lncrawl.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/api/, /^\/static/, /^\/docs/],
      },
    }),
  ],
});
