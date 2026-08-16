import type { HTMLAttributes, ReactNode } from 'react';
import type { FontSizeToken, FontWeightToken } from '../../tokens';
import styles from './Text.module.css';

export type TextColor = 'primary' | 'secondary' | 'disabled' | 'danger';
export type TextElement = 'p' | 'span' | 'div' | 'label';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render. Defaults to `'p'`. Use `'span'` for inline
   * text, `'label'` when pairing with a form control. */
  as?: TextElement;
  size?: FontSizeToken;
  weight?: FontWeightToken;
  /** Maps to the `color.text.*` tokens — never pass a raw color. */
  color?: TextColor;
  /** Only meaningful with `as="label"` — kept as a named prop rather
   * than going fully polymorphic-generic on `as`, which isn't worth the
   * type complexity for four possible elements. */
  htmlFor?: string;
  children: ReactNode;
}

/**
 * Body-copy primitive. Everything renders off the typography tokens
 * (`var(--ads-font-*)`) so resizing text (WCAG 1.4.4) and swapping the
 * brand typeface both stay a token-file change, not a component audit.
 */
export function Text({
  as: Component = 'p',
  size = 'md',
  weight = 'regular',
  color = 'primary',
  className,
  children,
  ...rest
}: TextProps) {
  return (
    <Component
      className={[
        styles.text,
        styles[`text-${size}`],
        styles[`weight-${weight}`],
        styles[`color-${color}`],
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Component>
  );
}
