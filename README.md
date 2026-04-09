# revealjs-validator

Static HTML validator for [Reveal.js](https://revealjs.com/) presentations. Catches common mistakes like using CSS backgrounds instead of `data-background-color`, missing auto-animate pairs, invalid transition values, dead CSS, and more.

All 66 rules are derived from the [official Reveal.js documentation](https://revealjs.com/). No opinions, no style enforcement — just what Reveal.js actually requires to work correctly.

## Why

Reveal.js slides fail silently. A `<section style="background: red">` looks fine in the browser, but Reveal.js doesn't control that background — it only fills the content area, not the full viewport. There's no compiler, no linter, nothing tells you it's wrong.

This validator is that missing compiler.

## Install

```bash
npm install --save-dev revealjs-validator
```

## Quick start

```bash
# Validate slides + theme CSS + config
npx revealjs-validator "slides/*.html" "theme/*.css" config.json

# Cross-file validation (whole presentation)
npx revealjs-validator --project path/to/presentation/

# Auto-fix what can be fixed
npx revealjs-validator --fix "slides/*.html" "theme/*.css"

# Compact summary grouped by rule
npx revealjs-validator --summary --project path/to/presentation/
```

## CLI

```bash
# Validate all slide files
npx revealjs-validator "slides/*.html"

# JSON output for CI
npx revealjs-validator --format json "slides/**/*.html"

# Use custom config
npx revealjs-validator --config .revealjs-validator.json "slides/*.html"

# List all available rules
npx revealjs-validator --list-rules

# Validate only staged files (for pre-commit hooks)
npx revealjs-validator --staged

# Auto-fix staged files and re-add to staging
npx revealjs-validator --staged --fix

# Dry run — show what --fix would change without modifying files
npx revealjs-validator --fix --dry-run "slides/*.html"
```

## Auto-fix

10 rules support automatic fixing with `--fix`:

```bash
npx revealjs-validator --fix "slides/*.html" "theme/*.css"
npx revealjs-validator --fix --dry-run "slides/*.html"   # preview without saving
```

Fixable rules: `no-css-background-on-section`, `missing-slide-background`, `css-no-background-on-reveal`, `css-no-dead-keyframes`, `background-video-flags`, `background-interactive-requires-iframe`, `no-display-none-on-section`, `no-src-and-data-src`, `valid-fragment-classes`, `fragment-index-needs-fragment`.

## Project mode (cross-file validation)

Validate an entire presentation directory — checks relationships between slides, CSS, config, and assets:

```bash
npx revealjs-validator --project path/to/presentation/
npx revealjs-validator --summary --project path/to/presentation/
```

Auto-detects `config.json` with a `slides` array. Falls back to alphabetical `.html` files in `slides/`.

### Cross-file rules (5)

| Rule | Default | Description |
|------|---------|-------------|
| `cross-auto-animate-pairs` | error | Validates `data-auto-animate` and `data-id` continuity between consecutive slides. Chains supported. |
| `cross-css-classes-used` | warn | Classes in slide HTML not defined in any theme CSS — typo or missing style. |
| `cross-css-classes-defined` | warn | Classes in theme CSS not used in any slide HTML — dead code after redesign. |
| `cross-missing-bg-with-css` | warn | Slide without `data-background-*` when CSS has no global background — will be white. |
| `cross-assets-exist` | error | Asset paths in `src`, `data-background-image`, etc. must exist on disk. |

### Platform base CSS

If your CSS is split into platform styles (shared across presentations) and theme styles (per presentation), configure `css-base-files` so the validator knows which files provide classes but shouldn't be checked for dead code:

```json
{
  "crosscheck": {
    "css-base-files": [
      "shared/css/base.css",
      "shared/css/quiz.css"
    ]
  }
}
```

Base files provide classes to `cross-css-classes-used` (no false "class not found" warnings) but are excluded from `cross-css-classes-defined` and per-file CSS rules.

## Programmatic API

```typescript
import { validate, validateFile, validateCSS, validateProject } from 'revealjs-validator';

// Validate HTML string
const result = validate('<section style="background: red;">Bad</section>');
console.log(result.passed);  // false
console.log(result.errors);  // [{ ruleId: 'no-css-background-on-section', ... }]

// Validate file
const fileResult = validateFile('slides/slide-01.html');

// Validate CSS
const cssResult = validateCSS('.reveal { background: #000; }');

// Validate entire project (cross-file)
const projectResult = validateProject('path/to/presentation/', {
  rules: { 'missing-slide-background': 'off' },
  crosscheck: { 'css-base-files': ['shared/base.css'] },
});

// Auto-fix
import { fixFile } from 'revealjs-validator';
const fixResult = fixFile('slides/slide-01.html');
console.log(fixResult.fixed);   // true/false
console.log(fixResult.applied); // ['no-css-background-on-section', ...]
```

## Pre-commit hook

Validate only staged files — blocks commit on errors:

```bash
npx revealjs-validator --staged
npx revealjs-validator --staged --fix  # fix and re-stage
```

Example `.githooks/pre-commit`:

```sh
#!/bin/sh
npx revealjs-validator --staged
if [ $? -ne 0 ]; then
  echo "Fix Reveal.js errors before committing."
  exit 1
fi
```

## Rules (66)

Every rule references the official Reveal.js documentation. No rule exists without a citation. Every violation includes a `Fix:` hint telling you exactly what to change.

### Backgrounds (8)

| Rule | Default | Description |
|------|---------|-------------|
| `no-css-background-on-section` | error | `<section>` must not use inline CSS background. Use `data-background-color`. |
| `valid-background-attributes` | error | `data-background-*` attributes are only valid on `<section>`. |
| `background-opacity-range` | error | `data-background-opacity` must be between 0 and 1. |
| `background-video-flags` | warn | `data-background-video-loop/muted` require `data-background-video`. |
| `background-interactive-requires-iframe` | warn | `data-background-interactive` requires `data-background-iframe`. |
| `valid-background-size` | warn | `data-background-size` must be valid CSS (cover, contain, length). |
| `valid-background-position` | warn | `data-background-position` must be valid CSS position value. |
| `valid-background-repeat` | warn | `data-background-repeat` must be: repeat, no-repeat, etc. |

### Auto-Animate (7)

| Rule | Default | Description |
|------|---------|-------------|
| `auto-animate-pairs` | error | `data-auto-animate` needs an adjacent slide with the same attribute. |
| `auto-animate-on-section` | error | `data-auto-animate` is only valid on `<section>`. |
| `data-id-needs-auto-animate` | warn | `data-id` in a slide without `data-auto-animate` has no effect. |
| `data-id-inline-styles` | warn | Elements with `data-id` should use inline `style=` for animated properties. |
| `auto-animate-delay-not-on-section` | error | `data-auto-animate-delay` only works on child elements, not `<section>`. |
| `auto-animate-restart-needs-auto-animate` | warn | `data-auto-animate-restart` without `data-auto-animate` has no effect. |
| `auto-animate-id-needs-auto-animate` | warn | `data-auto-animate-id` without `data-auto-animate` has no effect. |

### Transitions (3)

| Rule | Default | Description |
|------|---------|-------------|
| `valid-transition-values` | error | `data-transition` must use valid values: none, fade, slide, convex, concave, zoom. |
| `valid-transition-speed` | error | `data-transition-speed` must be: default, fast, or slow. |
| `transition-on-section` | error | `data-transition` and `data-transition-speed` are only valid on `<section>`. |

### Fragments (4)

| Rule | Default | Description |
|------|---------|-------------|
| `valid-fragment-classes` | error | Fragment effect classes require the base `fragment` class. |
| `known-fragment-effect` | warn | Unknown fragment effect class without `custom` — might be a typo. |
| `fragment-index-numeric` | error | `data-fragment-index` must be a non-negative integer. |
| `fragment-index-needs-fragment` | warn | `data-fragment-index` without the `fragment` class has no effect. |

### Layout (4)

| Rule | Default | Description |
|------|---------|-------------|
| `r-stretch-single` | error | Only one `r-stretch` element per slide. |
| `r-stretch-direct-child` | error | `r-stretch` must be a direct child of `<section>`. |
| `no-height-top-on-section` | warn | `<section>` should not have inline height/top/bottom. |
| `r-stack-without-fragments` | warn | `r-stack` without fragment children — elements overlap. |

### Media (5)

| Rule | Default | Description |
|------|---------|-------------|
| `no-src-and-data-src` | warn | Element has both `src` and `data-src` — likely a mistake. |
| `data-autoplay-on-media` | warn | `data-autoplay` only works on `<video>` and `<audio>`. |
| `data-preload-needs-data-src` | warn | `data-preload` on `<iframe>` with `src` has no effect. |
| `data-ignore-on-media` | warn | `data-ignore` only works on `<video>`, `<audio>`, `<iframe>`. |
| `valid-preview-fit` | warn | `data-preview-fit` must be: scale-down, contain, cover. |

### Structure (16)

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

### Links (1)

| Rule | Default | Description |
|------|---------|-------------|
| `broken-slide-link` | warn | Internal slide link (`#/...`) has invalid format. |

### CSS (4)

| Rule | Default | Description |
|------|---------|-------------|
| `css-no-background-on-reveal` | error | CSS background on `.reveal` hides it from Reveal.js. |
| `css-no-background-on-section` | error | CSS background on section selectors conflicts with `data-background-*`. |
| `css-no-transition-on-animated` | warn | CSS `transition` can conflict with auto-animate. |
| `css-no-dead-keyframes` | warn | Unused `@keyframes` — not referenced by any animation. |

### Config (9)

| Rule | Default | Description |
|------|---------|-------------|
| `config-valid-transition` | error | `transition` must be: none, fade, slide, convex, concave, zoom. |
| `config-valid-transition-speed` | error | `transitionSpeed` must be: default, fast, slow. |
| `config-valid-background-transition` | error | `backgroundTransition` must use valid transition values. |
| `config-width-height-numeric` | error | `width` and `height` must be positive numbers. |
| `config-margin-range` | error | `margin` must be between 0.0 and 1.0. |
| `config-min-max-scale` | error | `minScale`/`maxScale` must be positive, min < max. |
| `config-auto-slide-numeric` | error | `autoSlide` must be non-negative (ms). 0 = disabled. |
| `config-navigation-mode` | error | `navigationMode` must be: default, linear, grid. |
| `config-view-mode` | error | `view` must be "scroll" or omitted. |

## Configuration

Create a `.revealjs-validator.json` in your project root:

```json
{
  "rules": {
    "background-video-flags": "off",
    "missing-slide-background": "warn"
  },
  "ignore": [
    "slides/legacy-*.html"
  ],
  "crosscheck": {
    "css-base-files": [
      "shared/css/base.css"
    ]
  }
}
```

Each rule can be set to `"error"`, `"warn"`, or `"off"`. Without a config file, all rules default to their built-in severity.

## Source of truth

Rules are derived exclusively from the official Reveal.js documentation, stored in `docs/source/` as a mechanical conversion (curl + pandoc, zero editing). Each rule implementation includes a reference to the specific documentation section.

## License

MIT
