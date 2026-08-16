/**
 * Spacing scale — a 4px base unit, exposed as a numeric ramp so components
 * can do math on it (`spacing[2] * 1.5`) and consumers can read it as
 * "steps," not magic pixel values.
 *
 * A single base unit keeps every gap, padding, and margin in the system
 * visually related. If a component needs a value that isn't on this
 * scale, that's a signal to reconsider the layout, not to reach for an
 * arbitrary number.
 */
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
} as const;

export type SpacingToken = keyof typeof spacing;

/** Corner radii, kept separate from spacing since they scale differently. */
export const radius = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export type RadiusToken = keyof typeof radius;
