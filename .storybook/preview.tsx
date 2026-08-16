import type { Preview } from '@storybook/react-vite';
// The same stylesheet consuming apps import once at their root — loading
// it here means every story renders with the real tokens, not
// browser-default styling standing in for them.
import '../src/tokens/tokens.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo'  — surface violations in the addon panel only (default
      //           here, so scaffolding a new component never breaks CI).
      // 'error' — fail the story/CI on any violation.
      // 'off'   — skip entirely (should never be needed; if a rule is
      //           wrong for a specific story, scope a disable to that
      //           story's parameters instead of turning this off).
      //
      // Flip the project default to 'error' once the initial component
      // set is past the sketch phase — see README "before you scale
      // past this component."
      test: 'todo',
    },
    backgrounds: {
      // Placeholder brand palette — swap once the real Avian Dev
      // background colors are chosen (see README, "npm scope & brand
      // palette").
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#111827' },
      ],
    },
  },
};

export default preview;
