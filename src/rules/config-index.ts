import type { Severity, RuleConfig } from './index.js';

export interface ConfigViolation {
  ruleId: string;
  message: string;
  property: string;
  value: unknown;
}

export interface ConfigRule {
  id: string;
  category: string;
  defaultSeverity: Severity;
  description: string;
  docsReference: string;
  check(config: Record<string, unknown>): ConfigViolation[];
}

export interface ConfigValidationResult {
  errors: ConfigViolation[];
  warnings: ConfigViolation[];
  passed: boolean;
}

const configRegistry: ConfigRule[] = [];

export function registerConfigRule(rule: ConfigRule): void {
  configRegistry.push(rule);
}

export function getRegisteredConfigRules(): readonly ConfigRule[] {
  return configRegistry;
}

export function runConfigRules(
  config: Record<string, unknown>,
  ruleConfig: RuleConfig = {},
): ConfigValidationResult {
  const errors: ConfigViolation[] = [];
  const warnings: ConfigViolation[] = [];

  for (const rule of configRegistry) {
    const severity = ruleConfig[rule.id] ?? rule.defaultSeverity;
    if (severity === 'off') continue;

    const violations = rule.check(config);
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
