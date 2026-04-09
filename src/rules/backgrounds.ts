import { registerRule } from './index.js';
import type { Violation, Rule } from './index.js';
import type { ParseResult, Slide, SlideElement } from '../parser.js';

// Helper: check if an inline style contains background-related properties
const BG_STYLE_PATTERN = /\b(background\s*:|background-color\s*:|background-image\s*:|background-gradient\s*:)/i;

// All data-background-* attribute names
const BG_ATTRIBUTES = [
  'data-background-color',
  'data-background-gradient',
  'data-background-image',
  'data-background-size',
  'data-background-position',
  'data-background-repeat',
  'data-background-opacity',
  'data-background-video',
  'data-background-video-loop',
  'data-background-video-muted',
  'data-background-iframe',
  'data-background-interactive',
  'data-background-transition',
];

function walkElements(el: SlideElement, cb: (el: SlideElement) => void): void {
  cb(el);
  for (const child of el.children) {
    walkElements(child, cb);
  }
}

function forEachLeafSlide(parsed: ParseResult, cb: (slide: Slide) => void): void {
  for (const slide of parsed.flatSlides) {
    cb(slide);
  }
}

// ---------------------------------------------------------------------------
// Rule: no-css-background-on-section
//
// Source: docs/source/backgrounds.md
// "You can apply full page backgrounds outside of the slide area by adding
//  a data-background attribute to your <section> elements."
//
// CSS background on <section> only fills the content area, not the viewport.
// ---------------------------------------------------------------------------
const noCssBackgroundOnSection: Rule = {
  id: 'no-css-background-on-section',
  category: 'backgrounds',
  defaultSeverity: 'error',
  description:
    '<section> must not use inline CSS background properties. Use data-background-color, data-background-image, or data-background-gradient instead.',
  docsReference: 'backgrounds.md — "Slide Backgrounds"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    forEachLeafSlide(parsed, (slide) => {
      const style = slide.element.inlineStyle;
      if (BG_STYLE_PATTERN.test(style)) {
        violations.push({
          ruleId: 'no-css-background-on-section',
          message:
            'Inline CSS background on <section> only fills the content area, not the full viewport. Use data-background-color, data-background-image, or data-background-gradient attribute instead.',
          slideIndex: slide.index,
          context: `style="${style}"`,
        });
      }
    });
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: valid-background-attributes
//
// Source: docs/source/backgrounds.md
// All background examples show data-background-* on <section> elements only.
// These attributes are meaningless on other elements.
// ---------------------------------------------------------------------------
const validBackgroundAttributes: Rule = {
  id: 'valid-background-attributes',
  category: 'backgrounds',
  defaultSeverity: 'error',
  description:
    'data-background-* attributes are only valid on <section> elements.',
  docsReference: 'backgrounds.md — all examples use <section> elements',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    forEachLeafSlide(parsed, (slide) => {
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return; // valid target
        for (const attr of Object.keys(el.attributes)) {
          if (attr.startsWith('data-background')) {
            violations.push({
              ruleId: 'valid-background-attributes',
              message: `data-background-* attributes are only valid on <section> elements, found on <${el.tag}>.`,
              slideIndex: slide.index,
              context: `<${el.tag} ${attr}="${el.attributes[attr]}">`,
            });
          }
        }
      });
    });
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: background-opacity-range
//
// Source: docs/source/backgrounds.md — Image Backgrounds table
// "data-background-opacity — default: 1"
// Value must be between 0 and 1.
// ---------------------------------------------------------------------------
const backgroundOpacityRange: Rule = {
  id: 'background-opacity-range',
  category: 'backgrounds',
  defaultSeverity: 'error',
  description: 'data-background-opacity must be a number between 0 and 1.',
  docsReference: 'backgrounds.md — "Image Backgrounds" table, data-background-opacity row',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    forEachLeafSlide(parsed, (slide) => {
      const val = slide.element.attributes['data-background-opacity'];
      if (val === undefined) return;
      const num = parseFloat(val);
      if (isNaN(num) || num < 0 || num > 1) {
        violations.push({
          ruleId: 'background-opacity-range',
          message: `data-background-opacity must be between 0 and 1, got "${val}".`,
          slideIndex: slide.index,
          context: `data-background-opacity="${val}"`,
        });
      }
    });
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: background-video-flags
//
// Source: docs/source/backgrounds.md — Video Backgrounds
// "Automatically plays a full size video behind the slide."
// data-background-video-loop and data-background-video-muted are flags
// that only make sense when data-background-video is present.
// ---------------------------------------------------------------------------
const backgroundVideoFlags: Rule = {
  id: 'background-video-flags',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description:
    'data-background-video-loop and data-background-video-muted require data-background-video.',
  docsReference: 'backgrounds.md — "Video Backgrounds"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    const flags = ['data-background-video-loop', 'data-background-video-muted'];
    forEachLeafSlide(parsed, (slide) => {
      const hasVideo = 'data-background-video' in slide.element.attributes;
      for (const flag of flags) {
        if (flag in slide.element.attributes && !hasVideo) {
          violations.push({
            ruleId: 'background-video-flags',
            message: `${flag} has no effect without data-background-video.`,
            slideIndex: slide.index,
            context: flag,
          });
        }
      }
    });
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: background-interactive-requires-iframe
//
// Source: docs/source/backgrounds.md — Iframe Backgrounds
// "Since the iframe is in the background, it is not possible to interact
//  with it by default. To make your background iframe interactive, you can
//  add the data-background-interactive attribute."
// ---------------------------------------------------------------------------
const backgroundInteractiveRequiresIframe: Rule = {
  id: 'background-interactive-requires-iframe',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description:
    'data-background-interactive requires data-background-iframe on the same <section>.',
  docsReference: 'backgrounds.md — "Iframe Backgrounds"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    forEachLeafSlide(parsed, (slide) => {
      const hasInteractive =
        'data-background-interactive' in slide.element.attributes;
      const hasIframe =
        'data-background-iframe' in slide.element.attributes;
      if (hasInteractive && !hasIframe) {
        violations.push({
          ruleId: 'background-interactive-requires-iframe',
          message:
            'data-background-interactive has no effect without data-background-iframe.',
          slideIndex: slide.index,
          context: 'data-background-interactive',
        });
      }
    });
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: missing-slide-background
//
// Source: docs/source/backgrounds.md
// "Slides are contained within a limited portion of the screen by default."
// Without data-background-* AND without CSS background on .reveal, a slide
// gets the browser default white background. After fixing
// css-no-background-on-reveal, slides that relied on CSS background
// will turn white. Every slide should explicitly declare its background.
//
// Also: Reveal.js uses data-background-color to detect luminance and
// toggle has-dark-background / has-light-background classes. Without it,
// navigation arrows may be invisible.
// ---------------------------------------------------------------------------
const missingSlideBackground: Rule = {
  id: 'missing-slide-background',
  category: 'backgrounds',
  defaultSeverity: 'warn',
  description:
    'Slide has no data-background-* attribute. Without it, Reveal.js cannot detect luminance (navigation arrows may be wrong color) and the background defaults to white.',
  docsReference: 'backgrounds.md — "adding a data-background attribute to your <section> elements"',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];
    forEachLeafSlide(parsed, (slide) => {
      const attrs = Object.keys(slide.element.attributes);
      const hasAnyBackground = attrs.some((a) => a.startsWith('data-background'));
      if (!hasAnyBackground) {
        violations.push({
          ruleId: 'missing-slide-background',
          message:
            'Slide has no data-background-* attribute. Add at least data-background-color so Reveal.js can detect luminance and set correct navigation arrow color.',
          slideIndex: slide.index,
        });
      }
    });
    return violations;
  },
};

// Register all background rules
registerRule(noCssBackgroundOnSection);
registerRule(validBackgroundAttributes);
registerRule(backgroundOpacityRange);
registerRule(backgroundVideoFlags);
registerRule(backgroundInteractiveRequiresIframe);
registerRule(missingSlideBackground);
