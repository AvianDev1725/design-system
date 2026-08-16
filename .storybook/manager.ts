import { addons } from 'storybook/manager-api';
import { avianDevTheme } from './theme.js';

// Controls the Storybook *chrome* (sidebar, toolbar) — separate from
// preview.tsx, which controls the story canvas. Both need branding for
// Storybook to stop looking like default Storybook.
addons.setConfig({
  theme: avianDevTheme,
});
