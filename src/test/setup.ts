// Registered once for the whole Vitest run via `test.setupFiles` in
// vite.config.ts. Extends `expect` with jest-dom's DOM matchers
// (toBeDisabled, toHaveAttribute, ...) used by Button.test.tsx.
//
// Accessibility assertions use `axe-core` directly rather than a
// third-party custom-matcher wrapper (e.g. jest-axe/vitest-axe) — those
// packages pin against a specific Vitest major's global type namespace
// and tend to fall out of sync (confirmed while scaffolding this repo:
// the current vitest-axe's types don't resolve against Vitest 4). One
// `expect(results.violations).toEqual([])` in Button.test.tsx gets the
// same coverage without that fragility — worth keeping in mind before
// reaching for a custom-matcher package in the other 9 repos.
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Testing Library's auto-cleanup only self-registers when it detects a
// *global* `afterEach` (Jest-style). Our vitest config runs without
// `test.globals: true` on purpose (explicit `import { ... } from
// 'vitest'` everywhere is easier to follow across 10 repos), so
// cleanup has to be wired up by hand here instead — otherwise each
// test file's DOM nodes leak into the next test.
afterEach(() => {
  cleanup();
});
