import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { Button } from './Button';

describe('Button', () => {
  it('renders its label and responds to a click', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Save changes</Button>);

    const button = screen.getByRole('button', { name: 'Save changes' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is reachable and activatable by keyboard alone', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveFocus();

    await user.keyboard('{Enter}');
    await user.keyboard('{ }');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('removes disabled buttons from the tab order and blocks clicks', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button disabled onClick={onClick}>
        Save changes
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button).toBeDisabled();

    await user.tab();
    expect(button).not.toHaveFocus();
  });

  it('marks loading buttons aria-busy but keeps them focusable', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Button isLoading onClick={onClick}>
        Saving…
      </Button>,
    );

    const button = screen.getByRole('button', { name: 'Saving…' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).not.toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('warns in dev when rendered with no accessible name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Button />);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no visible text and no aria-label'),
    );
    warn.mockRestore();
  });

  it('has no axe violations across variants and states', async () => {
    const { container } = render(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button isLoading>Loading</Button>
        <Button disabled>Disabled</Button>
        <Button aria-label="Close dialog">✕</Button>
      </>,
    );

    const results = await axe.run(container);
    expect(results.violations).toEqual([]);
  });
});
