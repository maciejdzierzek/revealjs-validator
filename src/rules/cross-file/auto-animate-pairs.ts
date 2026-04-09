import { registerCrossFileRule } from './index.js';
import type { CrossFileViolation, CrossFileRule, CrossFileContext } from './index.js';
import type { SlideElement } from '../../parser.js';

function collectDataIds(el: SlideElement): Set<string> {
  const ids = new Set<string>();
  function walk(e: SlideElement): void {
    const id = e.attributes['data-id'];
    if (id) ids.add(id);
    for (const child of e.children) walk(child);
  }
  walk(el);
  return ids;
}

function hasAttr(el: SlideElement, attr: string): boolean {
  return attr in el.attributes;
}

// ---------------------------------------------------------------------------
// Rule: cross-auto-animate-pairs
//
// Source: docs/source/auto-animate.md
// "add data-auto-animate to two adjacent slide <section> elements"
//
// Cross-file: checks pairs (N, N+1) in config.json slide order.
// An object (data-id) can chain through many slides — each consecutive
// pair is validated independently.
// ---------------------------------------------------------------------------
const crossAutoAnimatePairs: CrossFileRule = {
  id: 'cross-auto-animate-pairs',
  category: 'cross-file',
  defaultSeverity: 'error',
  description:
    'Cross-file auto-animate pair check — validates data-auto-animate and data-id continuity between consecutive slides.',
  docsReference: 'auto-animate.md — "add data-auto-animate to two adjacent slide <section> elements"',
  crosscheckKey: 'auto-animate-pairs',
  check(ctx: CrossFileContext): CrossFileViolation[] {
    const violations: CrossFileViolation[] = [];
    const { slides } = ctx;

    if (slides.length < 2) return violations;

    for (let i = 0; i < slides.length; i++) {
      const current = slides[i];
      const currentSlide = current.parsed.flatSlides[0];
      if (!currentSlide) continue;

      const hasAutoAnimate = hasAttr(currentSlide.element, 'data-auto-animate');
      if (!hasAutoAnimate) continue;

      const groupId = currentSlide.element.attributes['data-auto-animate-id'] ?? null;

      // Check previous slide (N-1)
      const hasPrev = i > 0 && checkNeighbor(slides[i - 1], groupId);
      // Check next slide (N+1)
      const hasNext = i < slides.length - 1 && checkNeighbor(slides[i + 1], groupId);

      // Next slide has data-auto-animate-restart? That breaks the chain intentionally.
      const nextHasRestart = i < slides.length - 1 &&
        slides[i + 1].parsed.flatSlides[0] &&
        hasAttr(slides[i + 1].parsed.flatSlides[0].element, 'data-auto-animate-restart');

      if (!hasPrev && !hasNext && !nextHasRestart) {
        violations.push({
          ruleId: 'cross-auto-animate-pairs',
          message:
            `Slide has data-auto-animate but neither the previous nor next slide shares it. ` +
            `Auto-animate needs a pair of consecutive slides.`,
          file: current.file,
          slideId: current.slideId,
          slideIndex: i,
        });
        continue;
      }

      // Check data-id continuity between this slide and next
      if (hasNext && i < slides.length - 1) {
        const nextSlide = slides[i + 1].parsed.flatSlides[0];
        if (!nextSlide) continue;

        const nextHasAutoAnimate = hasAttr(nextSlide.element, 'data-auto-animate');
        if (!nextHasAutoAnimate) continue;

        // Group ID must match if present
        const nextGroupId = nextSlide.element.attributes['data-auto-animate-id'] ?? null;
        if (groupId !== null && nextGroupId !== null && groupId !== nextGroupId) continue;

        const currentIds = collectDataIds(currentSlide.element);
        const nextIds = collectDataIds(nextSlide.element);

        // Check: data-id elements in current that have inline style
        // (warning if matched element lacks inline style for animation)
        for (const id of currentIds) {
          if (nextIds.has(id)) {
            // Matched pair — check inline styles on both sides
            const currentHasStyle = hasInlineStyleOnDataId(currentSlide.element, id);
            const nextHasStyle = hasInlineStyleOnDataId(nextSlide.element, id);

            if (!currentHasStyle && !nextHasStyle) {
              violations.push({
                ruleId: 'cross-auto-animate-pairs',
                message:
                  `data-id="${id}" is matched between slides but neither has inline style. ` +
                  `Auto-animate animates inline style properties — without them, the animation has nothing to interpolate.`,
                file: current.file,
                slideId: current.slideId,
                slideIndex: i,
              });
            }
          }
        }
      }
    }

    return violations;
  },
};

function checkNeighbor(
  neighbor: { parsed: { flatSlides: { element: SlideElement }[] } },
  groupId: string | null,
): boolean {
  const slide = neighbor.parsed.flatSlides[0];
  if (!slide) return false;
  if (!hasAttr(slide.element, 'data-auto-animate')) return false;
  if (groupId !== null) {
    const neighborGroupId = slide.element.attributes['data-auto-animate-id'] ?? null;
    if (neighborGroupId !== null && neighborGroupId !== groupId) return false;
  }
  return true;
}

function hasInlineStyleOnDataId(el: SlideElement, dataId: string): boolean {
  let found = false;
  function walk(e: SlideElement): void {
    if (e.attributes['data-id'] === dataId && e.inlineStyle) {
      found = true;
    }
    for (const child of e.children) {
      if (!found) walk(child);
    }
  }
  walk(el);
  return found;
}

registerCrossFileRule(crossAutoAnimatePairs);
