import type { Slide, ParseResult } from '../parser.js';

export type Severity = 'error' | 'warn' | 'off';

export interface Violation {
  ruleId: string;
  message: string;
  slideIndex: number;
  /** Line excerpt or element description for context */
  context?: string;
}

export interface Rule {
  id: string;
  category: string;
  defaultSeverity: Severity;
  /** Short description shown in reports and docs */
  description: string;
  /** Reference to official Reveal.js docs (file in docs/source/) */
  docsReference: string;
  check(parsed: ParseResult): Violation[];
}

export interface RuleConfig {
  [ruleId: string]: Severity;
}

export interface ValidationResult {
  errors: Violation[];
  warnings: Violation[];
  passed: boolean;
}

const registry: Rule[] = [];

export function registerRule(rule: Rule): void {
  registry.push(rule);
}

export function getRegisteredRules(): readonly Rule[] {
  return registry;
}

export function runRules(
  parsed: ParseResult,
  config: RuleConfig = {},
): ValidationResult {
  const errors: Violation[] = [];
  const warnings: Violation[] = [];

  for (const rule of registry) {
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
