import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // Pure client-side app: all image processing happens in the browser.
  ssr: false,

  devtools: { enabled: false },

  css: [
    '@fontsource/anton/400.css',
    '@fontsource/inter/400.css',
    '@fontsource/inter/500.css',
    '@fontsource/inter/600.css',
    '@fontsource/inter/700.css',
    '~/assets/css/main.css',
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      title: 'Generator Kartu Gol',
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Buat kartu pengumuman gol siap unduh untuk media sosial dalam format vertikal (9:16) dan persegi (1:1).',
        },
        { name: 'theme-color', content: '#05070d' },
      ],
    },
  },
})
