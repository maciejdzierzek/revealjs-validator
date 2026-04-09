import { parse, HTMLElement, Options } from 'node-html-parser';

const PARSE_OPTIONS: Partial<Options> = {
  // Parse content inside <pre>, <code>, <script> etc. so we can validate attributes
  voidTag: {
    tags: ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'],
  },
  blockTextElements: {
    // Don't treat <pre> as raw text — we need to parse <code> inside it
  },
};

export interface SlideElement {
  tag: string;
  attributes: Record<string, string>;
  classList: string[];
  inlineStyle: string;
  children: SlideElement[];
  rawHTML: string;
}

export interface Slide {
  /** 0-based index among sibling slides */
  index: number;
  /** The <section> element */
  element: SlideElement;
  /** Nested vertical slides (empty if this is a leaf slide) */
  verticalSlides: Slide[];
  /** Whether this is a vertical slide (nested inside another section) */
  isVertical: boolean;
}

export interface ParseResult {
  slides: Slide[];
  /** All leaf slides in document order (flattened vertical slides) */
  flatSlides: Slide[];
}

function toSlideElement(el: HTMLElement): SlideElement {
  const attrs: Record<string, string> = {};
  for (const [key, value] of Object.entries(el.attributes)) {
    attrs[key] = value;
  }

  const classList = (el.getAttribute('class') || '')
    .split(/\s+/)
    .filter(Boolean);

  const children: SlideElement[] = [];
  for (const child of el.childNodes) {
    if (child instanceof HTMLElement) {
      children.push(toSlideElement(child));
    }
  }

  return {
    tag: el.tagName?.toLowerCase() || '',
    attributes: attrs,
    classList,
    inlineStyle: el.getAttribute('style') || '',
    children,
    rawHTML: el.outerHTML,
  };
}

function toSlide(section: HTMLElement, index: number, isVertical: boolean): Slide {
  const nestedSections = section.querySelectorAll(':scope > section');

  const verticalSlides: Slide[] = [];
  if (nestedSections.length > 0) {
    nestedSections.forEach((nested, i) => {
      verticalSlides.push(toSlide(nested, i, true));
    });
  }

  return {
    index,
    element: toSlideElement(section),
    verticalSlides,
    isVertical,
  };
}

/**
 * Parse HTML string into a structured list of Reveal.js slides.
 *
 * Accepts either a full HTML document or a fragment containing <section> elements.
 * If sections are wrapped in a `.slides` container, only those are parsed.
 */
export function parseSlides(html: string): ParseResult {
  const root = parse(html, PARSE_OPTIONS);

  // Look for .reveal .slides wrapper, or fall back to top-level sections
  const slidesContainer =
    root.querySelector('.reveal .slides') ||
    root.querySelector('.slides') ||
    root;

  const topSections = slidesContainer.querySelectorAll(':scope > section');

  const slides: Slide[] = [];
  topSections.forEach((section, i) => {
    slides.push(toSlide(section, i, false));
  });

  // Flatten: for slides with vertical children, use the children; otherwise use the slide itself
  const flatSlides: Slide[] = [];
  for (const slide of slides) {
    if (slide.verticalSlides.length > 0) {
      flatSlides.push(...slide.verticalSlides);
    } else {
      flatSlides.push(slide);
    }
  }

  return { slides, flatSlides };
}
