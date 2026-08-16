import { create } from 'storybook/theming/create';

/**
 * Avian Dev Storybook theme.
 *
 * DECISION NEEDED: this uses the same placeholder blue as the token
 * palette (src/tokens/color.ts) and Storybook's stock wordmark as
 * `brandImage`. Swap both when the real brand lands:
 *
 *   1. Replace `colorPrimary`/`colorSecondary` with the real brand hex.
 *   2. Drop a logo at `.storybook/public/logo.svg` (SVG, transparent
 *      background, readable at ~30px tall) and point `brandImage` at
 *      `'./logo.svg'`.
 *   3. Replace `.storybook/public/favicon-placeholder.svg` with the
 *      real favicon and update the `<link>` in main.ts's
 *      `staticDirs`-served `manager-head.html` (see README).
 *
 * Nothing else in this file needs to change — every other repo's
 * Storybook (the widget kit, the 8 consuming projects) should import
 * this same theme once it's real, rather than re-deriving it, so all
 * ten Storybooks look like one product.
 */
export const avianDevTheme = create({
  base: 'light',

  brandTitle: 'Avian Dev — Design System',
  brandUrl: 'https://github.com/AvianDev1725',
  brandImage: undefined, // TODO: './logo.svg' once it exists
  brandTarget: '_self',

  colorPrimary: '#2563eb', // == palette.blue600 in src/tokens/color.ts
  colorSecondary: '#2563eb',

  appBg: '#f9fafb',
  appContentBg: '#ffffff',
  appBorderColor: '#e5e7eb',
  appBorderRadius: 8,

  fontBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode:
    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',

  textColor: '#111827',
  textInverseColor: '#ffffff',

  barTextColor: '#4b5563',
  barSelectedColor: '#2563eb',
  barBg: '#ffffff',

  inputBg: '#ffffff',
  inputBorder: '#d1d5db',
  inputTextColor: '#111827',
  inputBorderRadius: 6,
});
