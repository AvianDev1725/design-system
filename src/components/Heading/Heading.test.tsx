import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { Heading } from './Heading';

describe('Heading', () => {
  it.each([1, 2, 3, 4, 5, 6] as const)(
    'renders level %i as a real <h%i>',
    (level) => {
      render(<Heading level={level}>Title</Heading>);
      const heading = screen.getByRole('heading', {
        level,
        name: 'Title',
      });
      expect(heading.tagName).toBe(`H${level}`);
    },
  );

  it('lets size diverge from level without changing the element', () => {
    render(
      <Heading level={2} size="sm">
        Small h2
      </Heading>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.tagName).toBe('H2');
  });

  it('has no axe violations across all levels', async () => {
    const { container } = render(
      <>
        <Heading level={1}>One</Heading>
        <Heading level={2}>Two</Heading>
        <Heading level={3}>Three</Heading>
      </>,
    );
    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
