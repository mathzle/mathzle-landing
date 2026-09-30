# Deploy Guide — mathzle-landing

Everything code-side is done. This file is the manual checklist for getting the site live on Cloudflare. The whole thing takes ~15 minutes if your Cloudflare account is already set up.

---

## 1. Build output and deploy target

This is a Cloudflare **Worker + static assets** build (via `@astrojs/cloudflare`), not a plain Cloudflare Pages static-file deploy. `pnpm build` produces:
- `dist/client` — static assets (HTML, CSS, JS, images)
- `dist/server` — the Worker entrypoint and a generated `wrangler.json` (redirected config; `wrangler.jsonc` at the repo root is the source config the adapter merges into it)

Deploy with **`wrangler deploy`** (Workers deploy), not `wrangler pages deploy`:

```bash
pnpm build
pnpm wrangler deploy
```

`wrangler` auto-detects and uses the generated `dist/server/wrangler.json` config over the root `wrangler.jsonc` when both exist (it prints "Using redirected Wrangler configuration").

First-time setup, in order:

1. **Cloudflare Dashboard** → Workers & Pages → **Create** → **Workers** (or run `pnpm wrangler deploy` from the CLI, which creates the Worker on first deploy if it doesn't exist).
2. Authorize the **`mathzle`** GitHub org for CI if you haven't already (see §6).
3. Set the environment variables from §"Env vars" below (Production AND Preview, or via `.env` for local builds).
4. Run `pnpm build && pnpm wrangler deploy` (see §2 for the KV namespace it needs first).

After it deploys, the site is live at the `*.workers.dev` URL Wrangler prints. Open it. Click around. The mascot should cheer, the worlds should glow, the CTAs should land on `app.mathzle.com` (which doesn't exist yet — they'll 404 until §5).

---

## Env vars

Set these wherever the build runs (local `.env`, Cloudflare dashboard, or GitHub Actions repo/environment variables — see `.env.example`):

| Variable | Purpose | Default if unset |
|---|---|---|
| `PUBLIC_APP_URL` | Where the "Start playing" CTAs point | `https://app.mathzle.com` |
| `PUBLIC_APP_URL_CONFIRMED` | Set to `1` once that URL actually serves the app (gates `pnpm launch:check`) | `0` (unconfirmed) |
| `PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics site token (see §4); when unset, the beacon script is omitted entirely | unset |

---

## 2. Create the KV namespace for signups (2 min)

The `/api/signup` endpoint needs a KV binding called `SIGNUPS`. On Workers the binding lives in **`wrangler.jsonc`** (committed), not in a dashboard setting — every `wrangler deploy` applies it.

```bash
cd ~/box/t3zle/mathzle-landing
pnpm wrangler login
pnpm wrangler kv namespace create SIGNUPS
```

Wrangler prints the new namespace `id`. Paste it into `wrangler.jsonc`, replacing the placeholder:

```jsonc
"kv_namespaces": [{ "binding": "SIGNUPS", "id": "<the id wrangler printed>" }]
```

Commit that change, then deploy (`pnpm build && pnpm wrangler deploy`, or push to `main`). `pnpm launch:check` fails while the id is still `REPLACE_WITH_KV_ID`.

### Verify the binding works
```bash
curl -X POST https://mathzle-landing.<your-subdomain>.workers.dev/api/signup \
  -H 'content-type: application/json' \
  -d '{"email":"smoke-test@example.com","locale":"en"}'
```
Expect: `{"ok":true}`. Then check the KV namespace in the dashboard (Workers & Pages → KV) — there should be a key `smoke-test@example.com`.

If you get `{"error":"unavailable"}` → the KV binding isn't wired. Re-check the id in `wrangler.jsonc` and redeploy.

---

## 3. Custom domain (3 min)

The domain attaches to the **Worker**, not to a Pages project.

1. Cloudflare Dashboard → **Workers & Pages** → the `mathzle-landing` Worker → **Settings** → **Domains & Routes** → **Add** → **Custom domain**
2. Enter `mathzle.com`. The zone must be on Cloudflare DNS; the DNS record and certificate are created automatically.
3. Add `www.mathzle.com` the same way, then create a redirect (Rules → Redirect Rules) from `www.mathzle.com/*` to `https://mathzle.com/$1` (301).
4. SSL/TLS is automatic (Cloudflare Universal SSL).

If `mathzle.com` is still attached to an old Pages project, remove it there first (Pages project → Custom domains → Remove) — a hostname can only point at one of them.

After DNS propagates (usually < 60 seconds), `https://mathzle.com` returns the landing page.

Verify:
```bash
curl -sI https://mathzle.com | head -5          # 200, the language-sniff page
curl -sI https://mathzle.com/en/ | head -5      # 200
```

---

## 4. Web Analytics token (1 min)

1. Cloudflare Dashboard → **Web Analytics** → **Add a site** → `mathzle.com`
2. Copy the site token (looks like `abc123def456...`)
3. Set `PUBLIC_CF_BEACON_TOKEN` to that token wherever the build runs — the GitHub Actions repo/environment variables (for CI builds) and/or your local `.env` (see §"Env vars"). No code change needed: `src/layouts/Base.astro` reads it from `src/data/site.ts` and only renders the beacon script when the token is set.
4. Trigger a build (push a commit, or re-run the `Deploy` workflow).
5. Visit the page. Within ~30 seconds the dashboard shows your visit.

---

## 5. Point the web app subdomain (when the web app is ready)

Every `Start playing` button on the landing page goes to **`https://app.mathzle.com`**. Until that subdomain serves the Flutter web app, those clicks 404.

When you're ready:
1. Build mathzle-ui for the web target: `cd ~/box/t3zle/mathzle-ui && flutter build web`
2. Deploy `build/web/` to Cloudflare Pages as a second project (`mathzle-app`).
3. Add custom domain `app.mathzle.com` to that project.
4. The landing page CTAs Just Work — no change required here.

If you want to change the URL (e.g., to `play.mathzle.com`):
- Set `PUBLIC_APP_URL` (build env var, see §"Env vars") to the new URL — every CTA reads it from `src/data/site.ts`, no code change needed.
- Once that URL actually serves the app, also set `PUBLIC_APP_URL_CONFIRMED=1` so `pnpm launch:check` passes.

---

## 6. GitHub Actions secrets (2 min)

The deploy workflow (`.github/workflows/deploy.yml`) is the **only** thing that should publish production. It runs `pnpm launch:check` and the strict `pnpm build:prod` before `wrangler deploy`, so a build with unverified claims or missing launch data can never go live. It needs these secrets in **`mathzle-landing` repo settings → Secrets and variables → Actions**:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → **Create Token** → use the **"Edit Cloudflare Workers"** template, scope to the `mathzle.com` zone |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar → "Account ID" |
| `LHCI_GITHUB_APP_TOKEN` | Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) on the repo (optional — without this, lighthouse runs but doesn't post a comment on PRs) |

**Disconnect any Cloudflare Git integration.** If this repo was ever connected to a Cloudflare **Pages** project (or to Workers Builds), that integration builds with plain `pnpm build` — no strict claims gate — and keeps publishing on every push. Remove it:

1. Workers & Pages → the old Pages project (e.g. `mathzle-landing`) → **Settings** → **Builds & deployments** → **Disconnect** the Git repository — or delete the Pages project entirely once `mathzle.com` points at the Worker (§3).
2. Workers & Pages → the `mathzle-landing` Worker → **Settings** → **Build** → make sure no Git repository is connected.

Do not keep both running.

---

## Launch checklist

Walk through this once before flipping `mathzle.com` from "showing the `*.workers.dev` URL" to "open for traffic."

### Performance & SEO
- [ ] Lighthouse from a VN edge: **Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95, Best Practices ≥ 90** on both `/en/` and `/vi/`
- [ ] `https://mathzle.com/sitemap-index.xml` returns valid XML listing both locales
- [ ] `https://mathzle.com/robots.txt` allows all and points to the sitemap
- [ ] View-source on `/en/` shows `<link rel="alternate" hreflang="vi">` pointing at `/vi/`, and vice versa
- [ ] Paste the page source into <https://validator.schema.org/> — `EducationalOrganization`, `WebApplication`, `FAQPage` all pass

### Functional
- [ ] **Web app handoff:** the "Start playing — free" CTA in the hero lands on the live Mathzle web app, not a 404
- [ ] `wrangler.jsonc` has the real `SIGNUPS` namespace id (§2) and the signup smoke test passes
- [ ] No Cloudflare Git integration (Pages or Workers Builds) is connected to this repo (§6)
- [ ] `pnpm launch:check` passes (site config, every claim verified, KV id set)
- [ ] FAQ accordion opens and closes; `/vi/faq/#faq-install` opens that answer
- [ ] Language switch toggles between `/en/` and `/vi/`
- [ ] All footer links resolve (not 404)

### Mobile
- [ ] Open on a real iPhone SE (320px viewport) — no horizontal scroll, all CTAs tappable without zoom
- [ ] Open on a real low-end Android (Moto G4-class) — hero loads in < 3s on 4G

### Content
- [ ] **Vietnamese copy:** a native speaker has reviewed `src/i18n/vi.json` and the prose pages (`about`, `privacy`, `terms`). Remove the `_note` field in `vi.json` afterwards
- [ ] **Testimonials:** `src/content/testimonials/{en,vi}.json` are empty by design (the section stays hidden). Only add real, attributable quotes you have written permission to use
- [ ] **Privacy + Terms:** a lawyer has reviewed the copy, especially the Decree 13 / COPPA section, and `site.legal` (company name, address, `policiesReviewedOn`) is filled in `src/data/site.ts`. The legal body text restates claims (no ads/chat/data sale, ages) by hand — check it still matches `src/data/claims.ts`
- [ ] **Pricing:** the `premium*` prices and `refundDays` in `src/data/claims.ts` are the real, verified numbers (`verifiedBy` set)

### Distribution
- [ ] **Open Graph preview** looks right when you paste `https://mathzle.com/en/` into Slack / Facebook / Twitter — image, title, description all render
- [ ] **OG images regenerated:** `public/og/{vi,en}.png` were generated before claim verification (P3 Task 22) — rerun `pnpm preview` + `pnpm og` afterward so the headline no longer carries the yellow unverified-claim highlight
- [ ] **Google Search Console** — both `https://mathzle.com/en/` and `https://mathzle.com/vi/` added as properties, ownership verified via DNS TXT, sitemap submitted
- [ ] **Bing Webmaster Tools** — same
- [ ] **First production deploy commit tagged:** `git tag v1.0.0 && git push --tags`

When all green, change DNS / announce / drink coffee.
