// Fails when built HTML still contains raw copy syntax ({claim:…}, {if:…},
// {/if}) — i.e. an i18n string reached the page without copy()/copyText().
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist/client';
const RAW = /\{claim:[^}]*\}|\{if:[^}]*\}|\{\/if\}/g;

function* htmlFiles(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith('.html')) yield p;
  }
}

let bad = 0;
let count = 0;
for (const file of htmlFiles(root)) {
  count++;
  const hits = [...new Set(readFileSync(file, 'utf8').match(RAW) ?? [])];
  if (hits.length) {
    bad++;
    console.error(`${relative(root, file)}: ${hits.join(', ')}`);
  }
}
console.log(`${count} HTML files checked, ${bad} with raw copy syntax`);
if (count === 0 || bad > 0) process.exit(1);
