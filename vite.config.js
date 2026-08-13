import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    /* Библиотеки живут в отдельных чанках: правки по сайту не сбрасывают
       их кеш у вернувшихся посетителей — перекачивается только код сайта. */
    rollupOptions: {
      output: {
        /* Rolldown принимает manualChunks только функцией */
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react'
          }
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) {
            return 'vendor-motion'
          }
          if (id.includes('@supabase')) return 'vendor-supabase'
        },
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png', 'icon-192.png', 'apple-touch-icon.png', 'splash/*.webp'],
      manifest: {
        name: 'AlTeNo Dev — AI Веб-студия',
        short_name: 'AlTeNo Dev',
        description: 'AI веб-студия из Душанбе. Создаём сайты, приложения и дизайн с использованием AI.',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'ru',
        icons: [
          { src: '/icon-192.png',       sizes: '192x192', type: 'image/png' },
          { src: '/logo.png',           sizes: '512x512', type: 'image/png' },
          { src: '/logo.png',           sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        /* webp тоже в прекеш; m4a намеренно снаружи — 2 МБ не должны
           уезжать в кеш к тем, кто музыку так и не включил */
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        /* Воркер не должен подменять статику страницей: именно так HTML
           однажды осел в кеше под адресом скрипта и сайт перестал стартовать */
        navigateFallbackDenylist: [/^\/api\//, /^\/assets\//, /^\/apps\//, /^\/music\//, /^\/splash\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
