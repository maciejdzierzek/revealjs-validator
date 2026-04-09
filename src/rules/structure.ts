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

// ---------------------------------------------------------------------------
// Rule: valid-autoslide-value
//
// Source: docs/source/auto-slide.md
// "override the slide duration for individual slides and fragments by
//  using the data-autoslide attribute"
// Value must be numeric (milliseconds).
// ---------------------------------------------------------------------------
const validAutoslideValue: Rule = {
  id: 'valid-autoslide-value',
  category: 'structure',
  defaultSeverity: 'error',
  description: 'data-autoslide must be a numeric value in milliseconds.',
  docsReference: 'auto-slide.md — "data-autoslide attribute"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      // Check on section
      const sectionVal = slide.element.attributes['data-autoslide'];
      if (sectionVal !== undefined) {
        const num = parseInt(sectionVal, 10);
        if (isNaN(num) || num < 0 || String(num) !== sectionVal.trim()) {
          violations.push({
            ruleId: 'valid-autoslide-value',
            message: `data-autoslide must be a positive integer (milliseconds), got "${sectionVal}".`,
            slideIndex: slide.index,
            context: `data-autoslide="${sectionVal}"`,
          });
        }
      }
      // Check on child elements (fragments)
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        const val = el.attributes['data-autoslide'];
        if (val === undefined) return;
        const num = parseInt(val, 10);
        if (isNaN(num) || num < 0 || String(num) !== val.trim()) {
          violations.push({
            ruleId: 'valid-autoslide-value',
            message: `data-autoslide must be a positive integer (milliseconds), got "${val}".`,
            slideIndex: slide.index,
            context: `<${el.tag} data-autoslide="${val}">`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: vertical-slides-nesting
//
// Source: docs/source/vertical-slides.md
// "nest multiple slides within a single top-level slide to create a
//  vertical stack"
// Valid: <section> > <section> (one level of nesting).
// Invalid: <section> > <section> > <section> (too deep).
// ---------------------------------------------------------------------------
const verticalSlidesNesting: Rule = {
  id: 'vertical-slides-nesting',
  category: 'structure',
  defaultSeverity: 'error',
  description: 'Vertical slides must be exactly one level deep — <section> inside <section>. Triple nesting is invalid.',
  docsReference: 'vertical-slides.md — vertical slide markup',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.slides) {
      // Check vertical children for further nesting
      for (const vertical of slide.verticalSlides) {
        if (vertical.verticalSlides.length > 0) {
          violations.push({
            ruleId: 'vertical-slides-nesting',
            message: 'Triple-nested <section> found. Vertical slides can only be one level deep.',
            slideIndex: vertical.index,
          });
        }
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: markdown-requires-script
//
// Source: docs/source/markdown.md
// "The data-markdown attribute tells reveal.js that the content should be
//  run through the Markdown plugin. The section below will be rendered as
//  a text <script type="text/template">"
// Without the script wrapper, markdown content renders as raw text.
// ---------------------------------------------------------------------------
const markdownRequiresScript: Rule = {
  id: 'markdown-requires-script',
  category: 'structure',
  defaultSeverity: 'error',
  description: '<section data-markdown> requires a <script type="text/template"> child. Without it, markdown renders as raw text.',
  docsReference: 'markdown.md — markdown section markup',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (!('data-markdown' in slide.element.attributes)) continue;
      // data-markdown with src= (external file) doesn't need script tag
      if ('data-markdown' in slide.element.attributes &&
          slide.element.attributes['data-markdown'] !== '') continue;

      const hasScript = slide.element.children.some(
        (child) => child.tag === 'script' &&
          (child.attributes['type'] === 'text/template' ||
           child.attributes['type'] === 'text/html'),
      );
      if (!hasScript) {
        violations.push({
          ruleId: 'markdown-requires-script',
          message: '<section data-markdown> without <script type="text/template"> — markdown will render as raw text.',
          slideIndex: slide.index,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: code-line-numbers-structure
//
// Source: docs/source/code.md
// "enable line numbers by adding data-line-numbers to your <code> tags"
// data-line-numbers must be on <code> inside <pre>.
// On other elements it does nothing.
// ---------------------------------------------------------------------------
const codeLineNumbersStructure: Rule = {
  id: 'code-line-numbers-structure',
  category: 'structure',
  defaultSeverity: 'error',
  description: 'data-line-numbers must be on a <code> element inside <pre>.',
  docsReference: 'code.md — "adding data-line-numbers to your <code> tags"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (!('data-line-numbers' in el.attributes)) return;
        if (el.tag !== 'code') {
          violations.push({
            ruleId: 'code-line-numbers-structure',
            message: `data-line-numbers on <${el.tag}> has no effect. It must be on a <code> element inside <pre>.`,
            slideIndex: slide.index,
            context: `<${el.tag} data-line-numbers>`,
          });
        }
      });
    }
    return violations;
  },
};

registerRule(noInlineTransitionCss);
registerRule(noDisplayNoneOnSection);
registerRule(validDataVisibility);
registerRule(validAutoslideValue);
registerRule(verticalSlidesNesting);
registerRule(markdownRequiresScript);
registerRule(codeLineNumbersStructure);
