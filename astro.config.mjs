// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { hiddenFromSitemap } from './src/lib/beta.ts';

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
    sitemap({
      // Public locale pages only: no internal kit, OG renderers, or the root
      // language-sniff stub (`/` just forwards to /vi/ or /en/). The pricing
      // pages are redirects while pricing isn't public (D-017).
      filter: (page) => {
        const path = new URL(page).pathname;
        return path !== '/' && !/\/(kit|og)\//.test(path + '/') && !hiddenFromSitemap(path);
      },
    }),
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
