import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, SlideElement } from '../parser.js';

// ---------------------------------------------------------------------------
// Rule: r-stretch-single
//
// Source: docs/source/layout.md
// "Only direct descendants of a slide section can be stretched."
// "Only a single element per slide can be stretched."
// ---------------------------------------------------------------------------
const rStretchSingle: Rule = {
  id: 'r-stretch-single',
  category: 'layout',
  defaultSeverity: 'error',
  description: 'Only one element with class "r-stretch" is allowed per slide.',
  docsReference: 'layout.md — "Only a single element per slide can be stretched"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      let count = 0;
      for (const child of slide.element.children) {
        if (child.classList.includes('r-stretch') || child.classList.includes('stretch')) {
          count++;
        }
      }
      if (count > 1) {
        violations.push({
          ruleId: 'r-stretch-single',
          message: `Found ${count} elements with r-stretch in one slide. Only one is allowed.`,
          slideIndex: slide.index,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: r-stretch-direct-child
//
// Source: docs/source/layout.md
// "Only direct descendants of a slide section can be stretched."
// ---------------------------------------------------------------------------
function walkNested(el: SlideElement, depth: number, cb: (el: SlideElement, depth: number) => void): void {
  cb(el, depth);
  for (const child of el.children) {
    walkNested(child, depth + 1, cb);
  }
}

const rStretchDirectChild: Rule = {
  id: 'r-stretch-direct-child',
  category: 'layout',
  defaultSeverity: 'error',
  description: 'Elements with class "r-stretch" must be direct children of <section>.',
  docsReference: 'layout.md — "Only direct descendants of a slide section can be stretched"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      // depth 0 = section itself, depth 1 = direct children (OK), depth 2+ = nested (BAD)
      walkNested(slide.element, 0, (el, depth) => {
        if (depth <= 1) return; // section or direct child — fine
        if (el.classList.includes('r-stretch') || el.classList.includes('stretch')) {
          violations.push({
            ruleId: 'r-stretch-direct-child',
            message: `r-stretch on <${el.tag}> is nested inside another element. It must be a direct child of <section> to work.`,
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
// Rule: no-height-top-on-section
//
// Source: docs/source/layout.md / docs/source/presentation-size.md
// Reveal.js sets height, top, and bottom on sections for centering.
// Inline overrides break the layout system.
// ---------------------------------------------------------------------------
// Match height/top/bottom but NOT min-height/max-height
const HEIGHT_TOP_PATTERN = /(?<![a-z-])(height\s*:|top\s*:|bottom\s*:)/i;

const noHeightTopOnSection: Rule = {
  id: 'no-height-top-on-section',
  category: 'layout',
  defaultSeverity: 'warn',
  description:
    '<section> should not have inline height, top, or bottom — Reveal.js sets these for centering.',
  docsReference: 'presentation-size.md — Reveal.js manages slide dimensions',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const style = slide.element.inlineStyle;
      if (style && HEIGHT_TOP_PATTERN.test(style)) {
        violations.push({
          ruleId: 'no-height-top-on-section',
          message:
            'Inline height/top/bottom on <section> overrides Reveal.js centering. Use min-height if needed.',
          slideIndex: slide.index,
          context: `style="${style}"`,
        });
      }
    }
    return violations;
  },
};

registerRule(rStretchSingle);
registerRule(rStretchDirectChild);
registerRule(noHeightTopOnSection);
