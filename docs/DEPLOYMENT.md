# Deployment

Step-by-step runbook for shipping CardinalXchange to production. Read this once end-to-end, then work through it linearly. Do not skip steps even if they look small.

`SETUP.md` covers local development. This file covers everything **after** local works.

## Critical path (~3-4 hours of human time + 1-2 weeks of waiting on Stanford IT)

```
┌─────────────────────────────────────────────────────────────────┐
│  1. Email Stanford IT  ─────────────► (waits days/weeks)         │
│                                                                  │
│  2. Domain registration  ──────────► (~10 min, instant)          │
│                                                                  │
│  3. Supabase project  ──────────► (~15 min, instant)             │
│                                                                  │
│  4. Email transport account  ──────► (~10 min, instant)          │
│                                                                  │
│  5. Vercel project + env vars  ────► (~30 min)                   │
│                                                                  │
│  6. First deploy + smoke test  ────► (~30 min)                   │
│                                                                  │
│  7. Wait for Stanford IT  ──────────────────────────────────────┐│
│                                                                 ││
│  8. Add SAML config + redeploy  ────► (~10 min)  ◄──────────────┘│
│                                                                  │
│  9. Branch protection  ─────────► (~5 min)                       │
└─────────────────────────────────────────────────────────────────┘
```

Steps 1-6 can ship in a single afternoon. SAML SSO arrives later — until then, magic-link login works in production.

---

## Pre-flight check (do this before anything else)

```bash
# All green locally?
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# CI green on main?
gh run list --limit 1
# Expected: completed | success

# All commits pushed?
git status                          # should say "nothing to commit, working tree clean"
git log origin/main..HEAD --oneline # should be empty
```

If anything is red, fix locally first. Don't deploy red code.

---

## Step 1 — Email Stanford UIT (do this FIRST, it has the longest lead time)

**Why first:** Stanford IT response time is days to weeks. Start the clock immediately so the SAML metadata arrives before you actually need it.

**Who to email:** `uit-help@stanford.edu` (or via `uit.stanford.edu/service/saas`)

**What to ask:**

> Subject: SAML SP registration request — CardinalXchange (Stanford-affiliated student project)
>
> Hi UIT,
>
> CardinalXchange is a student-built Stanford-only Q&A platform (CS 278 project, [team names]). We'd like to register as a SAML Service Provider so users can sign in with their SUNet ID.
>
> We will provide:
>
> - Entity ID: `https://<our-domain>/api/auth/saml`
> - ACS URL: `https://<our-domain>/api/auth/callback/saml`
> - Audience restriction: `https://<our-domain>`
> - SP signing/encryption certificate (we can generate or use a managed one — please advise)
>
> Could you let us know:
>
> 1. Which IdP endpoint we should connect to (Stanford IdP metadata URL).
> 2. Any required attribute mappings (we need at minimum: `urn:oid:0.9.2342.19200300.100.1.3` (mail), `urn:oid:2.5.4.42` (givenName), `urn:oid:2.5.4.4` (sn), and `eduPersonPrincipalName`).
> 3. Whether the registration requires a security review or sponsor approval.
>
> Happy to provide more context or fill out a form.
>
> Thanks,
> [Your name + team]

Track this in your inbox. Check back in 5 business days if no response.

---

## Step 2 — Domain registration

Pick one:

- **`.app`, `.dev`, `.io` TLDs** — fine for a Stanford-themed product. `cardinalxchange.app` is on-brand.
- **A `stanford.edu` subdomain** — only available with Sponsored Projects approval. Skip unless you already have a sponsor.

**Where:** Cloudflare Registrar (lowest markup) or Namecheap. ~$12/year for `.app`.

**After purchase:** keep the registrar's nameservers for now. We'll point them at Vercel in Step 5.

---

## Step 3 — Managed Postgres (Supabase)

1. Go to [supabase.com](https://supabase.com) → New project.
2. **Region:** pick closest to Vercel's default (us-east-1 / `iad1`).
3. **Database password:** generate a strong one and save in 1Password.
4. **Project name:** `cardinalxchange-prod`.
5. Wait for provisioning (~2 min).
6. Settings → Database → **Connection string** — copy two URLs:
   - **Connection pooling** (Transaction mode, port 6543) → this is `DATABASE_URL`
   - **Direct connection** (port 5432) → this is `DIRECT_URL`
7. Save both in 1Password.

**Tier:** free tier is fine for early traffic. Upgrade to Pro when you have >500MB DB or need point-in-time recovery.

---

## Step 4 — Email transport (for magic-link auth)

Pick one. Recommended: **Postmark** (best deliverability for transactional, generous free tier).

### Postmark setup

1. [postmarkapp.com](https://postmarkapp.com) → Sign up.
2. Create a **Transactional Stream** server.
3. **Sender Signature** — verify the From address. You can use `no-reply@<your-domain>` once the domain is in Vercel and DNS is set up. For early testing, use a verified personal email.
4. Get the SMTP credentials from the server's API tab.
5. Save:
   ```
   EMAIL_SERVER_HOST=smtp.postmarkapp.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=<server-token>          # Postmark uses the same token for user + password
   EMAIL_SERVER_PASSWORD=<server-token>
   EMAIL_FROM=no-reply@<your-domain>
   ```

### Alternatives

- **Resend** — simpler API, also good. SMTP available.
- **AWS SES** — cheapest at scale but DNS verification is more involved (DKIM + SPF + DMARC).
- **Mailtrap** — dev/staging only. Don't use in production.

**Avoid SendGrid free tier** — Stanford recipients often get filtered or rate-limited.

---

## Step 5 — Vercel project

1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo `adarshambati1/cardinalXchange`.
2. **Framework Preset:** Next.js (auto-detected, leave as default).
3. **Root Directory:** leave as repo root.
4. **Build & Development Settings:** override:
   - Build Command: `pnpm build`
   - Install Command: `pnpm install --frozen-lockfile`
   - Output Directory: leave default (Vercel detects Next).
5. **Environment Variables** — add ALL of these. Mark `BETTER_AUTH_SECRET` and email/DB credentials as encrypted:

   ```
   NEXT_PUBLIC_APP_URL=https://<your-domain>
   DATABASE_URL=<supabase-pooled-url>
   DIRECT_URL=<supabase-direct-url>

   BETTER_AUTH_SECRET=<openssl rand -base64 32>     # generate fresh for prod, NOT same as dev
   BETTER_AUTH_URL=https://<your-domain>

   # Stanford SAML — leave empty for now. Fill after IT responds.
   STANFORD_SAML_ENTITY_ID=
   STANFORD_SAML_SSO_URL=
   STANFORD_SAML_CERT=

   EMAIL_SERVER_HOST=smtp.postmarkapp.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=<postmark-token>
   EMAIL_SERVER_PASSWORD=<postmark-token>
   EMAIL_FROM=no-reply@<your-domain>

   OPENAI_API_KEY=sk-...                            # production key, not the dev one
   OPENAI_MODEL=gpt-5-mini

   # DO NOT SET in production:
   # AUTH_DEV_BYPASS=...      ← leave unset; this is dev-only
   # DEV_VIEWER_ID=...        ← leave unset
   # DEV_VIEWER_NAME=...      ← leave unset
   ```

6. **Deploy** → Vercel runs `pnpm install --frozen-lockfile && pnpm build`. First build takes 3-5 min.

7. **Domain:** Settings → Domains → add `<your-domain>` → follow the DNS instructions. If you bought through Cloudflare, the records propagate in seconds.

---

## Step 6 — First-time database migration

Migrations run **once per environment**, against the live DB. Do not run them via Vercel build (the build runs in an ephemeral container; migrations are a separate concern).

```bash
# From your local machine, with prod credentials:
DATABASE_URL="<supabase-pooled>" \
DIRECT_URL="<supabase-direct>" \
pnpm --filter @cardinalxchange/db prisma:deploy
```

This applies all migrations in `packages/db/prisma/migrations/` to the prod DB. Idempotent — safe to re-run; it'll skip already-applied ones.

**Verify:**

```bash
DATABASE_URL="<supabase-pooled>" \
pnpm --filter @cardinalxchange/db prisma:studio
```

Browse the tables. You should see: `Question`, `Answer`, `Tag`, `QuestionTag`, `AiChatSession`, `AiChatMessage`, `AiChatSource`, `user`, `session`, `account`, `verification`. All empty.

---

## Step 7 — Smoke test on prod

In a fresh incognito window, verify each:

| Route                                      | Expected                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `https://<your-domain>/`                   | Redirects to `/questions`                                                                     |
| `/questions`                               | Empty state with "Ask a Question" CTA                                                         |
| `/ask`                                     | Login redirect (unauthenticated) → `/login?next=/ask`                                         |
| `/login`                                   | Magic-link email form. SSO button visible but **disabled** (Stanford IT hasn't responded yet) |
| Submit your `*@stanford.edu` to magic-link | Email arrives within 60 seconds                                                               |
| Click link in email                        | Lands on `/ask` (or wherever the `next` param said), session is set                           |
| Post a real question                       | Lands on `/questions/<slug>`. Refresh — the question persists.                                |
| `/cxc-ai`                                  | Streaming chat works. Without `OPENAI_API_KEY` it falls back; with it, real responses.        |
| `/users/<your-id>`                         | Public profile shows your name + the question you posted                                      |
| `/settings`                                | Edit display name, save, refresh — persists                                                   |

If any of these fail, **stop**. Check Vercel logs (`vercel logs <deployment-url>`) and Supabase logs. Common failures:

- **500 on /login:** `BETTER_AUTH_SECRET` not set or `BETTER_AUTH_URL` doesn't match the actual host.
- **Magic-link email never arrives:** `EMAIL_SERVER_*` wrong, OR Postmark sender signature unverified, OR you used SendGrid (don't).
- **DB connection errors:** `DATABASE_URL` is the direct connection instead of pooled. Pooler (port 6543) is for runtime; direct (5432) is for migrations.
- **CXC AI responds but fallback only:** `OPENAI_API_KEY` not set, or rate-limited.

---

## Step 8 — Stanford SAML SSO (when IT responds)

When you receive the metadata from Stanford IT:

1. Vercel → Settings → Environment Variables, fill:

   ```
   STANFORD_SAML_ENTITY_ID=<their entity_id>
   STANFORD_SAML_SSO_URL=<their sso_url>
   STANFORD_SAML_CERT=<their x509 cert, full PEM block>
   ```

   For multi-line certs, paste the full PEM with header and footer; Vercel preserves newlines.

2. Re-deploy (Vercel does this automatically when env vars change in production).

3. Smoke test:
   - `/login` page → SSO button is now **enabled**.
   - Click → redirects to Stanford IdP login → enter SUNet credentials → redirects back → session set.
   - Verify the user record was created with the correct email + name.

---

## Step 9 — GitHub branch protection

Lock down `main` so green CI is required for merges.

GitHub → repo Settings → Branches → "Add rule":

- **Branch name pattern:** `main`
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1 (or 0 if you're solo)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - **Status checks:** select `verify` (the job from `ci.yml`)
- ✅ Require conversation resolution before merging
- ✅ Do not allow bypassing the above settings

Save.

---

## Operational playbook

### Deploying a change

```bash
git checkout -b feat/something
# ... edit, commit, push
gh pr create --fill
# CI runs on the PR. Wait for green.
# Get review (or self-review if solo).
# Merge via GitHub UI. Vercel auto-deploys main.
```

### Rolling back a bad deploy

Vercel keeps every deployment. To roll back:

1. Vercel project → Deployments → find the last known-good deployment.
2. "Promote to Production" → confirm.
3. Done in ~5 seconds (no rebuild).

If the bad code includes a database migration that broke things:

```bash
# Roll back the migration
DATABASE_URL="<prod-direct>" pnpm --filter @cardinalxchange/db exec prisma migrate resolve --rolled-back <migration-name>
# Then redeploy the older code
```

If the migration is destructive (dropped a column with data), restore from Supabase's daily backup. Free tier keeps 7 days; Pro keeps 30 days + point-in-time.

### Adding a new env var

1. Add to `.env.example` with a placeholder + comment.
2. Add to Vercel project env (all 3 environments: Production, Preview, Development).
3. Reference in code via `process.env.<VAR>`.
4. Document in this file under "Environment variables" table below.

### Database schema changes

```bash
# Local: edit packages/db/prisma/schema.prisma, then:
pnpm --filter @cardinalxchange/db prisma:dev --name <descriptive>

# This creates a new migration in packages/db/prisma/migrations/.
# Commit it. CI verifies it applies cleanly via prisma generate.

# To apply to prod (after merge):
DATABASE_URL="<prod-pooled>" \
DIRECT_URL="<prod-direct>" \
pnpm --filter @cardinalxchange/db prisma:deploy
```

Migrations are checked into git. Production migrations run **manually** from your machine, not from Vercel build (we don't want a failed migration to block deploys).

### Monitoring

Until Sentry is wired:

- **Vercel logs:** runtime errors, request logs. `vercel logs <deployment-url> --follow`
- **Supabase logs:** DB errors, slow queries.
- **Postmark dashboard:** email delivery rate. Watch for bounces.

Add Sentry when traffic justifies it (~100 active users).

---

## Environment variables reference

| Var                                 | Where used                 | Required?                    | Source                      |
| ----------------------------------- | -------------------------- | ---------------------------- | --------------------------- |
| `NEXT_PUBLIC_APP_URL`               | Client + server            | Yes                          | Your prod URL               |
| `DATABASE_URL`                      | Server (Prisma runtime)    | Yes                          | Supabase pooled (port 6543) |
| `DIRECT_URL`                        | Server (Prisma migrations) | Yes                          | Supabase direct (port 5432) |
| `BETTER_AUTH_SECRET`                | Server (auth)              | Yes                          | `openssl rand -base64 32`   |
| `BETTER_AUTH_URL`                   | Server (auth)              | Yes                          | Your prod URL               |
| `STANFORD_SAML_ENTITY_ID`           | Server (SSO)               | When SAML is live            | Stanford IT                 |
| `STANFORD_SAML_SSO_URL`             | Server (SSO)               | When SAML is live            | Stanford IT                 |
| `STANFORD_SAML_CERT`                | Server (SSO)               | When SAML is live            | Stanford IT                 |
| `EMAIL_SERVER_HOST`                 | Server (magic links)       | Yes                          | Postmark / SES              |
| `EMAIL_SERVER_PORT`                 | Server (magic links)       | Yes                          | 587                         |
| `EMAIL_SERVER_USER`                 | Server (magic links)       | Yes                          | Email provider              |
| `EMAIL_SERVER_PASSWORD`             | Server (magic links)       | Yes                          | Email provider              |
| `EMAIL_FROM`                        | Server (magic links)       | Yes                          | Verified sender             |
| `OPENAI_API_KEY`                    | Server (CXC AI)            | Optional (graceful fallback) | OpenAI dashboard            |
| `OPENAI_MODEL`                      | Server (CXC AI)            | Optional                     | Defaults to `gpt-5-mini`    |
| `WEB_CONTEXT_ENDPOINT`              | Server (CXC AI)            | Optional                     | If you wire a web search    |
| `WEB_CONTEXT_API_KEY`               | Server (CXC AI)            | Optional                     | If you wire a web search    |
| `AUTH_DEV_BYPASS`                   | Server (dev only)          | **Never in prod**            | Local `.env` only           |
| `DEV_VIEWER_ID` / `_NAME` / `_META` | Server (dev only)          | **Never in prod**            | Local `.env` only           |

---

## Out-of-scope-but-worth-noting

These don't block launch but are common follow-ups:

- **Sentry** for error tracking — install when active users > 100.
- **PostHog or Vercel Analytics** for product metrics — install when you start making product decisions.
- **Status page** (statuspage.io / instatus.com) — install when you have stakeholders who need to know about outages.
- **Custom 404 / 500 pages** — Next has fine defaults; customize when the brand voice matters.
- **Rate limiting** on `/api/cxc-ai` — install before public launch (one bad actor can drain the OpenAI bill).

If anything in this doc is wrong or stale, fix it here. README + SETUP.md point readers at this file as the canonical deploy runbook.
