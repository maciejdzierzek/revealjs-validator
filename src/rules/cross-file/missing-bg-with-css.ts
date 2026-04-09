import { registerCrossFileRule } from './index.js';
import type { CrossFileViolation, CrossFileRule, CrossFileContext } from './index.js';

// Background-related CSS properties
const BG_PROPERTIES = new Set([
  'background', 'background-color', 'background-image',
]);

// Selectors that set global background
function selectorIsGlobalBackground(selector: string): boolean {
  const s = selector.trim();
  return s === '.reveal' || s === '.reveal-viewport' ||
    /^\.reveal\s*$/.test(s) || /^\.reveal-viewport\s*$/.test(s) ||
    /^\.reveal[:\[.]/.test(s) || /^\.reveal-viewport[:\[.]/.test(s);
}

// ---------------------------------------------------------------------------
// Rule: cross-missing-bg-with-css
//
// Source: docs/source/backgrounds.md
// Cross-file: if CSS does NOT set global background on .reveal, then
// slides without data-background-* will get white background.
// If CSS DOES set global background, slides without data-background-*
// rely on CSS — but after fixing css-no-background-on-reveal they'll
// turn white. Either way: every slide should have explicit background.
// ---------------------------------------------------------------------------
const crossMissingBgWithCSS: CrossFileRule = {
  id: 'cross-missing-bg-with-css',
  category: 'cross-file',
  defaultSeverity: 'error',
  description:
    'Slide has no data-background-* and CSS theme does not set global background — slide will be white.',
  docsReference: 'backgrounds.md — backgrounds via data-background-* attributes',
  crosscheckKey: 'missing-background-with-css',
  check(ctx: CrossFileContext): CrossFileViolation[] {
    const violations: CrossFileViolation[] = [];

    // Check if any CSS file sets global background on .reveal
    let cssHasGlobalBg = false;
    for (const { parsed } of ctx.css) {
      for (const rule of parsed.rules) {
        for (const sel of rule.selectorParts) {
          if (!selectorIsGlobalBackground(sel)) continue;
          for (const decl of rule.declarations) {
            if (BG_PROPERTIES.has(decl.property)) {
              cssHasGlobalBg = true;
            }
          }
        }
      }
    }

    // Check each slide for data-background-*
    for (let i = 0; i < ctx.slides.length; i++) {
      const { file, slideId, parsed } = ctx.slides[i];
      const slide = parsed.flatSlides[0];
      if (!slide) continue;

      const attrs = Object.keys(slide.element.attributes);
      const hasAnyBg = attrs.some((a) => a.startsWith('data-background'));
      if (hasAnyBg) continue;

      if (cssHasGlobalBg) {
        // CSS sets bg but slide doesn't have own — fragile
        violations.push({
          ruleId: 'cross-missing-bg-with-css',
          message:
            'Slide has no data-background-* — relies on CSS global background. ' +
            'If CSS background is removed (as recommended), this slide will turn white. ' +
            'Add data-background-color explicitly.',
          file,
          slideId,
          slideIndex: i,
        });
      } else {
        // No CSS bg AND no data-background — definitely white
        violations.push({
          ruleId: 'cross-missing-bg-with-css',
          message:
            'Slide has no data-background-* and CSS has no global background — ' +
            'slide will have default white background. Add data-background-color.',
          file,
          slideId,
          slideIndex: i,
        });
      }
    }

    return violations;
  },
};

registerCrossFileRule(crossMissingBgWithCSS);
