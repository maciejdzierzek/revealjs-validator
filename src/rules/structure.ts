import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, SlideElement } from '../parser.js';

function walkElements(el: SlideElement, cb: (el: SlideElement) => void): void {
  cb(el);
  for (const child of el.children) {
    walkElements(child, cb);
  }
}

// ---------------------------------------------------------------------------
// Rule: no-inline-transition-css
//
// Source: docs/source/auto-animate.md
// Reveal.js uses CSS transforms internally for auto-animate.
// Inline CSS transition: properties conflict with this mechanism.
// ---------------------------------------------------------------------------
const TRANSITION_CSS_PATTERN = /\btransition\s*:/i;

const noInlineTransitionCss: Rule = {
  id: 'no-inline-transition-css',
  category: 'structure',
  defaultSeverity: 'warn',
  description:
    'Inline CSS "transition:" property can conflict with Reveal.js auto-animate. Use data-auto-animate instead.',
  docsReference: 'auto-animate.md — Reveal.js uses CSS transforms internally',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.inlineStyle && TRANSITION_CSS_PATTERN.test(el.inlineStyle)) {
          violations.push({
            ruleId: 'no-inline-transition-css',
            message: `Inline CSS "transition:" on <${el.tag}> may conflict with Reveal.js auto-animate transitions.`,
            slideIndex: slide.index,
            context: `style="${el.inlineStyle}"`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: no-display-none-on-section
//
// Source: docs/source/slide-visibility.md
// "To hide a slide from view, add data-visibility="hidden""
// Inline display:none or visibility:hidden on sections breaks Reveal.js
// navigation. Use data-visibility attribute instead.
// ---------------------------------------------------------------------------
const DISPLAY_NONE_PATTERN = /\b(display\s*:\s*none|visibility\s*:\s*hidden)\b/i;

const noDisplayNoneOnSection: Rule = {
  id: 'no-display-none-on-section',
  category: 'structure',
  defaultSeverity: 'warn',
  description:
    'Use data-visibility="hidden" instead of inline CSS display:none or visibility:hidden on <section>.',
  docsReference: 'slide-visibility.md — "add data-visibility=\\"hidden\\""',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const style = slide.element.inlineStyle;
      if (style && DISPLAY_NONE_PATTERN.test(style)) {
        violations.push({
          ruleId: 'no-display-none-on-section',
          message:
            'Inline display:none or visibility:hidden on <section> breaks navigation. Use data-visibility="hidden" or data-visibility="uncounted" instead.',
          slideIndex: slide.index,
          context: `style="${style}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-data-visibility
//
// Source: docs/source/slide-visibility.md
// "data-visibility="hidden" — hides slide completely"
// "data-visibility="uncounted" — excludes from slide count"
// Only these two values are valid.
// ---------------------------------------------------------------------------
const VALID_VISIBILITY = ['hidden', 'uncounted'];

const validDataVisibility: Rule = {
  id: 'valid-data-visibility',
  category: 'structure',
  defaultSeverity: 'error',
  description: 'data-visibility must be "hidden" or "uncounted".',
  docsReference: 'slide-visibility.md — valid data-visibility values',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-visibility'];
      if (val !== undefined && !VALID_VISIBILITY.includes(val)) {
        violations.push({
          ruleId: 'valid-data-visibility',
          message: `Invalid data-visibility value "${val}". Valid: ${VALID_VISIBILITY.join(', ')}.`,
          slideIndex: slide.index,
          context: `data-visibility="${val}"`,
        });
      }
    }
    return violations;
  },
};

registerRule(noInlineTransitionCss);
registerRule(noDisplayNoneOnSection);
registerRule(validDataVisibility);
