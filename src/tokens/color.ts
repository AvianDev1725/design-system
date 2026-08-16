/**
 * Color tokens — the single source of truth for every color used by
 * @avian-dev/design-system components.
 *
 * Two layers on purpose:
 *  - `palette`  — raw, context-free color values (never reference these
 *                 directly from a component).
 *  - `color`    — semantic aliases ("what is this color *for*") that
 *                 components and consuming apps should actually use.
 *
 * Why semantic aliases: when the Avian Dev brand palette lands, only this
 * file changes. Components that consumed `color.brand.default` never
 * touch a hex code and never need to be re-reviewed for contrast.
 *
 * Contrast note: `color.text.*` on `color.surface.*` pairings are chosen
 * to clear WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text/UI
 * components). If you add a new pairing, re-check it — don't assume.
 */

export const palette = {
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue300: '#93c5fd',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue900: '#1e3a8a',

  gray0: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  gray950: '#030712',

  red100: '#fee2e2',
  red600: '#dc2626',
  red700: '#b91c1c',

  green100: '#dcfce7',
  green600: '#16a34a',
  green700: '#15803d',
} as const;

/**
 * Placeholder brand ramp. TODO(brand): replace `blue*` references below
 * with the real Avian Dev brand color once it's chosen — see the "npm
 * scope & brand palette" decision flagged in the README.
 */
export const color = {
  brand: {
    default: palette.blue600,
    hover: palette.blue700,
    active: palette.blue900,
    subtle: palette.blue50,
    border: palette.blue300,
  },
  text: {
    primary: palette.gray900,
    secondary: palette.gray600,
    onBrand: palette.gray0,
    disabled: palette.gray400,
    danger: palette.red700,
  },
  surface: {
    default: palette.gray0,
    subtle: palette.gray50,
    sunken: palette.gray100,
    inverse: palette.gray900,
  },
  border: {
    default: palette.gray300,
    strong: palette.gray400,
    focus: palette.blue500,
  },
  status: {
    dangerBg: palette.red100,
    dangerText: palette.red700,
    dangerBorder: palette.red600,
    successBg: palette.green100,
    successText: palette.green700,
    successBorder: palette.green600,
  },
} as const;

export type ColorToken = typeof color;
