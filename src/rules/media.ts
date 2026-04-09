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
// Rule: no-src-and-data-src
//
// Source: docs/source/media.md
// "To lazy load media, change src to data-src."
// Having both on the same element is likely a mistake — the browser loads
// src immediately, making data-src (lazy loading) pointless.
// ---------------------------------------------------------------------------
const noSrcAndDataSrc: Rule = {
  id: 'no-src-and-data-src',
  category: 'media',
  defaultSeverity: 'warn',
  description:
    'Element has both src and data-src — likely a mistake. Use data-src for lazy loading, or src for immediate loading.',
  docsReference: 'media.md — "To lazy load media, change src to data-src"',
  fixHint: 'Remove src (keep data-src for lazy loading) or remove data-src',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if ('src' in el.attributes && 'data-src' in el.attributes) {
          violations.push({
            ruleId: 'no-src-and-data-src',
            message: `<${el.tag}> has both src and data-src. Browser loads src immediately, making data-src pointless.`,
            slideIndex: slide.index,
            context: `<${el.tag} src="${el.attributes['src']}" data-src="${el.attributes['data-src']}">`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-autoplay-on-media
//
// Source: docs/source/media.md
// "Add data-autoplay to your media element if you want it to automatically
//  start playing when the slide is shown"
// Only meaningful on <video> and <audio>.
// ---------------------------------------------------------------------------
const MEDIA_TAGS = new Set(['video', 'audio']);

const dataAutoplayOnMedia: Rule = {
  id: 'data-autoplay-on-media',
  category: 'media',
  defaultSeverity: 'warn',
  description: 'data-autoplay is only meaningful on <video> and <audio> elements.',
  docsReference: 'media.md — "Add data-autoplay to your media element"',
  fixHint: 'Move data-autoplay to a <video> or <audio> element',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        if ('data-autoplay' in el.attributes && !MEDIA_TAGS.has(el.tag)) {
          violations.push({
            ruleId: 'data-autoplay-on-media',
            message: `data-autoplay on <${el.tag}> has no effect. Only <video> and <audio> support it.`,
            slideIndex: slide.index,
            context: `<${el.tag} data-autoplay>`,
          });
        }
      });
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: data-preload-needs-data-src
//
// Source: docs/source/media.md
// "Iframes with data-src will only be loaded when they become visible.
//  If you'd like to preload lazy-loaded iframes, you can use data-preload."
// data-preload only makes sense with data-src (lazy loading).
// With src, the iframe loads immediately — preload does nothing.
// ---------------------------------------------------------------------------
const dataPreloadNeedsDataSrc: Rule = {
  id: 'data-preload-needs-data-src',
  category: 'media',
  defaultSeverity: 'warn',
  description:
    'data-preload on <iframe> with src (not data-src) has no effect — the iframe already loads immediately.',
  docsReference: 'media.md — "If you\'d like to preload lazy-loaded iframes, you can use data-preload"',
  fixHint: 'Change src to data-src for lazy loading, then data-preload will work',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    for (const slide of parsed.flatSlides) {
      walkElements(slide.element, (el) => {
        if (el.tag !== 'iframe') return;
        if ('data-preload' in el.attributes &&
            'src' in el.attributes &&
            !('data-src' in el.attributes)) {
          violations.push({
            ruleId: 'data-preload-needs-data-src',
            message:
              'data-preload on <iframe> with src has no effect. Use data-src for lazy loading, then data-preload to preload ahead of time.',
            slideIndex: slide.index,
            context: `<iframe src="${el.attributes['src']}" data-preload>`,
          });
        }
      });
    }
    return violations;
  },
};

registerRule(noSrcAndDataSrc);
registerRule(dataAutoplayOnMedia);
registerRule(dataPreloadNeedsDataSrc);
