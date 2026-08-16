import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  /** Visual style. Defaults to `'primary'`. */
  variant?: ButtonVariant;
  /** Sizing. Defaults to `'md'`. */
  size?: ButtonSize;
  /**
   * Marks the button as awaiting an async action. Keeps it focusable
   * (unlike `disabled`) but exposes `aria-busy` and blocks re-activation,
   * so assistive tech announces "busy" instead of the control silently
   * disappearing from the tab order.
   */
  isLoading?: boolean;
  /** Stretches the button to the width of its container. */
  fullWidth?: boolean;
  /** `<button type="...">` — defaults to `'button'` to avoid accidental
   * form submits, the most common source of surprise navigation. Pass
   * `'submit'` explicitly for form actions. */
  type?: 'button' | 'submit' | 'reset';
  children?: ReactNode;
}

/**
 * Accessible button primitive.
 *
 * - Renders a native `<button>` so keyboard activation (Space/Enter),
 *   focus order, and the implicit `role="button"` come from the
 *   platform instead of being reimplemented.
 * - `disabled` uses the native attribute (correctly removes the control
 *   from the tab order); `isLoading` intentionally does not, so a
 *   screen reader user isn't left wondering where the control went.
 * - Focus is indicated with `:focus-visible` (keyboard/programmatic
 *   focus only) via `--ads-focus-ring`, never suppressed.
 * - Icon-only usage (no text `children`) requires `aria-label` — see
 *   the dev-time warning below. This is enforced, not just documented,
 *   because a missing accessible name is invisible in a visual review.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      type = 'button',
      disabled,
      className,
      children,
      onClick,
      ...rest
    },
    ref,
  ) => {
    if (import.meta.env?.DEV && !children && !rest['aria-label']) {
      console.warn(
        '[@avian-dev/design-system] Button rendered with no visible text ' +
          'and no aria-label. Every button needs an accessible name — ' +
          'pass children or aria-label (e.g. an icon-only close button).',
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        className={[
          styles.button,
          styles[variant],
          styles[size],
          fullWidth ? styles.fullWidth : '',
          className ?? '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
        aria-busy={isLoading || undefined}
        aria-disabled={isLoading && !disabled ? true : undefined}
        {...rest}
        onClick={isLoading ? undefined : onClick}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={styles.label}>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
