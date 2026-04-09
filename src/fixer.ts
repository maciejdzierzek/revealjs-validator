import { readFileSync, writeFileSync } from 'fs';
import { parseSlides } from './parser.js';
import { parseCSS } from './css-parser.js';
import { runRules, getRegisteredRules } from './rules/index.js';
import { runCSSRules, getRegisteredCSSRules } from './rules/css-index.js';
import type { RuleConfig, Violation } from './rules/index.js';
import type { CSSViolation } from './rules/css-index.js';

export interface FixResult {
  /** Number of violations fixed */
  fixed: number;
  /** Violations that could not be auto-fixed */
  remaining: (Violation | CSSViolation)[];
  /** Whether the file was modified */
  modified: boolean;
}

const MAX_ITERATIONS = 10;

/**
 * Fix violations in an HTML file. Iterates until no more fixable violations
 * or max iterations reached.
 */
export function fixHTMLSource(
  source: string,
  config?: RuleConfig,
): { source: string; fixed: number; remaining: Violation[] } {
  let current = source;
  let totalFixed = 0;
  const rules = getRegisteredRules();

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const parsed = parseSlides(current);
    const result = runRules(parsed, config);
    const allViolations = [...result.errors, ...result.warnings];

    if (allViolations.length === 0) break;

    let fixedThisRound = 0;
    for (const violation of allViolations) {
      const rule = rules.find((r) => r.id === violation.ruleId);
      if (!rule?.fix) continue;

      const fixed = rule.fix(current, violation);
      if (fixed !== null && fixed !== current) {
        current = fixed;
        fixedThisRound++;
        totalFixed++;
        break; // re-parse after each fix to avoid stale positions
      }
    }

    if (fixedThisRound === 0) break; // no more fixable violations
  }

  // Final validation for remaining violations
  const parsed = parseSlides(current);
  const result = runRules(parsed, config);
  const remaining = [...result.errors, ...result.warnings];

  return { source: current, fixed: totalFixed, remaining };
}

/**
 * Fix violations in a CSS file.
 */
export function fixCSSSource(
  source: string,
  config?: RuleConfig,
): { source: string; fixed: number; remaining: CSSViolation[] } {
  let current = source;
  let totalFixed = 0;
  const rules = getRegisteredCSSRules();

  for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
    const parsed = parseCSS(current);
    const result = runCSSRules(parsed, config);
    const allViolations = [...result.errors, ...result.warnings];

    if (allViolations.length === 0) break;

    let fixedThisRound = 0;
    for (const violation of allViolations) {
      const rule = rules.find((r) => r.id === violation.ruleId);
      if (!rule?.fix) continue;

      const fixed = rule.fix(current, violation);
      if (fixed !== null && fixed !== current) {
        current = fixed;
        fixedThisRound++;
        totalFixed++;
        break;
      }
    }

    if (fixedThisRound === 0) break;
  }

  const parsed = parseCSS(current);
  const result = runCSSRules(parsed, config);
  const remaining = [...result.errors, ...result.warnings];

  return { source: current, fixed: totalFixed, remaining };
}

/**
 * Fix a file in-place. Returns fix result.
 */
export function fixFile(
  filePath: string,
  config?: RuleConfig,
  dryRun = false,
): FixResult {
  const source = readFileSync(filePath, 'utf-8');
  const isCSS = filePath.endsWith('.css');

  const result = isCSS
    ? fixCSSSource(source, config)
    : fixHTMLSource(source, config);

  const modified = result.source !== source;

  if (modified && !dryRun) {
    writeFileSync(filePath, result.source, 'utf-8');
  }

  return {
    fixed: result.fixed,
    remaining: result.remaining,
    modified,
  };
}
