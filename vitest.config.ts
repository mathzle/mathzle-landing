import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    // Mirrors the define in astro.config.mjs (Task 6). Unit tests pass
    // `strict` explicitly where it matters.
    __STRICT_CLAIMS__: 'false',
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
