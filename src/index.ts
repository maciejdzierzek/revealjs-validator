import { readFileSync } from 'fs';
import { parseSlides } from './parser.js';
import { parseCSS } from './css-parser.js';
import { loadProject } from './project-loader.js';
import { runRules } from './rules/index.js';
import { runCSSRules } from './rules/css-index.js';
import { runConfigRules } from './rules/config-index.js';
import { runCrossFileRules } from './rules/cross-file/index.js';
import { parseRevealConfig } from './config-validator.js';
import type { RuleConfig, ValidationResult } from './rules/index.js';
import type { CSSValidationResult } from './rules/css-index.js';
import type { ConfigValidationResult } from './rules/config-index.js';
import type { CrossFileResult, CrossFileContext } from './rules/cross-file/index.js';
import type { ValidatorConfig } from './config.js';
import type { ProjectContext } from './project-loader.js';

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
import './rules/config-rules.js';
import './rules/cross-file/auto-animate-pairs.js';
import './rules/cross-file/css-classes.js';
import './rules/cross-file/missing-bg-with-css.js';
import './rules/cross-file/assets-exist.js';

export { parseSlides } from './parser.js';
export { parseRevealConfig } from './config-validator.js';
export { loadProject } from './project-loader.js';
export type { ProjectContext, SlideEntry } from './project-loader.js';
export { fixFile, fixHTMLSource, fixCSSSource } from './fixer.js';
export type { FixResult } from './fixer.js';
export { parseCSS } from './css-parser.js';
export { runRules, getRegisteredRules } from './rules/index.js';
export { runCSSRules, getRegisteredCSSRules } from './rules/css-index.js';
export { runConfigRules, getRegisteredConfigRules } from './rules/config-index.js';
export { runCrossFileRules, getRegisteredCrossFileRules } from './rules/cross-file/index.js';
export type { CrossFileRule, CrossFileViolation, CrossFileResult, CrossFileContext } from './rules/cross-file/index.js';
export type { Rule, Violation, ValidationResult, RuleConfig, Severity } from './rules/index.js';
export type { CSSValidationRule, CSSViolation, CSSValidationResult } from './rules/css-index.js';
export type { ConfigRule, ConfigViolation, ConfigValidationResult } from './rules/config-index.js';
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

/**
 * Validate a Reveal.js config object against config rules.
 */
export function validateConfig(
  revealConfig: Record<string, unknown>,
  config?: { rules?: RuleConfig },
): ConfigValidationResult {
  return runConfigRules(revealConfig, config?.rules);
}

/**
 * Validate a JSON file containing Reveal.js config.
 * Auto-detects "reveal" key, or treats entire JSON as config.
 */
export function validateConfigFile(
  filePath: string,
  config?: { rules?: RuleConfig },
  revealKey?: string,
): ConfigValidationResult {
  const json = readFileSync(filePath, 'utf-8');
  const revealConfig = parseRevealConfig(json, revealKey);
  return validateConfig(revealConfig, config);
}

/**
 * Validate an entire project directory with cross-file checks.
 * Runs per-file validation on each slide/CSS + cross-file rules.
 */
export function validateProject(
  projectDir: string,
  validatorConfig?: ValidatorConfig,
): ProjectValidationResult {
  const project = loadProject(projectDir, validatorConfig);
  const ruleConfig = validatorConfig?.rules ?? {};

  // Auto-disable per-file rules that cross-file replaces
  const adjustedRuleConfig: RuleConfig = {
    ...ruleConfig,
    'auto-animate-pairs': 'off',
    'data-id-needs-auto-animate': 'off',
  };

  // Parse all slides
  const parsedSlides = project.slides.map((entry) => {
    const html = readFileSync(entry.absolutePath, 'utf-8');
    return {
      file: entry.file,
      slideId: entry.id,
      parsed: parseSlides(html),
    };
  });

  // Parse all CSS (mark base files so they can be skipped in per-file and dead-code checks)
  const parsedCSS = project.cssFiles.map((file) => {
    const css = readFileSync(file, 'utf-8');
    return {
      file: file.replace(project.dir + '/', ''),
      parsed: parseCSS(css),
      isBaseFile: project.cssBaseFiles?.has(file) ?? false,
    };
  });

  // Per-file HTML validation
  const perFileResults: { file: string; result: ValidationResult }[] = [];
  for (const slide of parsedSlides) {
    const result = runRules(slide.parsed, adjustedRuleConfig);
    perFileResults.push({ file: slide.file, result });
  }

  // Per-file CSS validation (skip base files — they are platform infrastructure, not game theme)
  const perFileCSSResults: { file: string; result: CSSValidationResult }[] = [];
  for (const css of parsedCSS) {
    if (css.isBaseFile) continue;
    const result = runCSSRules(css.parsed, adjustedRuleConfig);
    perFileCSSResults.push({ file: css.file, result });
  }

  // Config validation
  let configResult: ConfigValidationResult | null = null;
  if (project.revealConfig) {
    configResult = runConfigRules(project.revealConfig, ruleConfig);
  }

  // Cross-file validation
  const crossFileCtx: CrossFileContext = {
    project,
    slides: parsedSlides,
    css: parsedCSS,
  };
  const crossFileResult = runCrossFileRules(
    crossFileCtx,
    ruleConfig,
    validatorConfig?.crosscheck ?? {},
  );

  // Aggregate
  const allErrors = [
    ...perFileResults.flatMap((r) => r.result.errors.map((e) => ({ ...e, _file: r.file }))),
    ...perFileCSSResults.flatMap((r) => r.result.errors.map((e) => ({ ...e, _file: r.file }))),
    ...(configResult?.errors.map((e) => ({ ...e, _file: 'config.json' })) ?? []),
    ...crossFileResult.errors,
  ];
  const allWarnings = [
    ...perFileResults.flatMap((r) => r.result.warnings.map((e) => ({ ...e, _file: r.file }))),
    ...perFileCSSResults.flatMap((r) => r.result.warnings.map((e) => ({ ...e, _file: r.file }))),
    ...(configResult?.warnings.map((e) => ({ ...e, _file: 'config.json' })) ?? []),
    ...crossFileResult.warnings,
  ];

  return {
    project,
    perFileResults,
    perFileCSSResults,
    configResult,
    crossFileResult,
    totalErrors: allErrors.length,
    totalWarnings: allWarnings.length,
    passed: allErrors.length === 0,
  };
}

export interface ProjectValidationResult {
  project: ProjectContext;
  perFileResults: { file: string; result: ValidationResult }[];
  perFileCSSResults: { file: string; result: CSSValidationResult }[];
  configResult: ConfigValidationResult | null;
  crossFileResult: CrossFileResult;
  totalErrors: number;
  totalWarnings: number;
  passed: boolean;
}
