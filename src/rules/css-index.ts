import type { CSSParseResult } from '../css-parser.js';
import type { Severity, RuleConfig } from './index.js';

export interface CSSViolation {
  ruleId: string;
  message: string;
  line: number;
  selector: string;
  property: string;
  value: string;
}

export interface CSSValidationRule {
  id: string;
  category: string;
  defaultSeverity: Severity;
  description: string;
  docsReference: string;
  check(parsed: CSSParseResult): CSSViolation[];
  /** Auto-fix: transform CSS source to fix the violation. Returns modified source, or null. */
  fix?: (source: string, violation: CSSViolation) => string | null;
}

export interface CSSValidationResult {
  errors: CSSViolation[];
  warnings: CSSViolation[];
  passed: boolean;
}

const cssRegistry: CSSValidationRule[] = [];

export function registerCSSRule(rule: CSSValidationRule): void {
  cssRegistry.push(rule);
}

export function getRegisteredCSSRules(): readonly CSSValidationRule[] {
  return cssRegistry;
}

export function runCSSRules(
  parsed: CSSParseResult,
  config: RuleConfig = {},
): CSSValidationResult {
  const errors: CSSViolation[] = [];
  const warnings: CSSViolation[] = [];

  for (const rule of cssRegistry) {
    const severity = config[rule.id] ?? rule.defaultSeverity;
    if (severity === 'off') continue;

    const violations = rule.check(parsed);
    if (severity === 'error') {
      errors.push(...violations);
    } else {
      warnings.push(...violations);
    }
  }

  return {
    errors,
    warnings,
    passed: errors.length === 0,
  };
}
