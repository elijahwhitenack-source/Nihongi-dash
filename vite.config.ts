import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages project site: https://elijahwhitenack-source.github.io/Nihongi-dash/
const BASE = '/Nihongi-dash/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      // autoUpdate + clientsClaim/skipWaiting so the new build cleanly
      // replaces the old single-file service worker at this same scope.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{js,css,html,svg,woff2,png}'],
      },
      manifest: {
        name: 'Nihongo Dash',
        short_name: 'Nihongo',
        description: 'Personal Japanese study — kana, vocab, grammar, kanji toward JLPT N3',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#12121a',
        theme_color: '#12121a',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
  build: {
    target: 'es2021',
    sourcemap: false,
  },
});
