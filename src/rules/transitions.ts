import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, SlideElement } from '../parser.js';

// Source: docs/source/transitions.md
// "none | fade | slide | convex | concave | zoom"
const VALID_TRANSITIONS = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
const VALID_SUFFIXES = ['-in', '-out'];

const VALID_SPEEDS = ['default', 'fast', 'slow'];

function isValidTransitionValue(value: string): boolean {
  const tokens = value.trim().split(/\s+/);
  if (tokens.length === 0 || tokens.length > 2) return false;

  return tokens.every((token) => {
    // Check exact match
    if (VALID_TRANSITIONS.includes(token)) return true;
    // Check with suffix (e.g., "slide-in", "fade-out")
    for (const suffix of VALID_SUFFIXES) {
      if (token.endsWith(suffix)) {
        const base = token.slice(0, -suffix.length);
        if (VALID_TRANSITIONS.includes(base)) return true;
      }
    }
    return false;
  });
}

function walkElements(el: SlideElement, cb: (el: SlideElement) => void): void {
  cb(el);
  for (const child of el.children) {
    walkElements(child, cb);
  }
}

// ---------------------------------------------------------------------------
// Rule: valid-transition-values
//
// Source: docs/source/transitions.md
// "The global presentation transition is set using the transition config
//  value. You can override the global transition for a specific slide by
//  using the data-transition attribute"
// Valid values: none, fade, slide, convex, concave, zoom
// Directional suffixes: -in, -out (max 2 tokens)
// ---------------------------------------------------------------------------
const validTransitionValues: Rule = {
  id: 'valid-transition-values',
  category: 'transitions',
  defaultSeverity: 'error',
  description:
    'data-transition must use valid values: none, fade, slide, convex, concave, zoom (with optional -in/-out suffixes).',
  docsReference: 'transitions.md — transition types',
  fixHint: 'Use: none, fade, slide, convex, concave, zoom (optional: -in/-out suffix)',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-transition'];
      if (val !== undefined && !isValidTransitionValue(val)) {
        violations.push({
          ruleId: 'valid-transition-values',
          message: `Invalid data-transition value "${val}". Valid: ${VALID_TRANSITIONS.join(', ')} (with optional -in/-out suffix).`,
          slideIndex: slide.index,
          context: `data-transition="${val}"`,
        });
      }

      const bgVal = slide.element.attributes['data-background-transition'];
      if (bgVal !== undefined && !isValidTransitionValue(bgVal)) {
        violations.push({
          ruleId: 'valid-transition-values',
          message: `Invalid data-background-transition value "${bgVal}". Valid: ${VALID_TRANSITIONS.join(', ')} (with optional -in/-out suffix).`,
          slideIndex: slide.index,
          context: `data-background-transition="${bgVal}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-transition-speed
//
// Source: docs/source/transitions.md
// "You can also override the default duration of transitions for a
//  specific slide: data-transition-speed="fast""
// Valid values: default, fast, slow
// ---------------------------------------------------------------------------
const validTransitionSpeed: Rule = {
  id: 'valid-transition-speed',
  category: 'transitions',
  defaultSeverity: 'error',
  description: 'data-transition-speed must be: default, fast, or slow.',
  docsReference: 'transitions.md — transition speed',
  fixHint: 'Use: default, fast, or slow',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-transition-speed'];
      if (val !== undefined && !VALID_SPEEDS.includes(val)) {
        violations.push({
          ruleId: 'valid-transition-speed',
          message: `Invalid data-transition-speed value "${val}". Valid: ${VALID_SPEEDS.join(', ')}.`,
          slideIndex: slide.index,
          context: `data-transition-speed="${val}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: transition-on-section
//
// Source: docs/source/transitions.md
// All examples show data-transition on <section> elements.
// These attributes on non-section elements are meaningless.
// ---------------------------------------------------------------------------
const transitionOnSection: Rule = {
  id: 'transition-on-section',
  category: 'transitions',
  defaultSeverity: 'error',
  description:
    'data-transition and data-transition-speed are only valid on <section> elements.',
  docsReference: 'transitions.md — all examples use <section>',
  fixHint: 'Move transition attribute to the parent <section> element',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    const transAttrs = ['data-transition', 'data-transition-speed', 'data-background-transition'];

    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        for (const attr of transAttrs) {
          if (attr in el.attributes) {
            violations.push({
              ruleId: 'transition-on-section',
              message: `${attr} is only valid on <section>, found on <${el.tag}>.`,
              slideIndex: slide.index,
              context: `<${el.tag} ${attr}="${el.attributes[attr]}">`,
            });
          }
        }
      });
    }
    return violations;
  },
};

registerRule(validTransitionValues);
registerRule(validTransitionSpeed);
registerRule(transitionOnSection);
