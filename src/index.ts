import { readFileSync } from 'fs';
import { parseSlides } from './parser.js';
import { parseCSS } from './css-parser.js';
import { runRules } from './rules/index.js';
import { runCSSRules } from './rules/css-index.js';
import type { RuleConfig, ValidationResult } from './rules/index.js';
import type { CSSValidationResult } from './rules/css-index.js';

// Import rule modules to trigger registration
import './rules/backgrounds.js';
import './rules/auto-animate.js';
import './rules/transitions.js';
import './rules/fragments.js';
import './rules/layout.js';
import './rules/media.js';
import './rules/structure.js';
import './rules/css.js';
import './rules/attributes.js';
import './rules/links.js';
import './rules/extras.js';

export { parseSlides } from './parser.js';
export { parseCSS } from './css-parser.js';
export { runRules, getRegisteredRules } from './rules/index.js';
export { runCSSRules, getRegisteredCSSRules } from './rules/css-index.js';
export type { Rule, Violation, ValidationResult, RuleConfig, Severity } from './rules/index.js';
export type { CSSValidationRule, CSSViolation, CSSValidationResult } from './rules/css-index.js';
export type { Slide, SlideElement, ParseResult } from './parser.js';
export type { CSSParseResult, CSSRule, CSSDeclaration, CSSKeyframes } from './css-parser.js';

/**
 * Validate an HTML string against Reveal.js rules.
 */
export function validate(
  html: string,
  config?: { rules?: RuleConfig },
): ValidationResult {
  const parsed = parseSlides(html);
  return runRules(parsed, config?.rules);
}

/**
 * Validate an HTML file against Reveal.js rules.
 */
export function validateFile(
  filePath: string,
  config?: { rules?: RuleConfig },
): ValidationResult {
  const html = readFileSync(filePath, 'utf-8');
  return validate(html, config);
}

/**
 * Validate a CSS string against Reveal.js rules.
 */
export function validateCSS(
  css: string,
  config?: { rules?: RuleConfig },
): CSSValidationResult {
  const parsed = parseCSS(css);
  return runCSSRules(parsed, config?.rules);
}

/**
 * Validate a CSS file against Reveal.js rules.
 */
export function validateCSSFile(
  filePath: string,
  config?: { rules?: RuleConfig },
): CSSValidationResult {
  const css = readFileSync(filePath, 'utf-8');
  return validateCSS(css, config);
}
