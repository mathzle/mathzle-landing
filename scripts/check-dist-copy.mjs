// Fails when built HTML still contains raw copy syntax ({claim:…}, {if:…},
// {/if}) — i.e. an i18n string reached the page without copy()/copyText().
// While `site.pricing.public` is false (beta, D-017/D-020) it also fails when
// the visible text of any public page names Premium, a price, a currency or
// billing cadence, or a launch reward.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist/client';
const RAW = /\{claim:[^}]*\}|\{if:[^}]*\}|\{\/if\}/g;
// Keep in sync with BETA_LEAK in tests/e2e/beta-pricing.spec.ts.
const BETA_LEAK = /premium|119|990\.000|4\.99|₫|\/tháng|\/năm|per month|per year|khi mở bán|at launch/gi;
// Read the flag from source with a regex: site.ts uses import.meta.env, so
// importing it in plain Node isn't worth the ceremony.
const siteSrc = readFileSync(new URL('../src/data/site.ts', import.meta.url), 'utf8');
const flag = siteSrc.match(/pricing:\s*\{\s*public:\s*(true|false)\s*\}/);
if (!flag) {
  console.error('check-dist-copy: could not find `pricing: { public: … }` in src/data/site.ts');
  process.exit(1);
}
const pricingPublic = flag[1] === 'true';
// Internal pages that never ship to users (component kit, OG image renderers).
const INTERNAL = /^(kit|og)[\\/]/;

/** Visible text of an HTML document: no <style>/<script>/comments/tags. */
function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(style|script|noscript|template)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');
}

function* htmlFiles(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

let bad = 0;
let leaks = 0;
let count = 0;
for (const file of htmlFiles(root)) {
  count++;
  const rel = relative(root, file);
  const html = readFileSync(file, 'utf8');
  const hits = [...new Set(html.match(RAW) ?? [])];
  if (hits.length) {
    bad++;
    console.error(`${rel}: ${hits.join(', ')}`);
  }
  if (!pricingPublic && !INTERNAL.test(rel)) {
    const text = visibleText(html);
    const found = [...new Set([...text.matchAll(BETA_LEAK)].map((m) => {
      const i = m.index ?? 0;
      return `"${m[0]}" …${text.slice(Math.max(0, i - 40), i + m[0].length + 40).trim()}…`;
    }))];
    if (found.length) {
      leaks++;
      console.error(`${rel}: beta pricing/Premium leak:\n  ${found.join('\n  ')}`);
    }
  }
}
console.log(`${count} HTML files checked, ${bad} with raw copy syntax` +
  (pricingPublic ? '' : `, ${leaks} leaking pricing/Premium copy (pricing not public)`));
if (count === 0 || bad > 0 || leaks > 0) process.exit(1);
