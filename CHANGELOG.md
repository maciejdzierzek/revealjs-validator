# Changelog

## 0.15.0 (2026-04-09)

### Added
- **7 new auto-fix rules** (total: 10 fixable with `--fix`)
  - `css-no-dead-keyframes` — removes unused @keyframes block
  - `background-video-flags` — removes orphaned loop/muted attribute
  - `background-interactive-requires-iframe` — removes orphaned interactive attribute
  - `no-display-none-on-section` — replaces display:none with data-visibility="hidden"
  - `no-src-and-data-src` — removes src (keeps data-src for lazy loading)
  - `valid-fragment-classes` — adds missing "fragment" class
  - `fragment-index-needs-fragment` — adds missing "fragment" class

## 0.14.0 (2026-04-09)

### Added
- **`--summary` flag** — compact overview grouped by rule instead of per-violation list. Shows violation counts sorted by frequency, PASS/FAIL status. Works with both per-file and `--project` modes.

## 0.13.0 (2026-04-09)

### Added
- **Fix hints** — every rule now shows a concrete `Fix:` line under the violation message, telling you exactly what to change. Works for all 66 rules across HTML, CSS, config, and cross-file categories.
- `fixHint` property on Rule, CSSValidationRule, ConfigRule interfaces
- Per-violation `fixHint` override (on Violation interface) for context-specific hints

## 0.12.0 (2026-04-09)

### Breaking
- **`--game` renamed to `--project`** — all references to "game" removed from public API
  - CLI: `--game <dir>` → `--project <dir>`
  - API: `validateGame()` → `validateProject()`, `GameContext` → `ProjectContext`, `GameValidationResult` → `ProjectValidationResult`
  - Config: `game: {}` → `project: {}` in `.revealjs-validator.json`
  - Internal: `game-loader.ts` → `project-loader.ts`

## 0.11.0 (2026-04-09)

### Added
- **`cross-missing-bg-with-css`** — detects slides without `data-background-*` when CSS theme has no global background (slide will be white). Also warns when slides rely on CSS global background (fragile — will break when CSS is fixed).
- **`cross-assets-exist`** — checks that asset paths in slides (`src`, `data-src`, `data-background-image`, `data-background-video`, `data-preview-image`) exist on disk. Resolves absolute paths from server root and relative paths from game directory. Skips URLs and data URIs.

## 0.10.0 (2026-04-09)

### Added
- **CSS cross-file checks** (in `--game` mode)
  - `cross-css-classes-used` — classes in slide HTML not defined in any theme CSS
  - `cross-css-classes-defined` — classes in theme CSS not used in any slide HTML (dead code)
- **`crosscheck.css-base-files`** config — include additional CSS files (platform base styles)
- Whitelist of Reveal.js API and dynamic classes — never flagged as missing

## 0.9.0 (2026-04-09)

### Added
- **`--game <dir>` mode** — cross-file validation for entire presentations
  - Game loader: auto-detects `config.json` with slides array, falls back to alphabetical HTML
  - Configurable via `.revealjs-validator.json` `game` section (`slidesKey`, `fileField`)
  - Cross-file rule engine with `crosscheck` config section (each check toggleable)
  - `cross-auto-animate-pairs` — validates auto-animate chain continuity between consecutive slides, data-id matching with inline style check
  - Per-file `auto-animate-pairs` and `data-id-needs-auto-animate` auto-disabled in game mode (cross-file replaces them)
- **Programmatic API** — `validateGame(dir, config)`

## 0.8.0 (2026-04-09)

### Added
- **Config validation** — 9 new rules for Reveal.js configuration in JSON files
  - `config-valid-transition`, `config-valid-transition-speed`, `config-valid-background-transition`
  - `config-width-height-numeric`, `config-margin-range`, `config-min-max-scale`
  - `config-auto-slide-numeric`, `config-navigation-mode`, `config-view-mode`
- **Auto-detect** — CLI recognizes `.json` files and extracts `"reveal"` key automatically
- **`--reveal-key`** flag for non-standard JSON structures
- **Programmatic API** — `validateConfig()`, `validateConfigFile()`

## 0.7.0 (2026-04-09)

### Added
- **`--fix` flag** — auto-fix violations where possible (modifies files in-place)
- **`--dry-run` flag** — with `--fix`, shows what would be fixed without modifying files
- **Fixer engine** — iterative fix loop with max 10 iterations, handles cascading fixes
- **Programmatic API** — `fixFile()`, `fixHTMLSource()`, `fixCSSSource()`
- **3 rules with auto-fix:**
  - `no-css-background-on-section`: extracts color from inline CSS → `data-background-color`
  - `missing-slide-background`: adds `data-background-color="#000"` to bare sections
  - `css-no-background-on-reveal`: removes background property line from `.reveal` CSS

## 0.6.0 (2026-04-09)

### Added
- **`--staged` flag** for pre-commit hooks — validates only git-staged `.html` and `.css` files
- Returns exit 0 when no staged slides (nothing to validate)
- Returns exit 1 when errors found — blocks commit

## 0.5.0 (2026-04-09)

### Added
- **12 new rules** — comprehensive coverage of official Reveal.js docs
  - `unknown-data-attribute` — catches typos in Reveal.js data-* attributes with suggestion for correction
  - `broken-slide-link` — validates internal slide links (#/...) format
  - `data-line-numbers-format` — validates code highlight format (1,3-5 or 1|2-3)
  - `duplicate-notes` — warns about both data-notes and aside.notes on same slide
  - `valid-background-size` — validates CSS background-size values
  - `valid-background-position` — validates CSS background-position values
  - `valid-background-repeat` — validates CSS background-repeat values
  - `data-autoslide-on-fragment` — data-autoslide only works on section or fragments
  - `uncounted-not-at-end` — data-visibility="uncounted" only works at the end
  - `data-ignore-on-media` — data-ignore only on video/audio/iframe
  - `r-stack-without-fragments` — r-stack needs fragment children to be useful
  - `valid-preview-fit` — validates lightbox fit values

### Fixed
- Parser now correctly handles `<code>` elements inside `<pre>` (previously treated as raw text)

## 0.4.0 (2026-04-09)

### Added
- **3 new rules**
  - `notes-inside-section` — `<aside class="notes">` must be direct child of `<section>`
  - `valid-timing-value` — `data-timing` must be numeric (seconds)
  - `duplicate-data-id` — duplicate `data-id` in one slide breaks auto-animate matching

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
