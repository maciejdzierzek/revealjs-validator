import { getRegisteredRules } from './rules/index.js';
import { getRegisteredCSSRules } from './rules/css-index.js';
import { getRegisteredConfigRules } from './rules/config-index.js';
import type { Violation, ValidationResult } from './rules/index.js';
import type { CSSViolation, CSSValidationResult } from './rules/css-index.js';
import type { ConfigViolation, ConfigValidationResult } from './rules/config-index.js';

export type OutputFormat = 'text' | 'json';

/** Look up fixHint: per-violation first, then rule-level default */
function getFixHint(v: { ruleId: string; fixHint?: string }): string | undefined {
  if (v.fixHint) return v.fixHint;
  // Look up from rule registries
  const htmlRule = getRegisteredRules().find((r) => r.id === v.ruleId);
  if (htmlRule?.fixHint) return htmlRule.fixHint;
  const cssRule = getRegisteredCSSRules().find((r) => r.id === v.ruleId);
  if (cssRule?.fixHint) return cssRule.fixHint;
  const configRule = getRegisteredConfigRules().find((r) => r.id === v.ruleId);
  if (configRule?.fixHint) return configRule.fixHint;
  return undefined;
}

interface FileResult {
  file: string;
  result: ValidationResult | CSSValidationResult | ConfigValidationResult;
}

function hintLine(v: { ruleId: string; fixHint?: string }): string {
  const hint = getFixHint(v);
  return hint ? `\n         Fix: ${hint}` : '';
}

function formatHTMLViolation(file: string, v: Violation, symbol: string): string {
  const loc = `slide ${v.slideIndex + 1}`;
  const ctx = v.context ? ` (${v.context})` : '';
  return `  ${symbol} ${file}:${loc} [${v.ruleId}] ${v.message}${ctx}${hintLine(v)}`;
}

function formatCSSViolation(file: string, v: CSSViolation, symbol: string): string {
  const loc = `line ${v.line}`;
  return `  ${symbol} ${file}:${loc} [${v.ruleId}] ${v.message}${hintLine(v)}`;
}

function formatConfigViolation(file: string, v: ConfigViolation, symbol: string): string {
  return `  ${symbol} ${file} [${v.ruleId}] ${v.message}${hintLine(v)}`;
}

function formatViolation(file: string, v: Violation | CSSViolation | ConfigViolation, symbol: string): string {
  if ('slideIndex' in v) {
    return formatHTMLViolation(file, v, symbol);
  }
  if ('line' in v) {
    return formatCSSViolation(file, v as CSSViolation, symbol);
  }
  return formatConfigViolation(file, v as ConfigViolation, symbol);
}

export function formatText(results: FileResult[]): string {
  const lines: string[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const { file, result } of results) {
    for (const err of result.errors) {
      lines.push(formatViolation(file, err, '\u2717'));
      totalErrors++;
    }
    for (const warn of result.warnings) {
      lines.push(formatViolation(file, warn, '\u26A0'));
      totalWarnings++;
    }
  }

  lines.push('');
  const fileCount = results.length;
  const parts = [`${fileCount} file${fileCount !== 1 ? 's' : ''}`];
  if (totalErrors > 0) parts.push(`${totalErrors} error${totalErrors !== 1 ? 's' : ''}`);
  if (totalWarnings > 0) parts.push(`${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`);
  if (totalErrors === 0 && totalWarnings === 0) parts.push('all clean');
  lines.push(parts.join(', '));

  return lines.join('\n');
}

export function formatJSON(results: FileResult[]): string {
  return JSON.stringify(
    results.map(({ file, result }) => ({
      file,
      errors: result.errors,
      warnings: result.warnings,
      passed: result.passed,
    })),
    null,
    2,
  );
}

export function format(results: FileResult[], outputFormat: OutputFormat): string {
  return outputFormat === 'json' ? formatJSON(results) : formatText(results);
}
