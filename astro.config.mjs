// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://mathzle.com',
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  integrations: [
    sitemap({ filter: (page) => !/\/(kit|og)\//.test(new URL(page).pathname + '/') }),
    preact(),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      __STRICT_CLAIMS__: JSON.stringify(process.env.STRICT_CLAIMS === '1'),
    },
  },
  i18n: {
    locales: ['en', 'vi'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
