import type { HTMLAttributes, ReactNode } from 'react';
import type { FontSizeToken } from '../../tokens';
import styles from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

const DEFAULT_SIZE_BY_LEVEL: Record<HeadingLevel, FontSizeToken> = {
  1: '3xl',
  2: '2xl',
  3: 'xl',
  4: 'lg',
  5: 'md',
  6: 'sm',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantic heading level — required, deliberately with no default.
   * This renders `<h1>`–`<h6>` and nothing else; picking it forces a
   * conscious decision about where this heading sits in the page's
   * outline, instead of silently defaulting to (usually wrong) `<h2>`.
   */
  level: HeadingLevel;
  /**
   * Visual size, independent of `level`. Defaults to the size that
   * matches `level`, but a component doesn't know the surrounding
   * page's outline — a section might correctly need an `<h2>` that's
   * styled smaller than the `<h3>`s inside it. Override this rather
   * than reaching for the wrong `level` to get a visual effect.
   */
  size?: FontSizeToken;
  children: ReactNode;
}

/**
 * Accessible heading primitive.
 *
 * Renders a real `<h1>`–`<h6>` (never a styled `<div>`) so screen
 * reader users can navigate by heading — the single highest-impact
 * accessibility feature of a heading component, and the reason
 * `level` isn't optional. What this component can't do is see the
 * rest of the page, so it can't stop you from skipping a level; that
 * check belongs to the app assembling the page, not this component.
 */
export function Heading({
  level,
  size = DEFAULT_SIZE_BY_LEVEL[level],
  className,
  children,
  ...rest
}: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={[styles.heading, styles[`text-${size}`], className ?? '']
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
