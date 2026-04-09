import { registerCSSRule } from './css-index.js';
import type { CSSViolation, CSSValidationRule } from './css-index.js';
import type { CSSParseResult } from '../css-parser.js';

// Helper: check if a selector targets .reveal, .reveal-viewport, or bare section
function selectorTargetsRevealOrSection(selector: string): boolean {
  // Matches: .reveal, .reveal-viewport, section (as standalone or in compound selectors)
  // Does NOT match: .reveal .slides section (that targets slides, which is more specific)
  const s = selector.trim();
  return (
    /^\.reveal\s*$/.test(s) ||
    /^\.reveal\s*\{/.test(s) ||
    /^\.reveal-viewport\s*$/.test(s) ||
    s === '.reveal' ||
    s === '.reveal-viewport' ||
    s === 'section' ||
    // .reveal with pseudo or attribute but not descendant
    /^\.reveal[:\[.]/.test(s) ||
    /^\.reveal-viewport[:\[.]/.test(s)
  );
}

// Helper: check if selector targets section elements (including descendant)
function selectorTargetsSection(selector: string): boolean {
  const s = selector.trim();
  // Direct section selector or section with class/pseudo
  return (
    s === 'section' ||
    /\bsection\b/.test(s)
  );
}

// Helper: check if selector could match elements that use data-id
function selectorCouldMatchAnimatedElements(selector: string): boolean {
  const s = selector.trim();
  // Skip selectors that are clearly scoped to non-animated contexts
  if (s.includes('@keyframes') || s.includes('@font-face')) return false;
  // Any class-based selector could match an element with data-id
  return true;
}

// Background-related CSS properties
const BG_PROPERTIES = new Set([
  'background',
  'background-color',
  'background-image',
  'background-gradient',
]);

// ---------------------------------------------------------------------------
// Rule: css-no-background-on-reveal
//
// Source: docs/source/backgrounds.md
// "Slides are contained within a limited portion of the screen by default."
// "You can apply full page backgrounds outside of the slide area by adding
//  a data-background attribute to your <section> elements."
//
// Setting background on .reveal or .reveal-viewport via CSS means Reveal.js
// doesn't know about the background — it can't detect luminance for
// contrast, can't animate transitions between slides, and navigation
// arrows may be invisible.
// ---------------------------------------------------------------------------
const cssNoBackgroundOnReveal: CSSValidationRule = {
  id: 'css-no-background-on-reveal',
  category: 'css',
  defaultSeverity: 'error',
  description:
    'CSS background on .reveal or .reveal-viewport hides the background from Reveal.js. Use data-background-color on <section> elements instead.',
  docsReference: 'backgrounds.md — backgrounds must be data-background-* on <section>',
  check(parsed: CSSParseResult): CSSViolation[] {
    const violations: CSSViolation[] = [];

    for (const rule of parsed.rules) {
      for (const sel of rule.selectorParts) {
        if (!selectorTargetsRevealOrSection(sel)) continue;

        for (const decl of rule.declarations) {
          if (BG_PROPERTIES.has(decl.property)) {
            violations.push({
              ruleId: 'css-no-background-on-reveal',
              message:
                `CSS "${decl.property}" on "${sel.trim()}" hides the background from Reveal.js. ` +
                'Reveal.js cannot detect luminance, animate transitions, or adjust navigation contrast. ' +
                'Use data-background-color on each <section> instead.',
              line: decl.line,
              selector: sel.trim(),
              property: decl.property,
              value: decl.value,
            });
          }
        }
      }
    }

    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: css-no-background-on-section
//
// Source: docs/source/backgrounds.md
// Same principle as above but for selectors targeting section elements.
// CSS background on section selectors conflicts with data-background-*.
// ---------------------------------------------------------------------------
const cssNoBackgroundOnSection: CSSValidationRule = {
  id: 'css-no-background-on-section',
  category: 'css',
  defaultSeverity: 'error',
  description:
    'CSS background on section selectors conflicts with Reveal.js data-background-* attributes. Use data-background-color on <section> elements.',
  docsReference: 'backgrounds.md — backgrounds only via data-background-* attributes',
  check(parsed: CSSParseResult): CSSViolation[] {
    const violations: CSSViolation[] = [];

    for (const rule of parsed.rules) {
      for (const sel of rule.selectorParts) {
        // Skip .reveal and .reveal-viewport (caught by previous rule)
        if (selectorTargetsRevealOrSection(sel)) continue;
        if (!selectorTargetsSection(sel)) continue;

        for (const decl of rule.declarations) {
          if (BG_PROPERTIES.has(decl.property)) {
            violations.push({
              ruleId: 'css-no-background-on-section',
              message:
                `CSS "${decl.property}" on "${sel.trim()}" overrides Reveal.js background system. ` +
                'Use data-background-color on the <section> element instead.',
              line: decl.line,
              selector: sel.trim(),
              property: decl.property,
              value: decl.value,
            });
          }
        }
      }
    }

    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: css-no-transition-on-animated
//
// Source: docs/source/auto-animate.md
// "internally reveal.js will use a CSS transform to ensure smooth movement"
// CSS transition property on elements that could have data-id conflicts
// with Reveal.js auto-animate which uses its own CSS transitions.
// Two competing transitions on the same property = unpredictable behavior.
// ---------------------------------------------------------------------------
const cssNoTransitionOnAnimated: CSSValidationRule = {
  id: 'css-no-transition-on-animated',
  category: 'css',
  defaultSeverity: 'warn',
  description:
    'CSS transition property can conflict with Reveal.js auto-animate. Auto-animate manages its own transitions internally.',
  docsReference: 'auto-animate.md — "internally reveal.js will use a CSS transform"',
  check(parsed: CSSParseResult): CSSViolation[] {
    const violations: CSSViolation[] = [];

    for (const rule of parsed.rules) {
      for (const decl of rule.declarations) {
        if (decl.property !== 'transition') continue;

        // Check if the selector could realistically match elements in slides
        // Skip @keyframes, :root, html, body, and clearly non-slide selectors
        const sel = rule.selector;
        if (
          sel.includes(':root') ||
          sel === 'html' ||
          sel === 'body' ||
          sel.startsWith('.reveal-viewport') ||
          sel.includes('::')  // pseudo-elements are fine
        ) continue;

        // Check if the transition affects properties that auto-animate uses
        const animatedProps = [
          'all', 'transform', 'width', 'height', 'padding', 'margin',
          'font-size', 'line-height', 'color', 'background-color',
          'background', 'border-radius', 'opacity', 'top', 'left',
          'right', 'bottom',
        ];

        const transitionValue = decl.value.toLowerCase();
        const affectsAnimated = animatedProps.some((prop) =>
          transitionValue.includes(prop) || transitionValue.startsWith('all'),
        );

        if (affectsAnimated) {
          violations.push({
            ruleId: 'css-no-transition-on-animated',
            message:
              `CSS "transition: ${decl.value}" on "${sel}" may conflict with auto-animate. ` +
              'Reveal.js manages transitions internally for auto-animated elements. ' +
              'Remove the transition or scope it to non-auto-animate contexts.',
            line: decl.line,
            selector: sel,
            property: decl.property,
            value: decl.value,
          });
        }
      }
    }

    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: css-no-dead-keyframes
//
// Source: general code quality
// Unused @keyframes definitions are dead code. Reveal.js has native
// animation (fragments, auto-animate) that often replaces custom keyframes.
// Note: this is a warn because we can only check within a single CSS file,
// not cross-reference with HTML files.
// ---------------------------------------------------------------------------
const cssNoDeadKeyframes: CSSValidationRule = {
  id: 'css-no-dead-keyframes',
  category: 'css',
  defaultSeverity: 'warn',
  description:
    'Unused @keyframes definition — not referenced by any animation property in this CSS file.',
  docsReference: 'fragments.md / auto-animate.md — Reveal.js has native animation alternatives',
  check(parsed: CSSParseResult): CSSViolation[] {
    const violations: CSSViolation[] = [];

    // Collect all @keyframes names
    const keyframeNames = new Map<string, number>();
    for (const kf of parsed.keyframes) {
      keyframeNames.set(kf.name, kf.line);
    }

    if (keyframeNames.size === 0) return violations;

    // Collect all animation-name references
    const referencedNames = new Set<string>();
    for (const rule of parsed.rules) {
      for (const decl of rule.declarations) {
        if (decl.property === 'animation' || decl.property === 'animation-name') {
          // Extract name(s) from value
          const value = decl.value;
          for (const name of keyframeNames.keys()) {
            if (value.includes(name)) {
              referencedNames.add(name);
            }
          }
        }
      }
    }

    for (const [name, line] of keyframeNames) {
      if (!referencedNames.has(name)) {
        violations.push({
          ruleId: 'css-no-dead-keyframes',
          message:
            `@keyframes "${name}" is not referenced by any animation property in this CSS file. ` +
            'Consider removing it or check if it\'s used in HTML inline styles.',
          line,
          selector: `@keyframes ${name}`,
          property: '@keyframes',
          value: name,
        });
      }
    }

    return violations;
  },
};

registerCSSRule(cssNoBackgroundOnReveal);
registerCSSRule(cssNoBackgroundOnSection);
registerCSSRule(cssNoTransitionOnAnimated);
registerCSSRule(cssNoDeadKeyframes);
