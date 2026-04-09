import { readFileSync } from 'fs';
import { parseSlides } from './parser.js';
import { runRules } from './rules/index.js';
import type { RuleConfig, ValidationResult } from './rules/index.js';

// Import rule modules to trigger registration
import './rules/backgrounds.js';

export { parseSlides } from './parser.js';
export { runRules, getRegisteredRules } from './rules/index.js';
export type { Rule, Violation, ValidationResult, RuleConfig, Severity } from './rules/index.js';
export type { Slide, SlideElement, ParseResult } from './parser.js';

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
