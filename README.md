# @avian-dev/design-system

Avian Dev's shared, accessible design system: design tokens + a
tokenized, keyboard-navigable, ARIA-correct React component library.
Published to npm and consumed by every other repo in the Avian Dev
project suite — never copy-pasted, never rebuilt locally per project.

## Why this repo exists

This is repo 1 of 10. The workflow rule for the whole suite: **any new
UI component gets built here first**, documented in Storybook, then
consumed via `npm install @avian-dev/design-system` in whichever of the
8 project repos (or the admin dashboard / widget kit) needs it. Nothing
downstream forks a component locally — a fix or new variant lands here,
gets a changeset, gets published, and every consumer bumps to it.

## Quickstart

```bash
npm install
npm run storybook       # component dev environment — http://localhost:6006
npm test                 # fast unit tests (jsdom), watch mode: npm run test:watch
npm run test:storybook  # every story, in a real browser via Playwright — see "Accessibility approach"
npm run build            # produces dist/ (what gets published)
```

## Using this package in a consuming project

```bash
npm install @avian-dev/design-system
```

```tsx
// once, at the app root (e.g. app/layout.tsx or src/main.tsx)
import '@avian-dev/design-system/tokens.css';
import '@avian-dev/design-system/style.css';
```

```tsx
import { Button, color, spacing } from '@avian-dev/design-system';

<Button variant="primary" onClick={handleSave}>
  Save changes
</Button>;
```

Two separate stylesheets, imported once, on purpose:

- **`tokens.css`** — the CSS custom properties (`--ads-*`). A consuming
  app could theoretically override individual tokens after importing
  this, before a rebrand makes that unnecessary.
- **`style.css`** — the actual component styles (CSS Modules output),
  which reference those custom properties.

`react` / `react-dom` are **peer dependencies**, not bundled — the
consuming app supplies its own copy so there's only ever one React
instance (a second copy breaks hooks with a cryptic error).

## Typography

`fontFamily.sans` (in `src/tokens/typography.ts`) names **Inter** as
the brand typeface, with the system font stack as the real fallback —
not decoration, what actually renders before the webfont loads and
forever if it doesn't. `Heading` and `Text` (in `src/components/`) are
the two primitives that read the full type scale (`fontSize`,
`fontWeight`, `lineHeight`) so nothing hand-codes a `font-size`:

```tsx
import { Heading, Text } from '@avian-dev/design-system';

<Heading level={1}>Page title</Heading>
<Text color="secondary">Supporting copy.</Text>
```

`Heading`'s `level` is required with no default — it forces a
conscious choice about the document outline instead of silently
defaulting to `<h2>`. `size` is a **separate** prop: a heading can be
semantically correct (`level={2}`) and visually smaller than its
children's `level={3}`s without lying about the outline to get there.

**This package does not ship the font file.** Only the name. Loading
strategy is deliberately left to the consumer, because the right
answer differs by context:

- The 8 consuming apps are Next.js — load Inter via `next/font/google`
  (or `next/font/local` for a fully self-hosted copy). Next
  self-hosts, preloads, and sets `font-display` automatically; that
  beats this package shipping font files into every consumer's bundle.
- This repo's own Storybook isn't a Next.js app, so it self-hosts via
  `@fontsource-variable/inter` directly — see `.storybook/preview.tsx`.
  That import is local to Storybook's dev experience; it's a
  devDependency, not part of what gets published.

## Repo layout

```
src/
  tokens/            color.ts, spacing.ts, typography.ts, tokens.css
  components/
    Button/
      Button.tsx           component + a11y contract (see file header)
      Button.module.css    styled entirely off var(--ads-*) tokens
      Button.stories.tsx   Storybook stories, tagged 'autodocs'
      Button.test.tsx      keyboard nav + axe-core a11y assertions
      index.ts
    Heading/                <h1>-<h6> primitive — level and visual size are separate props
    Text/                    body-copy primitive — polymorphic `as`, size/weight/color tokens
  index.ts            the package's public API — nothing else is exported
  test/setup.ts        vitest + testing-library wiring (the 'unit' project only)
.storybook/
  main.ts, preview.tsx, manager.ts, theme.ts, manager-head.html
  globals.css          Storybook-canvas-only base styles (never published)
  public/              favicon-placeholder.svg (swap for the real one)
middleware.ts            Basic Auth gate for the deployed Storybook — dev/staging only,
                          see "Deploying Storybook to Vercel"
vite.config.ts          library build (npm run build) + two vitest projects:
                         'unit' (jsdom) and 'storybook' (real Chromium via Playwright)
eslint.config.js         template lint config for the other 9 repos
.github/workflows/
  lint.yml                lint + format + typecheck on every push — see "CI"
vercel.json              Storybook static deploy config
.changeset/               versioning — see "Versioning" below
```

## Accessibility approach

Two layers, deliberately not the same tool at both — each catches what
the other structurally can't:

1. **`npm test`** (Vitest's `'unit'` project: Testing Library +
   `axe-core` directly, jsdom) — fast. Catches structural issues:
   missing accessible names, wrong roles, keyboard-reachability.
   **Does not** reliably catch color-contrast violations — jsdom has
   no real `<canvas>`, which `axe-core`'s contrast check depends on
   (see the console warning when you run tests; this is a known jsdom
   limitation, not a bug here).
2. **`npm run test:storybook`** (Vitest's `'storybook'` project:
   `@storybook/addon-vitest` + `@storybook/addon-a11y`, running in real
   headless Chromium via Playwright) — turns every story into a test
   and runs `axe-core` against the actual rendered, actual-browser DOM.
   This is what catches contrast and the other checks jsdom can't.

**Neither is wired into CI right now** (`.github/workflows/lint.yml`
only runs lint/format/typecheck — see "CI" below) — both are real,
verified-working local commands, but running them on every push is a
follow-up, not done here.

Both are real, not aspirational, regardless — confirmed by writing a
genuinely broken story (`Button.stories.tsx`'s `IconOnlyMissingLabel`,
an icon-only button with no accessible name) and watching
`test:storybook` fail on it with axe's actual `button-name` violation
before excluding it from the automated run via `tags: ['!test']` (it
still renders in interactive Storybook, so the a11y addon panel has a
real violation to show).

**Two different `a11y.test` modes, same `preview.tsx`, on purpose**
(see the comment there): browsing Storybook interactively stays
`'todo'` (never punishes you mid-sketch), but running under Vitest
(`import.meta.env.VITEST`) flips to `'error'` — that's what makes
`test:storybook` an actual pass/fail gate instead of just a report.

Every new component should ship with both: a `*.test.tsx` axe
assertion (fast feedback) and stories that pass under
`test:storybook` (the real-browser check).

## CI

`.github/workflows/lint.yml` — lint, format check, typecheck, on every
push to every branch. That's the whole job, deliberately minimal:
deployment isn't gated by it (Vercel deploys independently on push,
see below), and it doesn't run the test suites either. If you want
`npm test` / `npm run test:storybook` / a build check enforced on every
push too, that's a small addition to the same workflow file, not done
here.

`eslint.config.js` parses with `ecmaVersion: 'latest'` rather than a
pinned year — there's no ES2026 to pin to yet (the spec itself trails
what tooling ships), so `'latest'` is the actual mechanism for staying
on the newest ECMAScript syntax ESLint's parser understands. Same
reasoning behind `"target": "esnext"` in the three tsconfig files
(`tsconfig.app.json`, `tsconfig.node.json`, `tsconfig.middleware.json`)
— TypeScript's lib set only goes up to ES2024 as of the version this
repo pins (`~5.9.3`); `"esnext"` is TS's rolling latest-known bucket
until an `"ES2026"` lib exists to target explicitly instead.

## Versioning: Changesets

```bash
npm run changeset          # describe your change, pick a bump type
git add .changeset/*.md    # commit it with your PR
```

**Publishing to npm is a manual local step right now**:
`npm run release` (`npm run build && changeset publish`), which
consumes pending changesets into a version bump + `CHANGELOG.md` entry
and pushes to npm using whatever npm auth your local machine already
has (`npm login`, or an `NPM_TOKEN` in your shell env — same as
`npm publish` normally needs). This isn't automated in CI on purpose
for now — nothing pushes to npm on your behalf on a `git push`.

**Current phase: `0.x`.** Under semver's `0.x` convention, breaking
changes bump the _minor_ version, not major (`0.1.0` → `0.2.0` for a
breaking `Button` prop change, not `1.0.0`). Consuming projects should
pin with `^0.1.0` accordingly during this phase, not `^1.0.0`.
Graduate to `1.0.0` once the design system has a stable-enough surface
that consumers can trust semver's normal breaking-change contract —
a reasonable trigger is "3+ consuming repos depend on this in a
deployed project," not a fixed date.

## Deploying Storybook to Vercel

**Vercel's own GitHub integration deploys directly on push** — not a
custom script, not GitHub Actions. `main` → Production, every other
branch (including `develop` and `staging`) → a Preview deployment.
That's Vercel's default behavior once the project is connected to the
repo; nothing in this repo orchestrates it.

**One-time setup, can't be scripted** (needs your own Vercel/GitHub
account access):

1. **Connect your GitHub account to Vercel**, if you haven't:
   vercel.com → Account Settings → **Login Connections** → GitHub.
   Without this, linking the repo fails with "You need to add a Login
   Connection to your GitHub account first" — hit exactly that error
   the first time this was wired up.
2. **Connect the repo to the Vercel project**: either re-run
   `npx vercel link` locally once step 1 is done, or from the Vercel
   dashboard → the `design-system` project → Settings → Git → Connect
   Git Repository → `AvianDev1725/design-system`.
3. Confirm **Settings → Git → Production Branch** is set to `main`.

### Restricting dev/staging behind a username + password

`middleware.ts` gates every non-production deployment behind HTTP
Basic Auth — real username/password (not Vercel's own single-shared-
password Protection feature, which needs a paid plan and doesn't
distinguish users). It checks Vercel's own `VERCEL_ENV` at request
time: `'production'` skips the check entirely (main stays fully
public), anything else (`'preview'` — covers both `develop` and
`staging`, Vercel doesn't distinguish them further without a paid
Custom Environments plan) requires `BASIC_AUTH_USER` /
`BASIC_AUTH_PASS`, read from Vercel Environment Variables scoped to
**Preview only** (already set on the `avian-dev/design-system` Vercel
project — Project Settings → Environment Variables → change or
rotate them there, not in code).

**Verified working end-to-end**, not just written: a real preview
deploy 401s with no/wrong credentials and 200s with the right ones; a
real production deploy skips the check and is fully public. Getting
here also required disabling Vercel's own default **Deployment
Protection** (Settings → Deployment Protection → off) — that feature
gates preview URLs behind a Vercel-account SSO wall _before_ any
project code runs, which isn't a username/password and would have
silently pre-empted `middleware.ts` entirely; the two were fighting
each other until it was turned off project-wide.

One real limitation: since dev and staging are both Vercel's generic
"Preview" environment (not distinct Vercel Environments), they
currently share the **same** Basic Auth credentials. Genuinely
different dev vs. staging credentials would need [Vercel Custom
Environments](https://vercel.com/docs/deployments/environments#custom-environments)
(a Pro-plan feature) or a middleware check keyed on the request's
hostname instead of `VERCEL_ENV` — neither done here.

### Manual/local deploy, without pushing at all

```bash
npm run deploy:storybook:dev   # preview
npm run deploy:storybook:prod  # production
```

Both need `VERCEL_TOKEN` in your shell env (a personal token from
Vercel's account settings). Both use `vercel pull` → `vercel build` →
`vercel deploy --prebuilt` — deliberately not `vercel deploy
storybook-static` (a raw static-file upload): that path skips Vercel's
own build pipeline, which is what actually processes `middleware.ts`
into the deployment. A raw upload would silently deploy Storybook with
no Basic Auth at all — found by hitting exactly that.

## Decisions made (and why) — revisit before scaling to project 2

These were called along the way rather than left as open questions,
because they had a reasonable default and blocking on them would have
stalled the work. Reconsider any of them before they get copy-pasted
into the other 9 repos:

- **TypeScript pinned to `~5.9.3`, not `6.0.x`.** TS 6.0 (very recently
  released) broke `@microsoft/api-extractor`'s declaration-bundling —
  confirmed while building this repo, not a hypothetical. Re-check this
  pin when API Extractor catches up.
- **Vite pinned to `^7.3.6`, not `8.x`.** Vite 8 defaults to the new
  Rolldown bundler, which `vite-plugin-dts` doesn't reliably support
  yet (also confirmed while building, not assumed). Vite 7 is still
  current and Rollup-based. Revisit once the dts-plugin ecosystem
  updates.
- **No custom Vitest a11y matcher package** (e.g. `jest-axe`/
  `vitest-axe`) — used `axe-core` directly with a plain
  `expect(violations).toEqual([])` instead. The available wrapper
  packages pin to specific Vitest major-version type internals and
  broke against Vitest 4 during setup; one plain assertion sidesteps
  that entire class of breakage.
- **ESLint pinned to `^9.x`, not `10.x`.** `eslint-plugin-jsx-a11y` —
  load-bearing for this repo's whole purpose — doesn't support ESLint
  10 yet (peer range caps at `^9`). Revisit once it does.
- **ESM + CJS dual output**, not ESM-only, for the published package —
  safer default given some of the 9 consuming repos' tooling is
  unknown yet. Revisit to ESM-only once every consumer is confirmed on
  a modern bundler.
- **Inter, self-hosted only for Storybook, named-only for consumers** —
  see "Typography" above. This package intentionally never ships font
  files.
- **No CI/CD platform beyond GitHub Actions + Vercel's native
  integration.** Earlier iterations of this repo wired up Jenkins (a
  local disposable Docker instance) and SonarCloud; both were removed
  in favor of this simpler shape — Vercel deploys directly on push,
  GitHub Actions only lints. If SonarQube/SonarCloud static analysis
  or a heavier CI/CD platform is wanted later, that's a clean addition
  to `.github/workflows/`, not a reason to reach for Jenkins again.
- **npm publish is manual**, not automated on push to `main` — see
  "Versioning" above. A deliberate simplification, not an oversight;
  automate it in `lint.yml` (or a new workflow) if that's wanted.

## Decisions still open

- **License.** Defaulted to MIT (standard for a public portfolio repo,
  permissive for anyone consuming your components as a reference). Say
  so if you want something else.
- **Brand palette, logo, favicon.** Every hook is wired
  (`.storybook/theme.ts`, `.storybook/manager-head.html`,
  `.storybook/public/`, `src/tokens/color.ts`'s placeholder blue ramp)
  but using placeholder values — see the `TODO(brand)` comments in
  those files for exactly what to swap and where.
- **Dev vs. staging share one Basic Auth credential pair** — see
  "Deploying Storybook to Vercel" for what genuinely separating them
  would need.
- **A component that intentionally fails a11y** (`IconOnlyMissingLabel`
  in `Button.stories.tsx`) is kept as a permanent story to give the a11y
  addon panel something real to demonstrate. Decide if that convention
  (one deliberately-broken example story per component) is worth
  keeping as new components get added, or if it should move to
  documentation-only.

## Style Dictionary (not done, worth flagging)

`src/tokens/*.ts` and `src/tokens/tokens.css` are hand-kept in sync
right now — fine for one token set and one component. If the token
surface grows meaningfully, generating both from a single source
(Style Dictionary is the standard tool for this) removes the
"did I update both files" class of bug. Not done now because there
wasn't yet a second real usage pattern to generalize the tooling from.
