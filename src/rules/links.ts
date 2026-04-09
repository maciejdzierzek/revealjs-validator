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
// Rule: broken-slide-link
//
// Source: docs/source/links.md
// "To link to a slide you must give your target slide a unique id attribute.
//  Next, you can create an anchor with an href in the format #/<id>"
// Also: "#/0" or "#/0/0" for numbered links.
// ---------------------------------------------------------------------------
const brokenSlideLink: Rule = {
  id: 'broken-slide-link',
  category: 'links',
  defaultSeverity: 'warn',
  description:
    'Internal slide link (#/...) has invalid format. Use #/<slide-id>, #/<number>, or #/<h>/<v>.',
  docsReference: 'links.md — slide link format',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    // Collect all slide IDs
    const slideIds = new Set<string>();
    for (const slide of parsed.flatSlides) {
      const id = slide.element.attributes['id'];
      if (id) slideIds.add(id);
    }

    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        const href = el.attributes['href'];
        if (!href || !href.startsWith('#/')) return;

        const path = href.slice(2); // remove #/
        if (!path) return; // #/ alone is valid (first slide)

        // Check if it's a numeric format: #/0 or #/0/0
        const numericPattern = /^\d+(\/\d+)?$/;
        if (numericPattern.test(path)) return; // valid numeric

        // Check if it's a slide ID
        if (slideIds.has(path)) return; // valid ID

        // Triple or deeper nesting
        if ((path.match(/\//g) || []).length >= 2) {
          violations.push({
            ruleId: 'broken-slide-link',
            message: `Slide link "${href}" has too many levels. Use #/<h>/<v> (max two levels).`,
            slideIndex: slide.index,
            context: `href="${href}"`,
          });
          return;
        }

        // Non-numeric, non-ID — warn
        violations.push({
          ruleId: 'broken-slide-link',
          message: `Slide link "${href}" — target ID "${path}" not found in this file. May be broken if slides are in separate files.`,
          slideIndex: slide.index,
          context: `href="${href}"`,
        });
      });
    }

    return violations;
  },
};

registerRule(brokenSlideLink);
