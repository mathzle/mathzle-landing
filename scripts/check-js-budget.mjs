// Fails when the gzipped JS shipped to the browser exceeds the budget (spec 36 §8).
import { readdirSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const BUDGET = 25 * 1024;
const dir = 'dist/client/_astro';
const files = readdirSync(dir).filter((f) => f.endsWith('.js'));
const sizes = files.map((f) => [f, gzipSync(readFileSync(join(dir, f))).length]);
const total = sizes.reduce((n, [, s]) => n + s, 0);
for (const [f, s] of sizes.sort((a, b) => b[1] - a[1])) console.log(`${(s / 1024).toFixed(1).padStart(6)} KB  ${f}`);
console.log(`total ${(total / 1024).toFixed(1)} KB gzip (budget ${BUDGET / 1024} KB)`);
if (total > BUDGET) process.exit(1);
