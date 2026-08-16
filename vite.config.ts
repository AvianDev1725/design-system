/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// Library-mode Vite config — this repo ships a package, not an app, so
// there's no `dev`/`preview` app server here. Local development happens
// in Storybook (`npm run storybook`); this config's job is `build` and
// `test`.
//
// Storybook's Vite builder also loads this file and merges it into its
// own build — that's how preview.tsx's token import and the component
// CSS get picked up. `isLibraryBuild` keeps the parts that are only
// meaningful for `npm run build` (declaration bundling, the raw
// tokens.css copy, lib-mode output) out of Storybook's build, which
// doesn't need any of them and was otherwise redoing that work on every
// `storybook build`.
const isLibraryBuild = process.env.npm_lifecycle_event === 'build';

export default defineConfig({
  plugins: [
    react(),
    isLibraryBuild &&
      // Bundles every component's .d.ts into one dist/design-system.d.ts
      // instead of mirroring the src/ tree — one file for consumers'
      // editors to resolve, and internal file moves don't touch the
      // public type surface.
      dts({
        // Vite's scaffold splits config across tsconfig.json (project
        // references only) / tsconfig.app.json (src/) / tsconfig.node.json
        // (build tooling, e.g. this file). Without pointing dts explicitly
        // at the app config, it resolves the root tsconfig.json's
        // references and pulls tsconfig.node's files (vite.config.ts
        // itself) into the declaration rollup, which then fails.
        tsconfigPath: './tsconfig.app.json',
        include: ['src'],
        exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/test/**'],
        rollupTypes: true,
      }),
    isLibraryBuild &&
      // tokens.css is deliberately NOT imported from src/index.ts (see
      // that file) — it's a separate opt-in stylesheet, so it's copied
      // through verbatim rather than going through the JS bundle.
      viteStaticCopy({
        targets: [
          {
            src: 'src/tokens/tokens.css',
            dest: '.',
            // Without this, the plugin preserves the source's directory
            // structure (dist/src/tokens/tokens.css) instead of
            // flattening to dist root — `stripBase` is what actually
            // flattens it.
            rename: { stripBase: true },
          },
        ],
      }),
  ],
  build: {
    lib: isLibraryBuild
      ? {
          entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
          formats: ['es', 'cjs'],
          fileName: (format) =>
            `design-system.${format === 'es' ? 'mjs' : 'cjs'}`,
          // Component CSS (CSS Modules) bundles into this one file;
          // consumers import it once alongside tokens.css — see README
          // "Using this package".
          cssFileName: 'style',
        }
      : undefined,
    rollupOptions: {
      // React is a peer dependency, not bundled — a component library
      // that ships its own React copy breaks on hooks (two React
      // instances) in the consuming app. Storybook needs its own copy
      // to actually render, so this only applies to the library build.
      external: isLibraryBuild
        ? ['react', 'react-dom', 'react/jsx-runtime']
        : [],
    },
    sourcemap: true,
    // Keep failed builds loud: an accidental non-tree-shakeable import
    // (e.g. a whole icon set) should fail CI's build step, not silently
    // bloat every consumer's bundle. Storybook's own bundle is
    // legitimately larger (addons, docs renderer), so this only applies
    // to the library build.
    chunkSizeWarningLimit: isLibraryBuild ? 100 : 500,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    exclude: ['node_modules/**', 'dist/**', '.storybook/**'],
    coverage: {
      provider: 'v8',
      // 'lcov' is what the Jenkins pipeline's SonarQube stage reads
      // (sonar-project.properties' sonar.javascript.lcov.reportPaths).
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/test/**'],
    },
  },
});
