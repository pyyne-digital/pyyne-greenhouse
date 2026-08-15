# Pyyne Greenhouse 🌱

Where ideas are planted, matured, and grow until they become playbooks.

Pyyne's visual playbook editor: anyone with a `@pyyne.com` Google account can suggest changes through visual editing; admins review a **before/after** view and approve; deployment to GitHub Pages is automatic.

---

## Tech stack

### Core framework

| Technology | Version | What it is used for |
|---|---|---|
| [Next.js](https://nextjs.org) 15 (App Router) | `^15.3` | The whole editor app: pages, layouts, server components, API routes (`/api/proposals/*`, `/api/auth/*`) and middleware. Deployed on Vercel. |
| [React](https://react.dev) 19 | `^19.1` | UI components. The same block components render in the editor (client), in previews (SSR) and in the static site build (`renderToStaticMarkup`). |
| [TypeScript](https://www.typescriptlang.org) 5 | `^5.7` | Everything is typed; `npm run typecheck` runs `tsc --noEmit`. |

### Styling

| Technology | Version | What it is used for |
|---|---|---|
| [Pico CSS](https://picocss.com) | `^2.0` | Editor chrome only. Styles semantic HTML (forms, tables, buttons, dialogs) with almost no classes. Customizations live in `src/app/globals.css`. |
| Custom design system | — | The playbook look itself lives in `shared/playbook/playbook.css` (ported from the original playbook). It is driven by CSS custom properties (`--brand`, `--ink`, …) injected per playbook from the JSON `theme` object — independent of Pico. |

### Data, auth and integrations

| Technology | Version | What it is used for |
|---|---|---|
| [zod](https://zod.dev) | `^3.24` | The playbook JSON schema (`shared/playbook/schema.ts`). Every playbook is validated on read, on proposal submit, and at static build time. Block types are a zod discriminated union, so TypeScript types are inferred from the schema. |
| [Auth.js (next-auth)](https://authjs.dev) v5 | `^5.0.0-beta` | Google OAuth restricted to `@pyyne.com` (`hd` parameter + server-side domain check in the `signIn` callback). JWT sessions carry the `isAdmin` flag. |
| [@octokit/app](https://github.com/octokit/app.js) + [@octokit/rest](https://github.com/octokit/rest.js) | `^15` / `^21` | GitHub App authentication and API calls: creating branches, committing JSON files, opening/merging/closing PRs, labels and comments. There is **no database** — Git is the audit trail. |
| [diff](https://github.com/kpdecker/jsdiff) | `^7` | Per-word text diffs (`diffWords`) inside the structural before/after comparison shown to reviewers. |

### Tooling

| Technology | Version | What it is used for |
|---|---|---|
| [tsx](https://tsx.is) | `^4.19` | Runs the TypeScript scripts (`build:site`, `migrate:interviewer`) without a compile step. |
| GitHub Actions | — | `.github/workflows/deploy-pages.yml` builds the static site and deploys to GitHub Pages on every merge to `main`. |
| Vercel | — | Hosts the editor app (server-side OAuth secrets and GitHub App key cannot live on GitHub Pages). |

---

## How it works

```mermaid
flowchart LR
  user["@pyyne.com"] -->|"Google login"| editor["Greenhouse (Vercel)"]
  editor -->|"submits change"| pr["branch + PR (greenhouse label)"]
  admin["Admin"] -->|"reviews before/after and approves"| pr
  pr -->|"squash merge to main"| repo[("pyyne-greenhouse")]
  repo --> action["GH Action: build:site"]
  action --> pages["GitHub Pages (public playbooks)"]
```

1. **Content** lives as versioned JSON: `content/playbooks/<slug>.json` — the single source of truth.
2. **Proposals** are pull requests created by the server via the GitHub App. Proposal metadata (author, type, summary) travels in an HTML comment inside the PR body.
3. **Before/after review**: the API fetches the JSON from `main` and from the PR branch, aligns blocks by `id` and renders a visual diff (added/removed/moved/changed blocks + per-word text diffs) with author, avatar and date.
4. **Approval rule** (server-side): the approver must be in `content/admins.json`; an admin cannot approve their own proposal, except emails with `canSelfApprove: true`.
5. **Publishing**: merge to `main` triggers the Pages workflow; `scripts/build-site.ts` renders every playbook to static HTML.

---

## Repository structure

```
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx              # Home: playbook list
│   │   ├── login/                # Google sign-in screen
│   │   ├── new/                  # New-playbook wizard (goes through approval too)
│   │   ├── playbooks/[slug]/     # Public preview of a playbook
│   │   │   └── edit/             # Visual editor (client) + BlockInspector forms
│   │   ├── proposals/            # Proposal list
│   │   │   └── [n]/              # Before/after review screen (ProposalView)
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # Auth.js handler
│   │       └── proposals/        # GET/POST list+create, [n]/approve, [n]/reject
│   ├── lib/
│   │   ├── auth.ts               # Auth.js v5 config (Google, pyyne.com check, isAdmin in JWT)
│   │   ├── guards.ts             # requireUser / requireAdmin for pages and API routes
│   │   ├── admins.ts             # Reads content/admins.json (bundled via static import)
│   │   ├── github.ts             # GitHub App → authenticated Octokit client
│   │   ├── content.ts            # Playbook reads: GitHub Contents API in prod, fs in dev
│   │   └── proposals.ts          # PR lifecycle: create branch+PR, list, merge, reject
│   ├── auth.config.ts            # Edge-safe Auth.js subset used by middleware (no node:fs)
│   ├── middleware.ts             # Protects /edit, /proposals, /new, /api/proposals
│   └── components/               # AppHeader, form field primitives (fields.tsx)
│
├── shared/playbook/              # THE HEART — shared by the app AND the static build
│   ├── schema.ts                 # zod schemas: Playbook, Page, Block (discriminated union), Theme
│   ├── types.ts                  # TS types inferred from the schemas + proposal types
│   ├── theme.ts                  # defaultTheme (Pyyne tokens) + theme→CSS variables
│   ├── playbook.css              # The playbook design system (classes .pb-*)
│   ├── icons.tsx                 # Named inline SVG icon registry
│   ├── blocks/index.tsx          # One React component per block type + <BlockView> router
│   ├── PlaybookShell.tsx         # Full layout (topbar, sidebar, pages) for preview/static
│   ├── RichText.tsx              # Safe renderer for the <strong>/<em> inline subset
│   ├── factory.ts                # Block/page/playbook factories + palette labels (BLOCK_LABELS)
│   └── diff.ts                   # Structural playbook diff + per-word text diff
│
├── content/
│   ├── playbooks/<slug>.json     # The playbooks (source of truth, schema-validated)
│   └── admins.json               # [{ email, canSelfApprove }]
│
├── scripts/
│   ├── build-site.ts             # Static site generator → out/ (GitHub Pages)
│   └── migrate-interviewer.ts    # One-shot migration from the legacy config.js
│
├── .github/workflows/deploy-pages.yml
└── public/assets/                # Pyyne logo (used by app and static site)
```

### Why `shared/playbook` is separate

Block components, the schema and the theme are imported by **two** runtimes: the Next.js app (client + SSR) and the static site generator (`renderToStaticMarkup` in Node, outside Next). Keeping them Next-free (no `next/link`, no `next/image`) is what makes the dual use possible — do not import Next-specific modules there.

---

## The content model

A playbook JSON has four sections (schema v1, see `shared/playbook/schema.ts`):

```jsonc
{
  "schemaVersion": 1,
  "meta":   { "slug", "title", "description", "version", "lastUpdated", "tags", "favicon" },
  "theme":  { "colors": { "brand", "brandDark", …22 tokens }, "fonts", "radii", "layout" },
  "nav":    [ { "group": "Getting Started", "pageIds": ["overview"] } ],
  "pages":  [ { "id", "label", "icon", "eyebrow", "title", "subtitle", "blocks": [ … ] } ]
}
```

Every block is `{ "id", "type", "props" }`. The 19 block types:

| Group | Types |
|---|---|
| Structure | `hero`, `subHeading`, `separator`, `richText` |
| Cards | `card`, `cardGrid`, `formatCards`, `letterCards` |
| Lists | `checklist`, `timeline`, `pillRow`, `qaList`, `contributors` |
| Data | `table`, `changelog` |
| Callouts | `alert`, `quote`, `ctaButton`, `image` |

### Adding a new block type

1. Add a variant to the `BlockSchema` discriminated union in `shared/playbook/schema.ts`
2. Register the type name in `BLOCK_TYPES` and its palette label in `BLOCK_LABELS` (`factory.ts`)
3. Add a factory default in `createBlock` (`factory.ts`)
4. Add a render case in `BlockView` (`shared/playbook/blocks/index.tsx`) + CSS in `playbook.css`
5. Add an inspector form in `src/app/playbooks/[slug]/edit/BlockInspector.tsx`

The diff engine, proposals flow and static build pick it up automatically.

---

## Local development

```bash
npm install
npm run dev          # editor at http://localhost:3000
npm run build:site   # generates the static site in out/
npm run typecheck    # type checking
```

Without the GitHub App env vars, the app runs in local mode: it reads `content/playbooks/*.json` from disk and the "Submit" button returns 503.

### Auth bypass (current default)

While `AUTH_GOOGLE_ID` is unset, the app runs in **auth bypass mode**: everyone is automatically signed in as the first admin from `content/admins.json` (shown as "Dev (auth bypass)" with a `bypass` badge in the header), and all routes are open. As soon as the Google credentials are configured, real OAuth takes over with no code change. Force a mode explicitly with `AUTH_BYPASS=true|false`.

## Production setup (one time)

### 1. Google OAuth (login @pyyne.com)

1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web)
2. Authorized redirect URI: `https://<your-app>.vercel.app/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for dev)
3. OAuth consent screen: **Internal** type (Workspace) — restricts access to pyyne.com
4. Copy the Client ID/Secret

### 2. GitHub App (proposals as PRs)

1. `pyyne-digital` org Settings → Developer settings → GitHub Apps → **New GitHub App**
2. Repository permissions: **Contents: Read & write**, **Pull requests: Read & write**, **Issues: Read & write** (labels/comments)
3. Webhook: disabled
4. Install the app **only** on the `pyyne-greenhouse` repo
5. Generate a **private key** and note the App ID + Installation ID (in the installation URL)

### 3. Vercel

1. Import the `pyyne-digital/pyyne-greenhouse` repo
2. Env vars (see `.env.example`):
   - `AUTH_SECRET` — `npx auth secret`
   - `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
   - `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY` (with `\n` for line breaks), `GITHUB_APP_INSTALLATION_ID`
   - `GITHUB_REPO_OWNER=pyyne-digital`, `GITHUB_REPO_NAME=pyyne-greenhouse`
3. Auto-deploys on every push to `main` (content always fresh)

### 4. GitHub Pages

Settings → Pages → Source: **GitHub Actions**. The workflow `.github/workflows/deploy-pages.yml` handles the rest. Site at `https://pyyne-digital.github.io/pyyne-greenhouse/`.

## Editing admins

`content/admins.json`:

```json
{
  "admins": [
    { "email": "pedro.mihael@pyyne.com", "canSelfApprove": true },
    { "email": "another.admin@pyyne.com", "canSelfApprove": false }
  ]
}
```

Changes to this file go through the normal PR flow.
