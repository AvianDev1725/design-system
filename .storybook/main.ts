import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    // Flags WCAG violations live in the story canvas via axe-core —
    // this is the a11y requirement from the project brief.
    '@storybook/addon-a11y',
    // Auto-generates the "Docs" tab (props table, description comments)
    // from each component's TS types — this is where "documented in
    // Storybook" comes from without hand-written prop tables.
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  // Avian Dev logo/favicon files live here once they exist — see
  // manager.ts, which points the toolbar brand image at
  // `public/logo.svg`. Storybook copies everything in this directory to
  // the built site's root, so `/favicon.svg` below resolves once you
  // add manager-head.html or update vite's index.html favicon link.
  staticDirs: ['./public'],
  typescript: {
    // Emits real prop tables (types, JSDoc descriptions, required/
    // optional) in the Docs tab instead of Storybook's looser runtime
    // prop-shape inference.
    reactDocgen: 'react-docgen-typescript',
  },
};
export default config;
