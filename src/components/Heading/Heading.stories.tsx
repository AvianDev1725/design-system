import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './Heading';

const meta = {
  title: 'Components/Heading',
  component: Heading,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`level` is required and always renders the matching `<h1>`–' +
          '`<h6>` — `size` is a separate, optional visual override. See ' +
          '[Heading.tsx](?path=/docs/components-heading--docs) for why ' +
          'those are two different props.',
      },
    },
  },
  argTypes: {
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
  },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllLevels: Story = {
  args: { level: 1, children: 'Heading' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
      <Heading level={4}>Heading level 4</Heading>
      <Heading level={5}>Heading level 5</Heading>
      <Heading level={6}>Heading level 6</Heading>
    </div>
  ),
};

export const SizeIndependentOfLevel: Story = {
  args: { level: 2, size: 'sm', children: 'An h2 that reads small' },
  parameters: {
    docs: {
      description: {
        story:
          'Semantically an `<h2>` (correct place in the outline); ' +
          'visually sized like an `<h6>` — that split is the point of ' +
          'having a separate `size` prop.',
      },
    },
  },
};

export const Playground: Story = {
  args: { level: 2, children: 'Section title' },
};
