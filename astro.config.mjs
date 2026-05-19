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
  adapter: cloudflare({ mode: 'directory' }),
  integrations: [sitemap(), preact()],
  vite: {
    plugins: [tailwindcss()],
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
