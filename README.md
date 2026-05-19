# Mathzle Landing Page

The public-facing marketing site for [Mathzle](https://mathzle.com) — math made for kids ages 6–11.

## Stack

- **[Astro 6](https://astro.build/)** — static-first, ships near-zero JS
- **[Tailwind v4](https://tailwindcss.com/)** — CSS-first config, design tokens via `@theme`
- **[Preact](https://preactjs.com/)** — for the two interactive islands (FAQ accordion, signup form)
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — edge deploy + Pages Functions for `/api/signup`

Design system mirrors [mathzle-ui's DESIGN.md](https://github.com/mathzle/mathzle-ui) — Fredoka + Be Vietnam Pro, sky-violet primary, world-color palette, pushable interaction.

## Development

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build
pnpm preview
pnpm wrangler pages dev dist   # Cloudflare runtime (Pages Functions work)

pnpm test         # vitest
pnpm test:e2e     # playwright
pnpm lhci:run     # lighthouse CI
```

## Structure

```
src/
├── components/     # Astro + Preact components
├── content/        # FAQ JSON per locale
├── i18n/           # EN + VI copy
├── layouts/        # Base.astro
├── pages/          # routes (en/, vi/, api/)
├── styles/         # global.css with design tokens
└── utils/          # i18n helpers
```

## Deployment

Auto-deploys to Cloudflare Pages on push to `main`. Branch previews on every PR. See [`docs/features/16-landing-page/`](https://github.com/mathzle/t3kid/tree/main/docs/features/16-landing-page) in the parent monorepo for the full spec.
