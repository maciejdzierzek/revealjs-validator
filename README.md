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
| `valid-background-size` | warn | `data-background-size` must be valid CSS (cover, contain, length). |
| `valid-background-position` | warn | `data-background-position` must be valid CSS (top, center, length). |
| `valid-background-repeat` | warn | `data-background-repeat` must be: repeat, no-repeat, etc. |

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
| `r-stack-without-fragments` | warn | `r-stack` without fragment children — elements overlap. |

### Media

| Rule | Default | Description |
|------|---------|-------------|
| `no-src-and-data-src` | warn | Element has both `src` and `data-src` — likely a mistake. |
| `data-autoplay-on-media` | warn | `data-autoplay` only works on `<video>` and `<audio>`. |
| `data-preload-needs-data-src` | warn | `data-preload` on `<iframe>` with `src` has no effect. |
| `data-ignore-on-media` | warn | `data-ignore` only works on `<video>`, `<audio>`, `<iframe>`. |
| `valid-preview-fit` | warn | `data-preview-fit` must be: scale-down, contain, cover. |

### Structure

| Rule | Default | Description |
|------|---------|-------------|
| `no-inline-transition-css` | warn | Inline CSS `transition:` can conflict with auto-animate. |
| `no-display-none-on-section` | warn | Use `data-visibility="hidden"` instead of CSS display:none. |
| `valid-data-visibility` | error | `data-visibility` must be "hidden" or "uncounted". |
| `valid-autoslide-value` | error | `data-autoslide` must be a positive integer (milliseconds). |
| `vertical-slides-nesting` | error | Vertical slides must be exactly one level deep. |
| `markdown-requires-script` | error | `<section data-markdown>` requires `<script type="text/template">`. |
| `code-line-numbers-structure` | error | `data-line-numbers` must be on `<code>` inside `<pre>`. |
| `missing-slide-background` | warn | Slide has no `data-background-*` — Reveal.js can't detect luminance. |
| `notes-inside-section` | error | `<aside class="notes">` must be a direct child of `<section>`. |
| `valid-timing-value` | error | `data-timing` must be a positive number (seconds). |
| `duplicate-data-id` | error | Duplicate `data-id` in one slide — auto-animate can't match. |
| `data-line-numbers-format` | error | `data-line-numbers` must be valid format (1,3-5 or 1\|2-3). |
| `duplicate-notes` | warn | Slide has both `data-notes` and `<aside class="notes">`. |
| `data-autoslide-on-fragment` | warn | `data-autoslide` on non-fragment element has no effect. |
| `uncounted-not-at-end` | warn | `data-visibility="uncounted"` only works at the end. |
| `unknown-data-attribute` | warn | Unknown Reveal.js `data-*` attribute — likely a typo. |

### Links

| Rule | Default | Description |
|------|---------|-------------|
| `broken-slide-link` | warn | Internal slide link (`#/...`) has invalid format or target not found. |

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

### Config (JSON)

Validates Reveal.js configuration from JSON files. Auto-detects `"reveal"` key, or treats entire JSON as config.

| Rule | Default | Description |
|------|---------|-------------|
| `config-valid-transition` | error | `transition` must be: none, fade, slide, convex, concave, zoom. |
| `config-valid-transition-speed` | error | `transitionSpeed` must be: default, fast, slow. |
| `config-valid-background-transition` | error | `backgroundTransition` must use valid transition values. |
| `config-width-height-numeric` | error | `width` and `height` must be positive numbers (pixels). |
| `config-margin-range` | error | `margin` must be between 0.0 and 1.0. |
| `config-min-max-scale` | error | `minScale`/`maxScale` must be positive, minScale < maxScale. |
| `config-auto-slide-numeric` | error | `autoSlide` must be non-negative number (ms). 0 = disabled. |
| `config-navigation-mode` | error | `navigationMode` must be: default, linear, grid. |
| `config-view-mode` | error | `view` must be "scroll" or omitted. |

```bash
# Validate config alongside slides and CSS
revealjs-validator "slides/*.html" "theme/*.css" config.json

# Custom key path for non-standard JSON structures
revealjs-validator --reveal-key "presentation.settings" config.json
```

## Pre-commit hook

Validate only staged files — perfect for git pre-commit hooks:

```bash
revealjs-validator --staged
```

Returns exit 0 if no staged `.html`/`.css` files (nothing to validate). Returns exit 1 if any errors found — blocks the commit.

Example `.githooks/pre-commit`:

```sh
#!/bin/sh
npx revealjs-validator --staged
if [ $? -ne 0 ]; then
  echo "Fix Reveal.js errors before committing."
  exit 1
fi
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
