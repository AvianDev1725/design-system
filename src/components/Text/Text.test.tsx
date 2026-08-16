import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Text } from './Text';

describe('Text', () => {
  it('renders a <p> by default', () => {
    render(<Text>Body copy</Text>);
    const el = screen.getByText('Body copy');
    expect(el.tagName).toBe('P');
  });

  it('renders the element requested via `as`', () => {
    render(
      <Text as="label" htmlFor="email">
        Email
      </Text>,
    );
    const el = screen.getByText('Email');
    expect(el.tagName).toBe('LABEL');
    expect(el).toHaveAttribute('for', 'email');
  });

  it('has no axe violations across size/weight/color combinations', async () => {
    const { container } = render(
      <>
        <Text size="xs" color="secondary">
          Small secondary
        </Text>
        <Text size="lg" weight="bold" color="primary">
          Large bold primary
        </Text>
        <Text color="danger">Danger text</Text>
      </>,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
