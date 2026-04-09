# Changelog

## 0.3.0 (2026-04-09)

### Added
- **5 new HTML rules** — catches more real-world mistakes
  - `valid-autoslide-value` — `data-autoslide` must be numeric (milliseconds)
  - `vertical-slides-nesting` — no triple-nested `<section>` elements
  - `markdown-requires-script` — `data-markdown` needs `<script type="text/template">`
  - `code-line-numbers-structure` — `data-line-numbers` must be on `<code>` inside `<pre>`
  - `missing-slide-background` — slides without any `data-background-*` get wrong navigation arrow colors

## 0.2.0 (2026-04-09)

### Added
- **CSS file validation** — 4 new rules for theme/CSS files
  - `css-no-background-on-reveal` — background on `.reveal`/`.reveal-viewport` hides it from Reveal.js
  - `css-no-background-on-section` — background on section selectors conflicts with `data-background-*`
  - `css-no-transition-on-animated` — CSS transition can conflict with auto-animate
  - `css-no-dead-keyframes` — unused `@keyframes` definitions
- CLI now accepts `.css` files alongside `.html`
- `validateCSS()` and `validateCSSFile()` programmatic API
- New dependency: `css-tree` for CSS parsing

## 0.1.0 (2026-04-09)

### Added
- Initial release — 28 HTML rules across 7 categories
- **Backgrounds** (5 rules): no CSS background on section, valid attributes, opacity range, video flags, interactive requires iframe
- **Auto-Animate** (7 rules): pairs, on-section, data-id needs auto-animate, data-id inline styles, delay not on section, restart/id needs auto-animate
- **Transitions** (3 rules): valid values, valid speed, on-section only
- **Fragments** (4 rules): valid classes, known effects, numeric index, index needs fragment
- **Layout** (3 rules): r-stretch single, r-stretch direct child, no height/top on section
- **Media** (3 rules): no src+data-src, autoplay on media only, preload needs data-src
- **Structure** (3 rules): no inline transition CSS, no display none on section, valid data-visibility
- CLI with `--format text|json`, `--config`, `--list-rules`
- Programmatic API: `validate()`, `validateFile()`
- Config via `.revealjs-validator.json` (severity overrides, ignore patterns)
- 39 official Reveal.js docs in `docs/source/` (mechanical curl+pandoc conversion)
- GitHub Actions CI (Node 20 + 22) and npm publish on tags
