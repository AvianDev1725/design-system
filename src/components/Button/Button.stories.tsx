import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    // Component-specific a11y config layered on top of the global rules
    // in .storybook/preview.tsx. `false` here just means "no extra
    // rules beyond the defaults" — it does not disable the addon.
    a11y: { config: {} },
    docs: {
      description: {
        component:
          'Accessible button primitive: native `<button>` semantics, ' +
          'visible keyboard focus, and an enforced accessible name. See ' +
          '[Button.tsx](?path=/docs/components-button--docs) for the full ' +
          'a11y contract.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'danger'],
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  args: {
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Save changes',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Cancel',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete project',
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Saving…',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Stays focusable and announces `aria-busy` instead of ' +
          'vanishing from the tab order the way `disabled` would.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Save changes',
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

/**
 * Fails the a11y addon on purpose: an icon-only button (an SVG child,
 * no text) with no `aria-label`. A literal `✕` character would NOT
 * demonstrate this — text content, even a single glyph, already counts
 * as an accessible name — so this uses a real icon element instead,
 * the shape a real icon-only button actually takes.
 *
 * `tags: ['!test']` excludes this from the automated `npm run
 * test:storybook` run (see vite.config.ts's 'storybook' project) —
 * without it, this story's `a11y.test: 'error'` override would fail
 * CI *forever*, on purpose, which defeats the point of CI. It still
 * renders in Storybook itself, where the a11y addon panel shows the
 * violation live — that's what this story is for.
 */
export const IconOnlyMissingLabel: Story = {
  tags: ['!test'],
  args: {
    variant: 'secondary',
    'aria-label': undefined,
    children: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M4 4l8 8m0-8l-8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  parameters: {
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        story:
          '⚠️ Intentionally inaccessible — demonstrates what the a11y ' +
          'addon catches. Real icon-only buttons must pass `aria-label`.',
      },
    },
  },
};
