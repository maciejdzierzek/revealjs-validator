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
// Complete whitelist of all valid Reveal.js data-* attributes
// Source: all files in docs/source/*.md
// ---------------------------------------------------------------------------

// Attributes valid on <section> elements
const SECTION_ATTRS = new Set([
  // Backgrounds (backgrounds.md)
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
  // Transitions (transitions.md)
  'data-transition',
  'data-transition-speed',
  // Auto-animate (auto-animate.md)
  'data-auto-animate',
  'data-auto-animate-easing',
  'data-auto-animate-duration',
  'data-auto-animate-unmatched',
  'data-auto-animate-id',
  'data-auto-animate-restart',
  // Visibility (slide-visibility.md)
  'data-visibility',
  // State (markup.md)
  'data-state',
  // Timing (speaker-view.md, auto-slide.md)
  'data-timing',
  'data-autoslide',
  // Notes (speaker-view.md)
  'data-notes',
  // Markdown (markdown.md)
  'data-markdown',
  'data-separator',
  'data-separator-vertical',
  'data-separator-notes',
  'data-charset',
  // Navigation (touch-navigation.md)
  'data-prevent-swipe',
  // Preload (media.md)
  'data-preload',
]);

// Attributes valid on child elements (non-section)
const ELEMENT_ATTRS = new Set([
  // Auto-animate (auto-animate.md)
  'data-id',
  'data-auto-animate-delay',
  'data-auto-animate-duration',
  'data-auto-animate-easing',
  // Fragments (fragments.md)
  'data-fragment-index',
  // Auto-slide on fragments (auto-slide.md)
  'data-autoslide',
  // Code (code.md)
  'data-line-numbers',
  'data-ln-start-from',
  'data-noescape',
  'data-trim',
  // Media (media.md)
  'data-src',
  'data-autoplay',
  'data-ignore',
  'data-preload',
  // Lightbox (lightbox.md)
  'data-preview-image',
  'data-preview-video',
  'data-preview-link',
  'data-preview-fit',
  // Navigation (touch-navigation.md)
  'data-prevent-swipe',
  // Markdown element wrapper
  'data-template',
]);

// All valid attributes combined
const ALL_VALID = new Set([...SECTION_ATTRS, ...ELEMENT_ATTRS]);

// Common typos and their corrections
const TYPO_SUGGESTIONS: Record<string, string> = {
  'data-transiton': 'data-transition',
  'data-transtion': 'data-transition',
  'data-backgroud': 'data-background-color',
  'data-backround-color': 'data-background-color',
  'data-background-colour': 'data-background-color',
  'data-auto-animte': 'data-auto-animate',
  'data-autoanimate': 'data-auto-animate',
  'data-fragement-index': 'data-fragment-index',
  'data-fragmnet-index': 'data-fragment-index',
  'data-visibilty': 'data-visibility',
  'data-visualiity': 'data-visibility',
  'data-visiblity': 'data-visibility',
  'data-timeing': 'data-timing',
  'data-autoslied': 'data-autoslide',
  'data-line-number': 'data-line-numbers',
  'data-markdown-separator': 'data-separator',
  'data-bg-color': 'data-background-color',
  'data-bg-image': 'data-background-image',
  'data-speaker-notes': 'data-notes',
};

// ---------------------------------------------------------------------------
// Rule: unknown-data-attribute
//
// Source: all docs/source/*.md
// Typos in data-* attributes are the most common silent bug. The attribute
// is ignored and the feature doesn't work, with zero error messages.
// ---------------------------------------------------------------------------
const unknownDataAttribute: Rule = {
  id: 'unknown-data-attribute',
  category: 'attributes',
  defaultSeverity: 'warn',
  description:
    'Unknown Reveal.js data-* attribute — likely a typo. Feature will silently not work.',
  docsReference: 'All docs — comprehensive whitelist of valid Reveal.js data-* attributes',
  check(parsed: ParseResult): Violation[] {
    const violations: Violation[] = [];

    for (const slide of parsed.flatSlides) {
      // Check section attributes
      for (const attr of Object.keys(slide.element.attributes)) {
        if (!attr.startsWith('data-')) continue;
        if (ALL_VALID.has(attr)) continue;
        // Skip custom data attributes (not Reveal.js specific)
        // Only flag attributes that LOOK like Reveal.js attrs (common prefixes)
        if (!looksLikeRevealAttribute(attr)) continue;

        const suggestion = TYPO_SUGGESTIONS[attr];
        const msg = suggestion
          ? `Unknown attribute "${attr}" on <section> — did you mean "${suggestion}"?`
          : `Unknown Reveal.js attribute "${attr}" on <section>. Check spelling.`;

        violations.push({
          ruleId: 'unknown-data-attribute',
          message: msg,
          slideIndex: slide.index,
          context: `${attr}="${slide.element.attributes[attr]}"`,
        });
      }

      // Check child elements
      walkElements(slide.element, (el) => {
        if (el.tag === 'section') return;
        for (const attr of Object.keys(el.attributes)) {
          if (!attr.startsWith('data-')) continue;
          if (ALL_VALID.has(attr)) continue;
          if (!looksLikeRevealAttribute(attr)) continue;

          const suggestion = TYPO_SUGGESTIONS[attr];
          const msg = suggestion
            ? `Unknown attribute "${attr}" on <${el.tag}> — did you mean "${suggestion}"?`
            : `Unknown Reveal.js attribute "${attr}" on <${el.tag}>. Check spelling.`;

          violations.push({
            ruleId: 'unknown-data-attribute',
            message: msg,
            slideIndex: slide.index,
            context: `<${el.tag} ${attr}>`,
          });
        }
      });
    }

    return violations;
  },
};

/**
 * Heuristic: does this data-* attribute look like it's trying to be a
 * Reveal.js attribute? We don't want to flag custom app attributes
 * like data-testid, data-tooltip, etc.
 */
function looksLikeRevealAttribute(attr: string): boolean {
  const revealPrefixes = [
    'data-background',
    'data-transition',
    'data-auto-animate',
    'data-autoanimate',
    'data-auto-slide',
    'data-autoslide',
    'data-autoslied',
    'data-fragment',
    'data-fragement',
    'data-fragmnet',
    'data-visibility',
    'data-visualiity',
    'data-visibilty',
    'data-visiblity',
    'data-markdown',
    'data-separator',
    'data-charset',
    'data-timing',
    'data-timeing',
    'data-notes',
    'data-speaker',
    'data-state',
    'data-preload',
    'data-preview',
    'data-line-number',
    'data-ln-',
    'data-noescape',
    'data-trim',
    'data-prevent',
    'data-autoplay',
    'data-ignore',
    'data-bg-',
    'data-backgr',
    'data-transit',
    'data-animat',
  ];
  return revealPrefixes.some((prefix) => attr.startsWith(prefix));
}

registerRule(unknownDataAttribute);
