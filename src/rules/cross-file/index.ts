import type { ProjectContext } from '../../project-loader.js';
import type { ParseResult } from '../../parser.js';
import type { CSSParseResult } from '../../css-parser.js';
import type { Severity, RuleConfig } from '../index.js';
import type { CrosscheckConfig } from '../../config.js';

export interface CrossFileViolation {
  ruleId: string;
  message: string;
  /** File where the violation occurs */
  file: string;
  /** Slide ID or index for context */
  slideId?: string;
  slideIndex?: number;
}

export interface CrossFileRule {
  id: string;
  category: string;
  defaultSeverity: Severity;
  description: string;
  docsReference: string;
  /** Which crosscheck config key controls this rule */
  crosscheckKey: keyof CrosscheckConfig;
  check(ctx: CrossFileContext): CrossFileViolation[];
}

export interface CrossFileContext {
  project: ProjectContext;
  /** Parsed slides in config.json order */
  slides: { file: string; slideId?: string; parsed: ParseResult }[];
  /** Parsed CSS files */
  css: { file: string; parsed: CSSParseResult }[];
}

export interface CrossFileResult {
  errors: CrossFileViolation[];
  warnings: CrossFileViolation[];
  passed: boolean;
}

const crossFileRegistry: CrossFileRule[] = [];

export function registerCrossFileRule(rule: CrossFileRule): void {
  crossFileRegistry.push(rule);
}

export function getRegisteredCrossFileRules(): readonly CrossFileRule[] {
  return crossFileRegistry;
}

export function runCrossFileRules(
  ctx: CrossFileContext,
  ruleConfig: RuleConfig = {},
  crosscheckConfig: CrosscheckConfig = {},
): CrossFileResult {
  const errors: CrossFileViolation[] = [];
  const warnings: CrossFileViolation[] = [];

  for (const rule of crossFileRegistry) {
    // Check crosscheck toggle (default: true)
    const enabled = crosscheckConfig[rule.crosscheckKey];
    if (enabled === false) continue;

    const severity = ruleConfig[rule.id] ?? rule.defaultSeverity;
    if (severity === 'off') continue;

    const violations = rule.check(ctx);
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
