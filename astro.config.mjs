// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { hiddenFromSitemap } from './src/lib/beta.ts';

/**
 * Wrap every Markdown <table> in a focusable scroll container so wide tables
 * (legal pages, D-019) scroll inside themselves instead of pushing the page
 * sideways, and copy each column header onto its body cells as `data-label`
 * so narrow phones (LegalPage.astro, ≤480px) can render rows as stacked cards.
 */
function rehypeScrollableTables() {
  /** @param {any} tree @param {{ path?: string }} file */
  return (tree, file) => {
    const vi = /[\\/]vi[\\/]/.test(file?.path ?? '');
    const ariaLabel = vi ? 'Bảng — vuốt ngang để xem đủ các cột' : 'Table — scroll sideways to see every column';
    wrapTables(tree, ariaLabel);
  };
}
/** @param {any} node @param {string} ariaLabel */
function wrapTables(node, ariaLabel) {
  if (!node.children) return;
  node.children = node.children.map((/** @type {any} */ child) => {
    if (child.type === 'element' && child.tagName === 'table') {
      labelCells(child);
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], tabIndex: 0, role: 'region', ariaLabel },
        children: [child],
      };
    }
    wrapTables(child, ariaLabel);
    return child;
  });
}

/** @param {any} node @param {string} tag @returns {any[]} */
const childEls = (node, tag) => (node.children ?? []).filter((/** @type {any} */ c) => c.type === 'element' && c.tagName === tag);
/** @param {any} node @returns {string} */
const hastText = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(hastText).join(''));
/** @param {any} table */
function labelCells(table) {
  const head = childEls(table, 'thead')[0];
  const headRow = head && childEls(head, 'tr')[0];
  if (!headRow) return;
  const labels = childEls(headRow, 'th').map((th) => hastText(th).trim());
  for (const body of childEls(table, 'tbody')) {
    for (const tr of childEls(body, 'tr')) {
      childEls(tr, 'td').forEach((td, i) => {
        if (labels[i]) td.properties = { ...td.properties, dataLabel: labels[i] };
      });
    }
  }
}

/**
 * ASCII heading ids for Markdown (Vietnamese diacritics stripped), so section
 * links read "#10-quyen-cua-ban-va-cua-con" instead of percent-encoded text.
 * Runs before Astro's own heading-id pass, which keeps ids that already exist.
 */
function rehypeAsciiHeadingIds() {
  /** @param {any} node @returns {string} */
  const text = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(text).join(''));
  /** @param {any} node @param {Set<string>} seen */
  const walk = (node, seen) => {
    for (const child of node.children ?? []) {
      if (child.type === 'element' && /^h[1-6]$/.test(child.tagName) && !child.properties?.id) {
        const base = text(child).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd')
          .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
        let id = base;
        for (let n = 1; seen.has(id); n++) id = `${base}-${n}`;
        seen.add(id);
        child.properties = { ...child.properties, id };
      }
      walk(child, seen);
    }
  };
  return (/** @type {any} */ tree) => walk(tree, new Set());
}

// https://astro.build/config
export default defineConfig({
  site: 'https://mathzle.com',
  output: 'static',
  markdown: {
    rehypePlugins: [rehypeAsciiHeadingIds, rehypeScrollableTables],
  },
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
