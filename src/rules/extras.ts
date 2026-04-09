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
// Rule: data-line-numbers-format
//
// Source: docs/source/code.md
// "data-line-numbers="3,8-10"" / "data-line-numbers="1|2-3|4,6-10""
// Format: pipe-separated steps, each step is comma-separated ranges.
// Each range is a number or number-number.
// ---------------------------------------------------------------------------
// Each step (pipe-separated) is comma-separated items. Each item: number or number-number.
const LINE_NUM_STEP = /^\d+(-\d+)?(,\d+(-\d+)?)*$/;
const LINE_NUM_PATTERN = {
  test(val: string): boolean {
    return val.split('|').every((step) => LINE_NUM_STEP.test(step.trim()));
  },
};

const dataLineNumbersFormat: Rule = {
  id: 'data-line-numbers-format',
  category: 'structure',
  defaultSeverity: 'error',
  description: 'data-line-numbers has invalid format. Use: "1,3-5" or "1|2-3|4,6-10" for step-by-step highlights.',
  docsReference: 'code.md — "data-line-numbers" format',
  fixHint: 'Use: numbers (3), ranges (3-5), commas (1,3,5), or pipes for steps (1|2-3|4)',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        const val = el.attributes['data-line-numbers'];
        if (val === undefined || val === '') return; // empty = show all line numbers
        if (LINE_NUM_PATTERN.test(val.trim())) return; // valid
        violations.push({
          ruleId: 'data-line-numbers-format',
          message: `Invalid data-line-numbers format "${val}". Use numbers, ranges (3-5), commas (1,3,5), and pipes for steps (1|2-3|4).`,
          slideIndex: slide.index,
          context: `data-line-numbers="${val}"`,
        });
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: duplicate-notes
//
// Source: docs/source/speaker-view.md
// Both data-notes attribute AND <aside class="notes"> on same slide
// is redundant and confusing.
// ---------------------------------------------------------------------------
const duplicateNotes: Rule = {
  id: 'duplicate-notes',
  category: 'structure',
  defaultSeverity: 'warn',
  description: 'Slide has both data-notes attribute and <aside class="notes"> — redundant. Use one approach.',
  docsReference: 'speaker-view.md — two ways to add notes',
  fixHint: 'Use either data-notes="..." OR <aside class="notes">, not both',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const hasDataNotes = 'data-notes' in slide.element.attributes;
      let hasAsideNotes = false;
      walkElements(slide.element, (el) => {
        if (el.tag === 'aside' && el.classList.includes('notes')) {
          hasAsideNotes = true;
        }
      });
      if (hasDataNotes && hasAsideNotes) {
        violations.push({
          ruleId: 'duplicate-notes',
          message: 'Slide has both data-notes and <aside class="notes">. Use one approach to avoid confusion.',
          slideIndex: slide.index,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-background-size
//
// Source: docs/source/backgrounds.md — data-background-size
// Must be valid CSS background-size: cover, contain, or length/percentage.
// ---------------------------------------------------------------------------
const VALID_BG_SIZE_KEYWORDS = new Set(['cover', 'contain', 'auto']);
const CSS_LENGTH = /^\d+(\.\d+)?(px|em|rem|%|vh|vw|cm|mm|in|pt|pc)$/;

const validBackgroundSize: Rule = {
  id: 'valid-background-size',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description: 'data-background-size must be valid CSS: cover, contain, auto, or a length/percentage.',
  docsReference: 'backgrounds.md — data-background-size',
  fixHint: 'Use: cover, contain, auto, or CSS length (100px, 50%)',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-background-size'];
      if (val === undefined) continue;
      const parts = val.trim().split(/\s+/);
      for (const part of parts) {
        if (VALID_BG_SIZE_KEYWORDS.has(part)) continue;
        if (CSS_LENGTH.test(part)) continue;
        violations.push({
          ruleId: 'valid-background-size',
          message: `Invalid data-background-size value "${val}". Use cover, contain, auto, or CSS length (e.g., 100px, 50%).`,
          slideIndex: slide.index,
          context: `data-background-size="${val}"`,
        });
        break;
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-background-position
//
// Source: docs/source/backgrounds.md — data-background-position
// Must be valid CSS background-position keywords or lengths.
// ---------------------------------------------------------------------------
const VALID_BG_POS_KEYWORDS = new Set([
  'top', 'bottom', 'left', 'right', 'center',
]);

const validBackgroundPosition: Rule = {
  id: 'valid-background-position',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description: 'data-background-position must be valid CSS: top, bottom, left, right, center, or length/percentage.',
  docsReference: 'backgrounds.md — data-background-position',
  fixHint: 'Use: top, bottom, left, right, center, or CSS length',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-background-position'];
      if (val === undefined) continue;
      const parts = val.trim().split(/\s+/);
      for (const part of parts) {
        if (VALID_BG_POS_KEYWORDS.has(part)) continue;
        if (CSS_LENGTH.test(part)) continue;
        violations.push({
          ruleId: 'valid-background-position',
          message: `Possibly invalid data-background-position "${val}". Use CSS keywords (top, center, bottom) or lengths.`,
          slideIndex: slide.index,
          context: `data-background-position="${val}"`,
        });
        break;
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-background-repeat
//
// Source: docs/source/backgrounds.md — data-background-repeat
// ---------------------------------------------------------------------------
const VALID_BG_REPEAT = new Set([
  'repeat', 'repeat-x', 'repeat-y', 'no-repeat', 'space', 'round',
]);

const validBackgroundRepeat: Rule = {
  id: 'valid-background-repeat',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description: 'data-background-repeat must be: repeat, repeat-x, repeat-y, no-repeat, space, or round.',
  docsReference: 'backgrounds.md — data-background-repeat',
  fixHint: 'Use: repeat, repeat-x, repeat-y, no-repeat, space, round',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      const val = slide.element.attributes['data-background-repeat'];
      if (val === undefined) continue;
      if (!VALID_BG_REPEAT.has(val.trim())) {
        violations.push({
          ruleId: 'valid-background-repeat',
          message: `Invalid data-background-repeat "${val}". Valid: ${[...VALID_BG_REPEAT].join(', ')}.`,
          slideIndex: slide.index,
          context: `data-background-repeat="${val}"`,
        });
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-autoslide-on-fragment
//
// Source: docs/source/auto-slide.md
// "override the slide duration for individual slides and fragments"
// data-autoslide on non-section, non-fragment elements does nothing.
// ---------------------------------------------------------------------------
const dataAutoslideOnFragment: Rule = {
  id: 'data-autoslide-on-fragment',
  category: 'structure',
  defaultSeverity: 'warn',
  description: 'data-autoslide on an element without class="fragment" has no effect. Only works on <section> or fragments.',
  docsReference: 'auto-slide.md — "individual slides and fragments"',
  fixHint: 'Add class="fragment" to this element, or move data-autoslide to <section>',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if (!('data-autoslide' in el.attributes)) return;
        if (el.classList.includes('fragment')) return;
        violations.push({
          ruleId: 'data-autoslide-on-fragment',
          message: `data-autoslide on <${el.tag}> without class="fragment" has no effect.`,
          slideIndex: slide.index,
          context: `<${el.tag} data-autoslide="${el.attributes['data-autoslide']}">`,
        });
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: uncounted-not-at-end
//
// Source: docs/source/slide-visibility.md
// "Note: This only works for slides at the end of the presentation,
//  after all of your main slides."
// ---------------------------------------------------------------------------
const uncountedNotAtEnd: Rule = {
  id: 'uncounted-not-at-end',
  category: 'structure',
  defaultSeverity: 'warn',
  description: 'data-visibility="uncounted" only works on slides at the end, after all main slides.',
  docsReference: 'slide-visibility.md — "only works for slides at the end"',
  fixHint: 'Move data-visibility="uncounted" slides to the end',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    const flat = parsed.flatSlides;
    let foundUncounted = false;

    for (let i = 0; i < flat.length; i++) {
      const vis = flat[i].element.attributes['data-visibility'];
      if (vis === 'uncounted') {
        foundUncounted = true;
      } else if (foundUncounted && vis !== 'hidden') {
        // A normal slide after an uncounted slide = uncounted was in the middle
        // Go back and flag all uncounted slides before this point
        for (let j = 0; j < i; j++) {
          if (flat[j].element.attributes['data-visibility'] === 'uncounted') {
            violations.push({
              ruleId: 'uncounted-not-at-end',
              message: 'data-visibility="uncounted" slide is followed by regular slides. Uncounted only works at the end of the presentation.',
              slideIndex: j,
            });
          }
        }
        break;
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-ignore-on-media
//
// Source: docs/source/media.md
// "This can be disabled by decorating your element with a data-ignore attribute"
// Only meaningful on <video>, <audio>, <iframe>.
// ---------------------------------------------------------------------------
const MEDIA_TAGS = new Set(['video', 'audio', 'iframe']);

const dataIgnoreOnMedia: Rule = {
  id: 'data-ignore-on-media',
  category: 'media',
  defaultSeverity: 'warn',
  description: 'data-ignore only works on <video>, <audio>, and <iframe>. On other elements it does nothing.',
  docsReference: 'media.md — "decorating your element with a data-ignore attribute"',
  fixHint: 'Move data-ignore to a <video>, <audio>, or <iframe> element',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if (!('data-ignore' in el.attributes)) return;
        if (MEDIA_TAGS.has(el.tag)) return;
        violations.push({
          ruleId: 'data-ignore-on-media',
          message: `data-ignore on <${el.tag}> has no effect. Only <video>, <audio>, and <iframe> support it.`,
          slideIndex: slide.index,
          context: `<${el.tag} data-ignore>`,
        });
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: r-stack-without-fragments
//
// Source: docs/source/layout.md
// "The r-stack layout helper lets you center and place multiple elements
//  on top of each other. This is intended to be used together with fragments"
// Without fragments, all elements are stacked on top with no way to reveal.
// ---------------------------------------------------------------------------
const rStackWithoutFragments: Rule = {
  id: 'r-stack-without-fragments',
  category: 'layout',
  defaultSeverity: 'warn',
  description: 'r-stack without fragment children — all elements will be stacked on top of each other with no way to reveal them.',
  docsReference: 'layout.md — "intended to be used together with fragments"',
  fixHint: 'Add class="fragment" to children inside r-stack',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (!el.classList.includes('r-stack')) return;
        const hasFragment = el.children.some((child) =>
          child.classList.includes('fragment'),
        );
        if (!hasFragment && el.children.length > 1) {
          violations.push({
            ruleId: 'r-stack-without-fragments',
            message: 'r-stack has multiple children but none are fragments. Elements will overlap with no way to reveal them individually.',
            slideIndex: slide.index,
            context: `<${el.tag} class="r-stack"> (${el.children.length} children, 0 fragments)`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-preview-fit
//
// Source: docs/source/lightbox.md
// "data-preview-fit: scale-down (default), contain, cover"
// ---------------------------------------------------------------------------
const VALID_PREVIEW_FIT = new Set(['scale-down', 'contain', 'cover']);

const validPreviewFit: Rule = {
  id: 'valid-preview-fit',
  category: 'media',
  defaultSeverity: 'warn',
  description: 'data-preview-fit must be: scale-down, contain, or cover.',
  docsReference: 'lightbox.md — data-preview-fit values',
  fixHint: 'Use: scale-down, contain, or cover',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        const val = el.attributes['data-preview-fit'];
        if (val === undefined) return;
        if (!VALID_PREVIEW_FIT.has(val.trim())) {
          violations.push({
            ruleId: 'valid-preview-fit',
            message: `Invalid data-preview-fit "${val}". Valid: scale-down, contain, cover.`,
            slideIndex: slide.index,
            context: `data-preview-fit="${val}"`,
          });
        }
      });
    }
    return violations;
  },
};

registerRule(dataLineNumbersFormat);
registerRule(duplicateNotes);
registerRule(validBackgroundSize);
registerRule(validBackgroundPosition);
registerRule(validBackgroundRepeat);
registerRule(dataAutoslideOnFragment);
registerRule(uncountedNotAtEnd);
registerRule(dataIgnoreOnMedia);
registerRule(rStackWithoutFragments);
registerRule(validPreviewFit);
