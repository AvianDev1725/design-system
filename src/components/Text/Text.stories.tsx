import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './Text';

const meta = {
  title: 'Components/Text',
  component: Text,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    as: { control: 'inline-radio', options: ['p', 'span', 'div', 'label'] },
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    weight: {
      control: 'inline-radio',
      options: ['regular', 'medium', 'semibold', 'bold'],
    },
    color: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'disabled', 'danger'],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children:
      'Body copy renders off the same type scale and tokens as every ' +
      'other component — resize the browser and this still scales ' +
      'correctly (WCAG 1.4.4).',
  },
};

export const Sizes: Story = {
  args: { children: 'size samples below' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const).map((size) => (
        <Text key={size} size={size}>
          {size} — The quick brown fox jumps over the lazy dog.
        </Text>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  args: { children: 'color samples below' },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Text color="primary">Primary — default body text</Text>
      <Text color="secondary">Secondary — de-emphasized text</Text>
      <Text color="disabled">Disabled — matches disabled control text</Text>
      <Text color="danger">Danger — error / validation message</Text>
    </div>
  ),
};
