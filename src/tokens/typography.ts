/**
 * Typography tokens.
 *
 * `fontFamily.sans` names **Inter** as the brand typeface (a well-tested
 * default: free, variable-weight, wide language coverage — swap it here
 * if a different typeface gets chosen later; every component reads this
 * token, never a literal font name). The system stack after it is a
 * real fallback, not decoration — it's what renders during the brief
 * window before the webfont loads, and what renders forever if it
 * doesn't.
 *
 * This package intentionally does NOT ship font files or a `@font-face`
 * rule — only the name. Loading strategy is left to each consumer
 * because it differs by context and the "best" choice is app-specific:
 *   - The 8 consuming apps are Next.js — use `next/font/google` (or
 *     `next/font/local` for a self-hosted copy), which self-hosts,
 *     preloads, and sets `font-display` automatically. That's a better
 *     result than this package could give by shipping font files
 *     directly into every consumer's bundle.
 *   - This repo's own Storybook is not a Next.js app, so it loads the
 *     font itself via `@fontsource-variable/inter` — see
 *     .storybook/preview.tsx. That's local to Storybook's dev
 *     experience, not part of the published package.
 */
export const fontFamily = {
  sans: [
    'InterVariable',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(', '),
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    '"SF Mono"',
    'Menlo',
    'Consolas',
    'monospace',
  ].join(', '),
} as const;

/** Type scale — a 1.25 (major third) ratio off a 16px base. */
export const fontSize = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  md: '1rem', // 16px — base
  lg: '1.25rem', // 20px
  xl: '1.5625rem', // 25px
  '2xl': '1.953rem', // ~31px
  '3xl': '2.441rem', // ~39px
} as const;

export type FontSizeToken = keyof typeof fontSize;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeightToken = keyof typeof fontWeight;

/**
 * Line heights as unitless ratios (not px) so they scale correctly with
 * user font-size overrides — a WCAG 1.4.4 (resize text) consideration.
 */
export const lineHeight = {
  tight: '1.2',
  normal: '1.5',
  relaxed: '1.7',
} as const;

export type LineHeightToken = keyof typeof lineHeight;
