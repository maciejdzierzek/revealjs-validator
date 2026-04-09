# revealjs-validator

Static HTML validator for [Reveal.js](https://revealjs.com/) presentations. Catches common mistakes like using CSS backgrounds instead of `data-background-color`, missing auto-animate pairs, invalid transition values, and more.

All rules are derived from the [official Reveal.js documentation](https://revealjs.com/). No opinions, no style enforcement - just what Reveal.js actually requires to work correctly.

## Why

Reveal.js slides fail silently. A `<section style="background: red">` looks fine in the browser, but Reveal.js doesn't control that background - it only fills the content area, not the full viewport. There's no compiler, no linter, nothing tells you it's wrong.

This validator is that missing compiler.

## Install

```bash
npm install --save-dev revealjs-validator
```

## Usage

### CLI

```bash
# Validate all slide files
npx revealjs-validator "slides/*.html"

# JSON output for CI
npx revealjs-validator --format json "slides/**/*.html"

# Use custom config
npx revealjs-validator --config .revealjs-validator.json "slides/*.html"

# List all available rules
npx revealjs-validator --list-rules
```

### Programmatic API

```typescript
import { validate, validateFile } from 'revealjs-validator';

// Validate HTML string
const result = validate('<section style="background: red;">Bad</section>');
console.log(result.passed);  // false
console.log(result.errors);  // [{ ruleId: 'no-css-background-on-section', ... }]

// Validate file
const fileResult = validateFile('slides/slide-01.html');

// With config overrides
const custom = validate(html, {
  rules: { 'background-video-flags': 'off' }
});
```

## Rules

Every rule references the official Reveal.js documentation. No rule exists without a citation.

### Backgrounds

| Rule | Default | Description |
|------|---------|-------------|
| `no-css-background-on-section` | error | `<section>` must not use inline CSS background. Use `data-background-color`, `data-background-image`, or `data-background-gradient`. |
| `valid-background-attributes` | error | `data-background-*` attributes are only valid on `<section>` elements. |
| `background-opacity-range` | error | `data-background-opacity` must be between 0 and 1. |
| `background-video-flags` | warn | `data-background-video-loop/muted` require `data-background-video`. |
| `background-interactive-requires-iframe` | warn | `data-background-interactive` requires `data-background-iframe`. |

*More rule categories coming: auto-animate, transitions, fragments, layout, media, structure.*

## Configuration

Create a `.revealjs-validator.json` in your project root:

```json
{
  "rules": {
    "background-video-flags": "off",
    "no-css-background-on-section": "warn"
  },
  "ignore": [
    "slides/legacy-*.html"
  ]
}
```

Each rule can be set to `"error"`, `"warn"`, or `"off"`. Without a config file, all rules default to their built-in severity.

## Source of truth

Rules are derived exclusively from the official Reveal.js documentation, stored in `docs/source/` as a mechanical conversion (curl + pandoc, zero AI editing). Each rule implementation includes a reference to the specific documentation section.

## License

MIT
