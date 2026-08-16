// Public API surface of @avian-dev/design-system.
//
// Every export a consuming project can import lives on this barrel.
// Nothing under src/ is reachable from outside unless it's re-exported
// here — that's what keeps the package's public contract intentional
// instead of "whatever the file tree happens to expose."

export * from './tokens';

export * from './components/Button';

// Raw CSS custom properties. Not re-exported through JS — consumers
// import the stylesheet directly once, at their app root:
//
//   import '@avian-dev/design-system/tokens.css';
//
// See vite.config.ts (this repo) for how `tokens.css` is published
// alongside the JS bundle, and the README's "Using this package" section
// for the consumer-side setup.
