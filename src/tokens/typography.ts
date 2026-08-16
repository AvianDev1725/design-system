/**
 * Typography tokens.
 *
 * `fontFamily.sans` defaults to the system font stack so every consuming
 * project renders correctly with zero setup and no font-loading
 * flash/CLS — a deliberate SEO/perf-friendly default. When the Avian Dev
 * brand typeface is chosen, add it as the first entry in the stack; the
 * system fallback keeps working if the webfont fails to load.
 */
export const fontFamily = {
  sans: [
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
