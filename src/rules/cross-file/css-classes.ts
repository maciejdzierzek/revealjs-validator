import { registerCrossFileRule } from './index.js';
import type { CrossFileViolation, CrossFileRule, CrossFileContext } from './index.js';
import type { SlideElement } from '../../parser.js';
import type { CSSParseResult } from '../../css-parser.js';

// Classes that Reveal.js adds dynamically at runtime — never in source HTML
const REVEAL_DYNAMIC_CLASSES = new Set([
  'present', 'past', 'future', 'visible', 'current-fragment',
  'has-dark-background', 'has-light-background',
  'enabled', 'disabled', 'navigate-left', 'navigate-right',
  'navigate-up', 'navigate-down', 'slide-background',
  'slide-background-content', 'stack', 'overview',
  'paused', 'ready', 'center', 'has-parallax-background',
]);

// Classes that are part of Reveal.js API — valid in both HTML and CSS
const REVEAL_API_CLASSES = new Set([
  'reveal', 'slides', 'fragment',
  'fade-out', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
  'fade-in-then-out', 'current-visible', 'fade-in-then-semi-out',
  'semi-fade-out', 'grow', 'shrink', 'strike',
  'highlight-red', 'highlight-green', 'highlight-blue',
  'highlight-current-red', 'highlight-current-green', 'highlight-current-blue',
  'custom',
  'r-stretch', 'stretch', 'r-fit-text', 'r-stack', 'r-hstack', 'r-vstack', 'r-frame',
  'notes',
]);

// Default prefixes to ignore (external libraries)
const DEFAULT_IGNORE_PREFIXES = [
  'ph-',       // Phosphor icons
  'ph ',       // Phosphor icons (space variant)
  'pi-',       // PrimeIcons
  'fa-',       // Font Awesome
  'bi-',       // Bootstrap Icons
  'mdi-',      // Material Design Icons
  'icon-',     // generic icon prefix
];

function collectHTMLClasses(el: SlideElement): Set<string> {
  const classes = new Set<string>();
  function walk(e: SlideElement): void {
    for (const cls of e.classList) classes.add(cls);
    for (const child of e.children) walk(child);
  }
  walk(el);
  return classes;
}

function collectCSSClasses(css: CSSParseResult): Set<string> {
  const classes = new Set<string>();
  for (const rule of css.rules) {
    // Extract class names from selectors
    const matches = rule.selector.matchAll(/\.([a-zA-Z_][\w-]*)/g);
    for (const match of matches) {
      classes.add(match[1]);
    }
  }
  return classes;
}

function shouldIgnoreClass(cls: string, ignorePrefixes: string[]): boolean {
  if (REVEAL_DYNAMIC_CLASSES.has(cls)) return true;
  if (REVEAL_API_CLASSES.has(cls)) return true;
  return ignorePrefixes.some((prefix) => cls.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Rule: cross-css-classes-used
//
// Classes used in HTML slides but not defined in any CSS theme file.
// These elements will have no styling — likely a typo or missing CSS.
// ---------------------------------------------------------------------------
const crossCSSClassesUsed: CrossFileRule = {
  id: 'cross-css-classes-used',
  category: 'cross-file',
  defaultSeverity: 'warn',
  description: 'CSS class used in slide HTML but not defined in any theme CSS file.',
  docsReference: 'General — cross-file class consistency',
  crosscheckKey: 'css-classes-used',
  check(ctx: CrossFileContext): CrossFileViolation[] {
    const violations: CrossFileViolation[] = [];
    const ignorePrefixes = DEFAULT_IGNORE_PREFIXES;

    // Collect all CSS classes from all theme files
    const cssClasses = new Set<string>();
    for (const { parsed } of ctx.css) {
      for (const cls of collectCSSClasses(parsed)) {
        cssClasses.add(cls);
      }
    }

    if (cssClasses.size === 0) return violations; // no CSS to cross-check

    // Check each slide's HTML classes
    for (const { file, parsed, slideId } of ctx.slides) {
      const flatSlide = parsed.flatSlides[0];
      if (!flatSlide) continue;

      const htmlClasses = collectHTMLClasses(flatSlide.element);
      for (const cls of htmlClasses) {
        if (shouldIgnoreClass(cls, ignorePrefixes)) continue;
        if (cssClasses.has(cls)) continue;

        violations.push({
          ruleId: 'cross-css-classes-used',
          message: `Class "${cls}" used in HTML but not defined in any theme CSS file.`,
          file,
          slideId,
        });
      }
    }

    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: cross-css-classes-defined
//
// Classes defined in CSS theme but not used in any slide HTML.
// These are dead CSS rules — likely leftovers from redesign.
// ---------------------------------------------------------------------------
const crossCSSClassesDefined: CrossFileRule = {
  id: 'cross-css-classes-defined',
  category: 'cross-file',
  defaultSeverity: 'warn',
  description: 'CSS class defined in theme but not used in any slide HTML — possibly dead code.',
  docsReference: 'General — cross-file class consistency',
  crosscheckKey: 'css-classes-defined',
  check(ctx: CrossFileContext): CrossFileViolation[] {
    const violations: CrossFileViolation[] = [];
    const ignorePrefixes = DEFAULT_IGNORE_PREFIXES;

    // Collect all HTML classes from all slides
    const htmlClasses = new Set<string>();
    for (const { parsed } of ctx.slides) {
      const flatSlide = parsed.flatSlides[0];
      if (!flatSlide) continue;
      for (const cls of collectHTMLClasses(flatSlide.element)) {
        htmlClasses.add(cls);
      }
    }

    // Check each CSS file for unused classes
    for (const { file, parsed } of ctx.css) {
      const cssClasses = collectCSSClasses(parsed);
      for (const cls of cssClasses) {
        if (shouldIgnoreClass(cls, ignorePrefixes)) continue;
        if (htmlClasses.has(cls)) continue;

        violations.push({
          ruleId: 'cross-css-classes-defined',
          message: `Class "${cls}" defined in CSS but not used in any slide HTML — possibly dead code.`,
          file,
        });
      }
    }

    return violations;
  },
};

registerCrossFileRule(crossCSSClassesUsed);
registerCrossFileRule(crossCSSClassesDefined);
