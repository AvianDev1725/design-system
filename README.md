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
vite.config.ts          library build (npm run build) + two vitest projects:
                         'unit' (jsdom) and 'storybook' (real Chromium via Playwright)
eslint.config.js         template lint config for the other 9 repos
Jenkinsfile              lint -> test -> a11y (Playwright) -> Sonar gate -> build -> deploy
vercel.json              Storybook static deploy config
sonar-project.properties
.changeset/               versioning — see "Versioning" below
```

## Accessibility approach

Two layers, deliberately not the same tool at both — each catches what
the other structurally can't:

1. **`npm test`** (Vitest's `'unit'` project: Testing Library +
   `axe-core` directly, jsdom) — fast, runs in the "Test" pipeline
   stage on every PR. Catches structural issues: missing accessible
   names, wrong roles, keyboard-reachability. **Does not** reliably
   catch color-contrast violations — jsdom has no real `<canvas>`,
   which `axe-core`'s contrast check depends on (see the console
   warning when you run tests; this is a known jsdom limitation, not a
   bug here).
2. **`npm run test:storybook`** (Vitest's `'storybook'` project:
   `@storybook/addon-vitest` + `@storybook/addon-a11y`, running in real
   headless Chromium via Playwright) — turns every story into a test
   and runs `axe-core` against the actual rendered, actual-browser DOM.
   This is what catches contrast and the other checks jsdom can't.
   Wired into the Jenkins pipeline as its own stage (needs
   `npx playwright install chromium` first — see the Jenkinsfile).

Both are real, not aspirational — confirmed by writing a genuinely
broken story (`Button.stories.tsx`'s `IconOnlyMissingLabel`, an
icon-only button with no accessible name) and watching
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
`test:storybook` (the real-browser check that actually gates CI).

## Versioning: Changesets

```bash
npm run changeset          # describe your change, pick a bump type
git add .changeset/*.md    # commit it with your PR
```

On merge to `main`, CI (`Jenkinsfile`) runs `changeset publish`, which
consumes pending changesets into a version bump + `CHANGELOG.md` entry
and pushes to npm.

**Current phase: `0.x`.** Under semver's `0.x` convention, breaking
changes bump the _minor_ version, not major (`0.1.0` → `0.2.0` for a
breaking `Button` prop change, not `1.0.0`). Consuming projects should
pin with `^0.1.0` accordingly during this phase, not `^1.0.0`.
Graduate to `1.0.0` once the design system has a stable-enough surface
that consumers can trust semver's normal breaking-change contract —
a reasonable trigger is "3+ consuming repos depend on this in a
deployed project," not a fixed date.

## Deploying Storybook to Vercel

One-time setup (not repeatable from a script — needs your Vercel
login):

```bash
npx vercel login
npx vercel link          # connects this repo to a Vercel project
```

After that, two scripts — `develop` builds+deploys a **preview**
(Vercel's non-production deploy target; use this for the `develop` and
`staging` branches), `prod` promotes to the **production** URL (the
`main` branch, after the Jenkins approval gate):

```bash
npm run deploy:storybook:dev   # preview deploy
npm run deploy:storybook:prod  # production deploy
```

Both need `VERCEL_TOKEN` in the environment (a personal token from
Vercel's account settings — `npx vercel login` won't set this for you,
it's separate from the CLI session token). The Jenkins pipeline runs
the equivalent `vercel deploy` commands itself, branch-gated — these
npm scripts are for a manual/local deploy without going through
Jenkins. See the Jenkinsfile's header comment for why branch→env
mapping is CLI-driven from CI rather than Vercel's own git integration.

## Decisions made (and why) — revisit before scaling to project 2

These were called during scaffolding rather than left as open
questions, because they had a reasonable default and blocking on them
would have stalled the whole repo. Reconsider any of them before they
get copy-pasted into the other 9 repos:

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
  that entire class of breakage. Worth remembering before reaching for
  a similar wrapper package in the other 9 repos.
- **ESM + CJS dual output**, not ESM-only, for the published package —
  safer default given some of the 9 consuming repos' tooling is
  unknown yet. Revisit to ESM-only once every consumer is confirmed on
  a modern bundler.
- **Inter, self-hosted only for Storybook, named-only for consumers** —
  see "Typography" above. This package intentionally never ships font
  files.
- **`npm audit` reports vulnerabilities only in `vercel` CLI's own
  transitive deps** (`npm audit --omit=dev` — what actually matters for
  published-package consumers — reports zero). Normal for a large CLI
  tool pulled in as a devDependency; not chased further because nothing
  in that tree ships to npm (`files: ["dist"]`). Worth an occasional
  `npm audit` re-check, not a blocker.

## Decisions still open — needed before project 2

- **GitHub org/username.** `package.json` (`repository`, `homepage`,
  `bugs`) and `.storybook/theme.ts` (`brandUrl`) currently point at
  placeholder `github.com/avian-dev` URLs. Find-and-replace once you
  know the real org/username — same placeholder will show up in the
  other 9 repos' `package.json`s, so worth deciding once, here.
- **License.** Defaulted to MIT (standard for a public portfolio repo,
  permissive for anyone consuming your components as a reference). Say
  so if you want something else.
- **Brand palette, logo, favicon.** Every hook is wired
  (`.storybook/theme.ts`, `.storybook/manager-head.html`,
  `.storybook/public/`, `src/tokens/color.ts`'s placeholder blue ramp)
  but using placeholder values — see the `TODO(brand)` comments in
  those files for exactly what to swap and where.
- **Jenkins credential IDs & Vercel/Sonar project linking.** The
  `Jenkinsfile` references credential IDs
  (`avian-dev-npm-token`, `avian-dev-sonar-token`,
  `avian-dev-vercel-token`, etc.) and `sonar-project.properties`
  references a `sonar.organization` — these need to exist in your
  actual Jenkins/SonarQube/Vercel accounts before the pipeline can run
  end to end. Scaffolded so the shape is right; not wired to real
  infrastructure yet.
- **Vercel's branch→environment mapping is CLI-driven from Jenkins**,
  not Vercel's own git integration (see the Jenkinsfile's comment). If
  you'd rather let Vercel auto-deploy previews from its GitHub
  integration and use Jenkins only for the npm publish + prod gate,
  that's a simpler alternative worth considering — it just splits the
  pipeline across two systems instead of one.
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
