# Deploy Guide — mathzle-landing

Everything code-side is done. This file is the manual checklist for getting the site live on Cloudflare Pages. The whole thing takes ~15 minutes if your Cloudflare account is already set up.

---

## 1. Create the Cloudflare Pages project (5 min)

1. **Cloudflare Dashboard** → Workers & Pages → **Create** → **Pages** → **Connect to Git**
2. Authorize the **`mathzle`** GitHub org if you haven't already.
3. Select **`mathzle/mathzle-landing`**.
4. **Set up builds and deployments:**
   - Project name: `mathzle-landing`
   - Production branch: `main`
   - Framework preset: **Astro**
   - Build command: `pnpm build`
   - Build output directory: `dist`
   - Root directory: `/`
5. **Environment variables (Production AND Preview):**
   - `NODE_VERSION` = `20`
   - `PNPM_VERSION` = `10`
6. Click **Save and Deploy.** First build takes ~2 minutes.

After it deploys, the site is live at **`https://mathzle-landing.pages.dev/`**. Open it. Click around. The mascot should cheer, the worlds should glow, the CTAs should land on `app.mathzle.com` (which doesn't exist yet — they'll 404 until §5).

---

## 2. Create the KV namespace for signups (2 min)

The `/api/signup` endpoint needs a KV binding called `SIGNUPS`. Two equivalent paths:

### Option A — via the dashboard (recommended)
1. Cloudflare Dashboard → **Workers & Pages** → **KV** → **Create a namespace**
2. Name: `mathzle-landing-SIGNUPS`
3. Back in your Pages project → **Settings** → **Functions** → **KV namespace bindings** → **Add binding**
4. Variable name: `SIGNUPS`
5. KV namespace: pick the one you just created
6. **Save**. Trigger a new deploy (Settings → Deployments → Retry production deployment) so the binding takes effect.

### Option B — via Wrangler CLI
```bash
cd ~/box/t3zle/mathzle-landing
pnpm wrangler login
pnpm wrangler kv namespace create SIGNUPS --preview false
```
Then bind it through the dashboard as in Option A — there's no CLI for Pages bindings yet.

### Verify the binding works
```bash
curl -X POST https://mathzle-landing.pages.dev/api/signup \
  -H 'content-type: application/json' \
  -d '{"email":"smoke-test@example.com","locale":"en"}'
```
Expect: `{"ok":true}`. Then check the KV namespace in the dashboard — there should be a key `smoke-test@example.com`.

If you get `{"error":"unavailable"}` → the KV binding isn't wired. Re-check step 3.

---

## 3. Custom domain (3 min)

1. Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `mathzle.com`. If the zone is on Cloudflare DNS, the records are auto-configured.
3. Add `www.mathzle.com` too — Cloudflare auto-creates a redirect from `www` to apex.
4. SSL/TLS is automatic (Cloudflare Universal SSL).

After DNS propagates (usually < 60 seconds), `https://mathzle.com` returns the landing page.

Verify:
```bash
curl -sI https://mathzle.com | head -5
curl -sI https://mathzle.com/en/ | head -5
```

---

## 4. Web Analytics token (1 min)

1. Cloudflare Dashboard → **Web Analytics** → **Add a site** → `mathzle.com`
2. Copy the site token (looks like `abc123def456...`)
3. In `src/layouts/Base.astro`, uncomment the analytics line and paste the token:
   ```html
   <script defer src="https://static.cloudflareinsights.com/beacon.min.js"
     data-cf-beacon='{"token":"PASTE-YOUR-TOKEN-HERE"}'></script>
   ```
4. Commit and push:
   ```bash
   git add src/layouts/Base.astro
   git commit -m "chore: wire Cloudflare Web Analytics token"
   git push
   ```
5. Wait for the auto-deploy. Visit the page. Within ~30 seconds the dashboard shows your visit.

---

## 5. Point the web app subdomain (when the web app is ready)

Every `Start playing` button on the landing page goes to **`https://app.mathzle.com`**. Until that subdomain serves the Flutter web app, those clicks 404.

When you're ready:
1. Build mathzle-ui for the web target: `cd ~/box/t3zle/mathzle-ui && flutter build web`
2. Deploy `build/web/` to Cloudflare Pages as a second project (`mathzle-app`).
3. Add custom domain `app.mathzle.com` to that project.
4. The landing page CTAs Just Work — no change required here.

If you want to change the URL (e.g., to `play.mathzle.com`):
- Find: `'https://app.mathzle.com'` in `src/components/sections/Hero.astro`, `Pricing.astro`, `Nav.astro`, `SEO.astro`
- Replace with the new URL, commit, push

---

## 6. GitHub Actions secrets (2 min)

The deploy workflow (`.github/workflows/deploy.yml`) needs three secrets in **`mathzle-landing` repo settings → Secrets and variables → Actions**:

| Secret | Where to get it |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → **Create Token** → use the **"Edit Cloudflare Workers"** template, scope to the `mathzle.com` zone |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar → "Account ID" |
| `LHCI_GITHUB_APP_TOKEN` | Install the [Lighthouse CI GitHub App](https://github.com/apps/lighthouse-ci) on the repo (optional — without this, lighthouse runs but doesn't post a comment on PRs) |

After adding the first two, push any commit and `.github/workflows/deploy.yml` will deploy from CI instead of Cloudflare's Git integration. You can keep both running or disable Cloudflare's auto-deploy if you prefer the GitHub-side history.

---

## Launch checklist

Walk through this once before flipping `mathzle.com` from "showing the Pages dev URL" to "open for traffic."

### Performance & SEO
- [ ] Lighthouse from a VN edge: **Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95, Best Practices ≥ 90** on both `/en/` and `/vi/`
- [ ] `https://mathzle.com/sitemap-index.xml` returns valid XML listing both locales
- [ ] `https://mathzle.com/robots.txt` allows all and points to the sitemap
- [ ] View-source on `/en/` shows `<link rel="alternate" hreflang="vi">` pointing at `/vi/`, and vice versa
- [ ] Paste the page source into <https://validator.schema.org/> — `EducationalOrganization`, `WebApplication`, `FAQPage` all pass

### Functional
- [ ] **Web app handoff:** the "Start playing — free" CTA in the hero lands on the live Mathzle web app, not a 404
- [ ] Signup form actually writes to KV (smoke test in §2 passes)
- [ ] FAQ accordion opens and closes on first item
- [ ] Language switch toggles between `/en/` and `/vi/`
- [ ] All footer links resolve (not 404)

### Mobile
- [ ] Open on a real iPhone SE (320px viewport) — no horizontal scroll, all CTAs tappable without zoom
- [ ] Open on a real low-end Android (Moto G4-class) — hero loads in < 3s on 4G

### Content
- [ ] **Vietnamese copy:** a native speaker has reviewed `src/i18n/vi.json` and the prose pages (`about`, `privacy`, `terms`). The `_note` field in `vi.json` and the `TODO(legal)` markers must be cleared
- [ ] **Testimonials:** the 3 placeholder quotes in `en.json` and `vi.json` are real, attributable, and you have permission to use them
- [ ] **Privacy + Terms:** a lawyer has reviewed the placeholder copy, especially the Decree 13 / COPPA section
- [ ] **Pricing:** real numbers in place of `$4.99/mo` / `119k/tháng` (or remove `premiumNote` when billing is live)

### Distribution
- [ ] **Open Graph preview** looks right when you paste `https://mathzle.com/en/` into Slack / Facebook / Twitter — image, title, description all render
- [ ] **Google Search Console** — both `https://mathzle.com/en/` and `https://mathzle.com/vi/` added as properties, ownership verified via DNS TXT, sitemap submitted
- [ ] **Bing Webmaster Tools** — same
- [ ] **First production deploy commit tagged:** `git tag v1.0.0 && git push --tags`

When all green, change DNS / announce / drink coffee.
