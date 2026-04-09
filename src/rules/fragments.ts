import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, SlideElement } from '../parser.js';

// Source: docs/source/fragments.md
// Complete list of built-in fragment effect classes
const KNOWN_FRAGMENT_EFFECTS = new Set([
  'fade-out',
  'fade-up',
  'fade-down',
  'fade-left',
  'fade-right',
  'fade-in-then-out',
  'current-visible',
  'fade-in-then-semi-out',
  'semi-fade-out',
  'grow',
  'shrink',
  'strike',
  'highlight-red',
  'highlight-green',
  'highlight-blue',
  'highlight-current-red',
  'highlight-current-green',
  'highlight-current-blue',
]);

function walkElements(el: SlideElement, cb: (el: SlideElement) => void): void {
  cb(el);
  for (const child of el.children) {
    walkElements(child, cb);
  }
}

// ---------------------------------------------------------------------------
// Rule: valid-fragment-classes
//
// Source: docs/source/fragments.md
// "Fragments are used to highlight or incrementally reveal individual
//  elements on a slide. Every element with the class fragment will be
//  stepped through before moving on to the next slide."
// Effect classes only work when 'fragment' base class is also present.
// ---------------------------------------------------------------------------
const validFragmentClasses: Rule = {
  id: 'valid-fragment-classes',
  category: 'fragments',
  defaultSeverity: 'error',
  description:
    'Fragment effect classes (fade-out, grow, etc.) require the base "fragment" class to work.',
  docsReference: 'fragments.md — "Every element with the class fragment"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        const hasFragment = el.classList.includes('fragment');
        if (hasFragment) return; // all good

        // Check if any known fragment effect class is used without 'fragment'
        for (const cls of el.classList) {
          if (KNOWN_FRAGMENT_EFFECTS.has(cls)) {
            violations.push({
              ruleId: 'valid-fragment-classes',
              message: `Class "${cls}" is a fragment effect but element lacks the "fragment" base class.`,
              slideIndex: slide.index,
              context: `<${el.tag} class="${el.classList.join(' ')}">`,
            });
            break; // one violation per element is enough
          }
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: known-fragment-effect
//
// Source: docs/source/fragments.md — lists all built-in effects
// Unknown effect class without 'custom' class is suspicious.
// "If you want to use a custom fragment style, you can add the custom
//  class alongside your custom effect class."
// ---------------------------------------------------------------------------
const knownFragmentEffect: Rule = {
  id: 'known-fragment-effect',
  category: 'fragments',
  defaultSeverity: 'warn',
  description:
    'Unknown fragment effect class without "custom" — might be a typo. Use "custom" class for non-standard effects.',
  docsReference: 'fragments.md — built-in fragment effects list + custom fragments',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    // Classes that are not effects and should be ignored
    const IGNORE_CLASSES = new Set([
      'fragment', 'custom', 'visible', 'current-fragment',
    ]);

    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (!el.classList.includes('fragment')) return;
        if (el.classList.includes('custom')) return; // custom effects are fine

        for (const cls of el.classList) {
          if (IGNORE_CLASSES.has(cls)) continue;
          if (KNOWN_FRAGMENT_EFFECTS.has(cls)) continue;
          // Skip common utility classes (not fragment-specific)
          if (!cls.startsWith('fade-') && !cls.startsWith('highlight-') &&
              !cls.startsWith('semi-') && cls !== 'grow' && cls !== 'shrink' &&
              cls !== 'strike' && cls !== 'current-visible') {
            continue;
          }
          violations.push({
            ruleId: 'known-fragment-effect',
            message: `Unknown fragment effect class "${cls}". Known effects: ${[...KNOWN_FRAGMENT_EFFECTS].join(', ')}. Use "custom" class for non-standard effects.`,
            slideIndex: slide.index,
            context: `<${el.tag} class="${el.classList.join(' ')}">`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: fragment-index-numeric
//
// Source: docs/source/fragments.md
// "You can control the order in which fragments appear by using the
//  data-fragment-index attribute."
// Value must be a non-negative integer.
// ---------------------------------------------------------------------------
const fragmentIndexNumeric: Rule = {
  id: 'fragment-index-numeric',
  category: 'fragments',
  defaultSeverity: 'error',
  description: 'data-fragment-index must be a non-negative integer.',
  docsReference: 'fragments.md — "data-fragment-index attribute"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        const val = el.attributes['data-fragment-index'];
        if (val === undefined) return;
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0 || String(num) !== val.trim()) {
          violations.push({
            ruleId: 'fragment-index-numeric',
            message: `data-fragment-index must be a non-negative integer, got "${val}".`,
            slideIndex: slide.index,
            context: `data-fragment-index="${val}"`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: fragment-index-needs-fragment
//
// Source: docs/source/fragments.md
// data-fragment-index controls fragment order, so it's useless without
// the 'fragment' class.
// ---------------------------------------------------------------------------
const fragmentIndexNeedsFragment: Rule = {
  id: 'fragment-index-needs-fragment',
  category: 'fragments',
  defaultSeverity: 'warn',
  description: 'data-fragment-index without the "fragment" class has no effect.',
  docsReference: 'fragments.md — fragment ordering',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.attributes['data-fragment-index'] !== undefined &&
            !el.classList.includes('fragment')) {
          violations.push({
            ruleId: 'fragment-index-needs-fragment',
            message: 'data-fragment-index has no effect without the "fragment" class.',
            slideIndex: slide.index,
            context: `<${el.tag} data-fragment-index="${el.attributes['data-fragment-index']}">`,
          });
        }
      });
    }
    return violations;
  },
};

registerRule(validFragmentClasses);
registerRule(knownFragmentEffect);
registerRule(fragmentIndexNumeric);
registerRule(fragmentIndexNeedsFragment);
