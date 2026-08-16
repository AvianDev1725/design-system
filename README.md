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
npm run storybook      # component dev environment — http://localhost:6006
npm test                # vitest, watch mode: npm run test:watch
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
  index.ts            the package's public API — nothing else is exported
  test/setup.ts        vitest + testing-library wiring
.storybook/
  main.ts, preview.tsx, manager.ts, theme.ts, manager-head.html
  public/              favicon-placeholder.svg (swap for the real one)
vite.config.ts          library build (npm run build) + vitest config
eslint.config.js         template lint config for the other 9 repos
Jenkinsfile              lint -> test -> Sonar gate -> build -> deploy
vercel.json              Storybook static deploy config
sonar-project.properties
.changeset/               versioning — see "Versioning" below
```

## Accessibility approach

Two layers, deliberately not the same tool at both:

1. **`npm test`** (Vitest + Testing Library + `axe-core` directly) —
   fast, jsdom-based, runs in the "Test" pipeline stage on every PR.
   Catches structural issues: missing accessible names, wrong roles,
   keyboard-reachability. **Does not** reliably catch color-contrast
   violations — jsdom has no real `<canvas>`, which `axe-core`'s
   contrast check depends on (see the console warning when you run
   tests; this is a known jsdom limitation, not a bug here).
2. **Storybook's `@storybook/addon-a11y`** — runs `axe-core` in a real
   browser against the rendered story, so it _does_ catch contrast
   issues, and gives visual, per-story feedback in the addon panel.
   Currently set to `test: 'todo'` (surfaces violations, doesn't fail
   CI) in `.storybook/preview.tsx` — flip to `'error'` once the initial
   component set is past the sketch phase.

Every new component should ship with both: a `*.test.tsx` axe
assertion and stories the a11y addon can check in Storybook.

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
