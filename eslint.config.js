// @avian-dev shared ESLint config — flat config (ESLint 9+ format).
//
// This file is the template the other 9 repos in the suite copy and
// adapt. Rules of thumb for what belongs here vs. per-repo:
//   - Universal correctness/a11y/style rules: here.
//   - Framework-specific additions (e.g. Next.js's `eslint-config-next`
//     rules for the SEO blog / storefront / job board repos): layered
//     on top in that repo's own eslint.config.js, spread after these
//     configs — don't fork this file, extend it.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Build output and generated artifacts — never lint what a tool
    // generated. (No linting `dist/`: those types come out of
    // vite-plugin-dts and Rollup, not our source.)
    ignores: [
      'dist',
      'storybook-static',
      'coverage',
      'node_modules',
      '.changeset',
      // Vercel's local build output (`vercel build`) — gitignored
      // already, but ESLint's flat config doesn't read .gitignore on
      // its own; found by hitting exactly that, 21k+ errors from a
      // minified file in here getting linted as source.
      '.vercel',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      // 'latest', not a pinned year: always parses whatever newest
      // ECMAScript syntax this ESLint/parser version knows, rather
      // than needing a manual bump every spec edition — the practical
      // way to actually stay on "latest ES guidelines" (there's no
      // year-numbered 'ecmaVersion: 2026' to pin to; TC39 tooling
      // support trails the spec, same reasoning as the tsconfig files'
      // "esnext" target).
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,

      // Library code should only export components (Fast Refresh
      // constraint) — catches accidentally exporting a constant/hook
      // from a component file, which breaks HMR in consuming apps too.
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TS's own unused-vars check replaces the base rule; keeps type
      // imports from false-positiving.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.stories.@(ts|tsx)'],
    plugins: { storybook },
    rules: {
      ...storybook.configs['flat/recommended'].rules,
    },
  },
  {
    files: ['**/*.test.@(ts|tsx)'],
    languageOptions: {
      globals: globals.node,
    },
  },
  // Always last: turns off any stylistic ESLint rule that would fight
  // Prettier. Prettier owns formatting; ESLint owns correctness/a11y —
  // keeping that split is why `lint` and `format` are separate scripts
  // instead of one rule set trying to do both.
  prettier,
);
