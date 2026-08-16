import type { Preview } from '@storybook/react-vite';
// The same stylesheet consuming apps import once at their root — loading
// it here means every story renders with the real tokens, not
// browser-default styling standing in for them.
import '../src/tokens/tokens.css';
// Self-hosted for Storybook's own canvas only — see the comment on
// fontFamily.sans in src/tokens/typography.ts for why this package
// doesn't ship this import to consumers.
import '@fontsource-variable/inter';
import './globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo'  — surface violations in the addon panel only.
      // 'error' — fail the story/CI on any violation.
      // 'off'   — skip entirely (should never be needed; if a rule is
      //           wrong for a specific story, scope a disable to that
      //           story's parameters instead of turning this off).
      //
      // Different mode per context, on purpose: browsing Storybook
      // interactively should never punish you mid-sketch, but the real
      // point of wiring Playwright (npm run test:storybook) is to fail
      // on violations — jsdom's unit tests can't reliably catch
      // contrast issues (see README), a real browser can.
      //
      // This file runs inside an actual browser page under the
      // 'storybook' Vitest project (no Node `process` global there),
      // so the check has to be `import.meta.env.VITEST` — the
      // Vite-level define Vitest substitutes at build time — not
      // `process.env.VITEST`, which only exists in the Node-based
      // 'unit' project.
      test: import.meta.env?.VITEST ? 'error' : 'todo',
    },
    backgrounds: {
      // Placeholder brand palette — swap once the real Avian Dev
      // background colors are chosen (see README, "npm scope & brand
      // palette").
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
};

export default preview;
