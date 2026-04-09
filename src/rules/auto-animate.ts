import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, Slide, SlideElement } from '../parser.js';

function walkElements(el: SlideElement, cb: (el: SlideElement) => void): void {
  cb(el);
  for (const child of el.children) {
    walkElements(child, cb);
  }
}

function hasAttr(el: SlideElement, attr: string): boolean {
  return attr in el.attributes;
}

// ---------------------------------------------------------------------------
// Rule: auto-animate-pairs
//
// Source: docs/source/auto-animate.md
// "All you need to do is add data-auto-animate to two adjacent slide
//  <section> elements and Auto-Animate will animate all matching elements
//  between the two."
// ---------------------------------------------------------------------------
const autoAnimatePairs: Rule = {
  id: 'auto-animate-pairs',
  category: 'auto-animate',
  defaultSeverity: 'error',
  description:
    'data-auto-animate requires an adjacent slide (previous or next) with the same attribute for animation to work.',
  docsReference: 'auto-animate.md — "add data-auto-animate to two adjacent slide <section> elements"',
  fixHint: 'Add data-auto-animate to the adjacent slide, or remove it from this slide',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    const flat = parsed.flatSlides;

    for (let i = 0; i < flat.length; i++) {
      const slide = flat[i];
      if (!hasAttr(slide.element, 'data-auto-animate')) continue;

      // Check if data-auto-animate-id groups are used
      const groupId = slide.element.attributes['data-auto-animate-id'] ?? null;

      const prevHas = i > 0 && hasAttr(flat[i - 1].element, 'data-auto-animate');
      const nextHas = i < flat.length - 1 && hasAttr(flat[i + 1].element, 'data-auto-animate');

      if (!prevHas && !nextHas) {
        violations.push({
          ruleId: 'auto-animate-pairs',
          message:
            'Slide has data-auto-animate but no adjacent slide shares it. Auto-animate needs a pair.',
          slideIndex: i,
        });
        continue;
      }

      // If using group IDs, check that at least one neighbor shares the same ID
      if (groupId !== null) {
        const prevId = i > 0 ? (flat[i - 1].element.attributes['data-auto-animate-id'] ?? null) : null;
        const nextId = i < flat.length - 1 ? (flat[i + 1].element.attributes['data-auto-animate-id'] ?? null) : null;
        if (prevId !== groupId && nextId !== groupId) {
          violations.push({
            ruleId: 'auto-animate-pairs',
            message:
              `Slide has data-auto-animate-id="${groupId}" but no adjacent auto-animate slide shares this ID.`,
            slideIndex: i,
            context: `data-auto-animate-id="${groupId}"`,
          });
        }
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: auto-animate-on-section
//
// Source: docs/source/auto-animate.md
// All examples show data-auto-animate on <section> elements only.
// ---------------------------------------------------------------------------
const autoAnimateOnSection: Rule = {
  id: 'auto-animate-on-section',
  category: 'auto-animate',
  defaultSeverity: 'error',
  description: 'data-auto-animate is only valid on <section> elements.',
  docsReference: 'auto-animate.md — all examples use <section data-auto-animate>',
  fixHint: 'Move data-auto-animate to the parent <section> element',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if (hasAttr(el, 'data-auto-animate')) {
          violations.push({
            ruleId: 'auto-animate-on-section',
            message: `data-auto-animate is only valid on <section>, found on <${el.tag}>.`,
            slideIndex: slide.index,
            context: `<${el.tag} data-auto-animate>`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-id-needs-auto-animate
//
// Source: docs/source/auto-animate.md — "How Elements are Matched"
// "If you'd like to be more explicit about what should match you can give
//  the elements a data-id attribute."
// data-id on elements in a non-auto-animate slide is useless.
// ---------------------------------------------------------------------------
const dataIdNeedsAutoAnimate: Rule = {
  id: 'data-id-needs-auto-animate',
  category: 'auto-animate',
  defaultSeverity: 'warn',
  description: 'data-id on elements in a slide without data-auto-animate has no effect.',
  docsReference: 'auto-animate.md — "How Elements are Matched"',
  fixHint: 'Add data-auto-animate to this <section>, or remove data-id',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (hasAttr(slide.element, 'data-auto-animate')) continue;

      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if (hasAttr(el, 'data-id')) {
          violations.push({
            ruleId: 'data-id-needs-auto-animate',
            message: `data-id="${el.attributes['data-id']}" has no effect — parent slide lacks data-auto-animate.`,
            slideIndex: slide.index,
            context: `<${el.tag} data-id="${el.attributes['data-id']}">`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-id-inline-styles
//
// Source: docs/source/auto-animate.md
// "This example uses the margin-top property to move the element but
//  internally reveal.js will use a CSS transform to ensure smooth movement."
// All animation examples use inline style= for animated properties.
// Elements with data-id should have inline styles for animated properties.
// ---------------------------------------------------------------------------
const dataIdInlineStyles: Rule = {
  id: 'data-id-inline-styles',
  category: 'auto-animate',
  defaultSeverity: 'warn',
  description:
    'Elements with data-id in auto-animated slides should use inline style for animated properties.',
  docsReference: 'auto-animate.md — all animation examples use inline style=',
  fixHint: 'Add style="..." with animated properties (font-size, width, etc.) to this element',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (!hasAttr(slide.element, 'data-auto-animate')) continue;

      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if (hasAttr(el, 'data-id') && !el.inlineStyle) {
          violations.push({
            ruleId: 'data-id-inline-styles',
            message:
              `Element with data-id="${el.attributes['data-id']}" has no inline style. Auto-animate animates inline style properties — use style= for properties you want to animate.`,
            slideIndex: slide.index,
            context: `<${el.tag} data-id="${el.attributes['data-id']}">`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: auto-animate-delay-not-on-section
//
// Source: docs/source/auto-animate.md
// data-auto-animate-delay is documented as an element-level attribute.
// "You can override the animation duration, delay and easing for a
//  specific element" — only on child elements, not on <section>.
// ---------------------------------------------------------------------------
const autoAnimateDelayNotOnSection: Rule = {
  id: 'auto-animate-delay-not-on-section',
  category: 'auto-animate',
  defaultSeverity: 'error',
  description:
    'data-auto-animate-delay only works on child elements, not on <section>.',
  docsReference: 'auto-animate.md — element-level animation settings',
  fixHint: 'Move data-auto-animate-delay to a child element, not <section>',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (hasAttr(slide.element, 'data-auto-animate-delay')) {
        violations.push({
          ruleId: 'auto-animate-delay-not-on-section',
          message:
            'data-auto-animate-delay on <section> has no effect. Use it on child elements instead.',
          slideIndex: slide.index,
          context: `data-auto-animate-delay="${slide.element.attributes['data-auto-animate-delay']}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: auto-animate-restart-needs-auto-animate
//
// Source: docs/source/auto-animate.md
// data-auto-animate-restart breaks the animation chain, but only makes
// sense on slides that also have data-auto-animate.
// ---------------------------------------------------------------------------
const autoAnimateRestartNeedsAutoAnimate: Rule = {
  id: 'auto-animate-restart-needs-auto-animate',
  category: 'auto-animate',
  defaultSeverity: 'warn',
  description: 'data-auto-animate-restart without data-auto-animate has no effect.',
  docsReference: 'auto-animate.md — animation restart',
  fixHint: 'Add data-auto-animate to this <section>, or remove data-auto-animate-restart',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (hasAttr(slide.element, 'data-auto-animate-restart') &&
          !hasAttr(slide.element, 'data-auto-animate')) {
        violations.push({
          ruleId: 'auto-animate-restart-needs-auto-animate',
          message: 'data-auto-animate-restart has no effect without data-auto-animate on the same slide.',
          slideIndex: slide.index,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: auto-animate-id-needs-auto-animate
//
// Source: docs/source/auto-animate.md
// data-auto-animate-id groups auto-animate slides, but only makes sense
// on slides that also have data-auto-animate.
// ---------------------------------------------------------------------------
const autoAnimateIdNeedsAutoAnimate: Rule = {
  id: 'auto-animate-id-needs-auto-animate',
  category: 'auto-animate',
  defaultSeverity: 'warn',
  description: 'data-auto-animate-id without data-auto-animate has no effect.',
  docsReference: 'auto-animate.md — animation grouping with data-auto-animate-id',
  fixHint: 'Add data-auto-animate to this <section>, or remove data-auto-animate-id',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      if (hasAttr(slide.element, 'data-auto-animate-id') &&
          !hasAttr(slide.element, 'data-auto-animate')) {
        violations.push({
          ruleId: 'auto-animate-id-needs-auto-animate',
          message: `data-auto-animate-id="${slide.element.attributes['data-auto-animate-id']}" has no effect without data-auto-animate.`,
          slideIndex: slide.index,
          context: `data-auto-animate-id="${slide.element.attributes['data-auto-animate-id']}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: duplicate-data-id
//
// Source: docs/source/auto-animate.md — "How Elements are Matched"
// "give the objects that you want to animate between a matching data-id"
// Two elements with the same data-id in one slide = Reveal.js can't
// determine which one to animate. Only one element per data-id per slide.
// ---------------------------------------------------------------------------
const duplicateDataId: Rule = {
  id: 'duplicate-data-id',
  category: 'auto-animate',
  defaultSeverity: 'error',
  description: 'Duplicate data-id in one slide — auto-animate cannot determine which element to animate.',
  docsReference: 'auto-animate.md — "How Elements are Matched"',
  fixHint: 'Give each element a unique data-id within the same slide',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const ids = new Map<string, number>();
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        const id = el.attributes['data-id'];
        if (id === undefined) return;
        ids.set(id, (ids.get(id) ?? 0) + 1);
      });
      for (const [id, count] of ids) {
        if (count > 1) {
          violations.push({
            ruleId: 'duplicate-data-id',
            message: `data-id="${id}" appears ${count} times in one slide. Each data-id must be unique within a slide.`,
            slideIndex: slide.index,
            context: `data-id="${id}" (×${count})`,
          });
        }
      }
    }
    return violations;
  },
};

registerRule(autoAnimatePairs);
registerRule(autoAnimateOnSection);
registerRule(dataIdNeedsAutoAnimate);
registerRule(dataIdInlineStyles);
registerRule(autoAnimateDelayNotOnSection);
registerRule(autoAnimateRestartNeedsAutoAnimate);
registerRule(autoAnimateIdNeedsAutoAnimate);
registerRule(duplicateDataId);
