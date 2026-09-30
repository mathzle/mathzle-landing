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
  adapter: cloudflare({
    imageService: 'compile',
    // Strict builds (STRICT_CLAIMS=1) must fail the process when a page throws
    // during prerender. The default workerd prerender environment swallows
    // per-page errors (logs them, still exits 0), so route strict builds
    // through the node prerender environment where errors propagate.
    ...(process.env.STRICT_CLAIMS === '1' ? { prerenderEnvironment: 'node' } : {}),
  }),
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
