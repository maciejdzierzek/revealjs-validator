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

### Auto-Animate

| Rule | Default | Description |
|------|---------|-------------|
| `auto-animate-pairs` | error | `data-auto-animate` needs an adjacent slide with the same attribute. |
| `auto-animate-on-section` | error | `data-auto-animate` is only valid on `<section>` elements. |
| `data-id-needs-auto-animate` | warn | `data-id` in a slide without `data-auto-animate` has no effect. |
| `data-id-inline-styles` | warn | Elements with `data-id` should use inline `style=` for animated properties. |
| `auto-animate-delay-not-on-section` | error | `data-auto-animate-delay` only works on child elements, not `<section>`. |
| `auto-animate-restart-needs-auto-animate` | warn | `data-auto-animate-restart` without `data-auto-animate` has no effect. |
| `auto-animate-id-needs-auto-animate` | warn | `data-auto-animate-id` without `data-auto-animate` has no effect. |

### Transitions

| Rule | Default | Description |
|------|---------|-------------|
| `valid-transition-values` | error | `data-transition` must use valid values: none, fade, slide, convex, concave, zoom. |
| `valid-transition-speed` | error | `data-transition-speed` must be: default, fast, or slow. |
| `transition-on-section` | error | `data-transition` and `data-transition-speed` are only valid on `<section>`. |

### Fragments

| Rule | Default | Description |
|------|---------|-------------|
| `valid-fragment-classes` | error | Fragment effect classes require the base `fragment` class. |
| `known-fragment-effect` | warn | Unknown fragment effect class without `custom` — might be a typo. |
| `fragment-index-numeric` | error | `data-fragment-index` must be a non-negative integer. |
| `fragment-index-needs-fragment` | warn | `data-fragment-index` without the `fragment` class has no effect. |

### Layout

| Rule | Default | Description |
|------|---------|-------------|
| `r-stretch-single` | error | Only one `r-stretch` element per slide. |
| `r-stretch-direct-child` | error | `r-stretch` must be a direct child of `<section>`. |
| `no-height-top-on-section` | warn | `<section>` should not have inline height/top/bottom. |

### Media

| Rule | Default | Description |
|------|---------|-------------|
| `no-src-and-data-src` | warn | Element has both `src` and `data-src` — likely a mistake. |
| `data-autoplay-on-media` | warn | `data-autoplay` only works on `<video>` and `<audio>`. |
| `data-preload-needs-data-src` | warn | `data-preload` on `<iframe>` with `src` has no effect. |

### Structure

| Rule | Default | Description |
|------|---------|-------------|
| `no-inline-transition-css` | warn | Inline CSS `transition:` can conflict with auto-animate. |
| `no-display-none-on-section` | warn | Use `data-visibility="hidden"` instead of CSS display:none. |
| `valid-data-visibility` | error | `data-visibility` must be "hidden" or "uncounted". |

### CSS (theme files)

Validates `.css` files alongside HTML slides. Pass CSS files directly or mix with HTML globs.

| Rule | Default | Description |
|------|---------|-------------|
| `css-no-background-on-reveal` | error | CSS background on `.reveal` or `.reveal-viewport` hides it from Reveal.js. |
| `css-no-background-on-section` | error | CSS background on section selectors conflicts with `data-background-*`. |
| `css-no-transition-on-animated` | warn | CSS `transition` can conflict with auto-animate transitions. |
| `css-no-dead-keyframes` | warn | Unused `@keyframes` — not referenced by any animation in the file. |

```bash
# Validate both HTML and CSS
revealjs-validator "slides/*.html" "theme/*.css"
```

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
