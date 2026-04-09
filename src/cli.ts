#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import { resolve, relative } from 'path';
import { glob } from './glob.js';
import { validate, validateCSS, validateConfigFile, validateGame } from './index.js';
import { loadConfig } from './config.js';
import { format } from './reporter.js';
import { getRegisteredRules } from './rules/index.js';
import { getRegisteredCSSRules } from './rules/css-index.js';
import { getRegisteredConfigRules } from './rules/config-index.js';
import { getStagedFiles } from './staged.js';
import { fixFile } from './fixer.js';
import type { OutputFormat } from './reporter.js';
import type { ValidationResult } from './rules/index.js';
import type { CSSValidationResult } from './rules/css-index.js';
import type { ConfigValidationResult } from './rules/config-index.js';

function printHelp(): void {
  console.log(`
revealjs-validator - Static HTML validator for Reveal.js presentations

Usage:
  revealjs-validator [options] <files...>

Options:
  --config <path>   Path to config file (default: .revealjs-validator.json)
  --format <type>   Output format: text, json (default: text)
  --staged          Validate only git-staged .html and .css files (for pre-commit hooks)
  --fix             Auto-fix violations where possible (modifies files in-place)
  --dry-run         With --fix: show what would be fixed without modifying files
  --game <dir>      Validate entire game directory with cross-file checks
  --reveal-key <p>  JSON path to Reveal.js config (default: auto-detect "reveal" key)
  --list-rules      List all available rules and exit
  --help, -h        Show this help message
  --version, -v     Show version

Supports both HTML slide files and CSS theme files.

Examples:
  revealjs-validator "slides/*.html"
  revealjs-validator "slides/*.html" "theme/*.css"
  revealjs-validator --game games/my-presentation/     # cross-file validation
  revealjs-validator --staged                          # pre-commit hook
  revealjs-validator --format json "slides/**/*.html"
  revealjs-validator --config my-config.json slides/
`.trim());
}

function printVersion(): void {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
  console.log(pkg.version);
}

function listRules(): void {
  const htmlRules = getRegisteredRules();
  const cssRules = getRegisteredCSSRules();
  const configRules = getRegisteredConfigRules();
  const total = htmlRules.length + cssRules.length + configRules.length;
  console.log(`Available rules (${total}):\n`);

  console.log('  HTML rules:\n');
  for (const rule of htmlRules) {
    const sev = rule.defaultSeverity.padEnd(5);
    console.log(`  ${sev}  ${rule.id}`);
    console.log(`         ${rule.description}`);
    console.log(`         Ref: ${rule.docsReference}`);
    console.log('');
  }

  console.log('  CSS rules:\n');
  for (const rule of cssRules) {
    const sev = rule.defaultSeverity.padEnd(5);
    console.log(`  ${sev}  ${rule.id}`);
    console.log(`         ${rule.description}`);
    console.log(`         Ref: ${rule.docsReference}`);
    console.log('');
  }

  console.log('  Config rules (JSON):\n');
  for (const rule of configRules) {
    const sev = rule.defaultSeverity.padEnd(5);
    console.log(`  ${sev}  ${rule.id}`);
    console.log(`         ${rule.description}`);
    console.log(`         Ref: ${rule.docsReference}`);
    console.log('');
  }
}

function parseArgs(argv: string[]): {
  files: string[];
  configPath?: string;
  outputFormat: OutputFormat;
  help: boolean;
  version: boolean;
  listRulesFlag: boolean;
  staged: boolean;
  fix: boolean;
  dryRun: boolean;
  revealKey?: string;
  gameDir?: string;
} {
  const files: string[] = [];
  let configPath: string | undefined;
  let outputFormat: OutputFormat = 'text';
  let help = false;
  let version = false;
  let listRulesFlag = false;
  let staged = false;
  let fix = false;
  let dryRun = false;
  let revealKey: string | undefined;
  let gameDir: string | undefined;

  let i = 0;
  while (i < argv.length) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') {
      help = true;
    } else if (arg === '--version' || arg === '-v') {
      version = true;
    } else if (arg === '--list-rules') {
      listRulesFlag = true;
    } else if (arg === '--staged') {
      staged = true;
    } else if (arg === '--fix') {
      fix = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    } else if (arg === '--game' && i + 1 < argv.length) {
      gameDir = argv[++i];
    } else if (arg === '--reveal-key' && i + 1 < argv.length) {
      revealKey = argv[++i];
    } else if (arg === '--config' && i + 1 < argv.length) {
      configPath = argv[++i];
    } else if (arg === '--format' && i + 1 < argv.length) {
      const fmt = argv[++i];
      if (fmt === 'text' || fmt === 'json') {
        outputFormat = fmt;
      } else {
        console.error(`Unknown format: ${fmt}. Use "text" or "json".`);
        process.exit(1);
      }
    } else if (!arg.startsWith('-')) {
      files.push(arg);
    } else {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
    i++;
  }

  return { files, configPath, outputFormat, help, version, listRulesFlag, staged, fix, dryRun, revealKey, gameDir };
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }
  if (args.version) {
    printVersion();
    process.exit(0);
  }
  if (args.listRulesFlag) {
    listRules();
    process.exit(0);
  }

  const config = loadConfig(args.configPath);

  // --game mode: validate entire game directory with cross-file checks
  if (args.gameDir) {
    const result = validateGame(args.gameDir, config);
    const lines: string[] = [];

    // Per-file violations
    for (const { file, result: r } of result.perFileResults) {
      for (const err of r.errors) {
        const ctx = err.context ? ` (${err.context})` : '';
        lines.push(`  \u2717 ${file}:slide ${err.slideIndex + 1} [${err.ruleId}] ${err.message}${ctx}`);
      }
      for (const warn of r.warnings) {
        const ctx = warn.context ? ` (${warn.context})` : '';
        lines.push(`  \u26A0 ${file}:slide ${warn.slideIndex + 1} [${warn.ruleId}] ${warn.message}${ctx}`);
      }
    }
    for (const { file, result: r } of result.perFileCSSResults) {
      for (const err of r.errors) lines.push(`  \u2717 ${file}:line ${err.line} [${err.ruleId}] ${err.message}`);
      for (const warn of r.warnings) lines.push(`  \u26A0 ${file}:line ${warn.line} [${warn.ruleId}] ${warn.message}`);
    }
    if (result.configResult) {
      for (const err of result.configResult.errors) lines.push(`  \u2717 config.json [${err.ruleId}] ${err.message}`);
      for (const warn of result.configResult.warnings) lines.push(`  \u26A0 config.json [${warn.ruleId}] ${warn.message}`);
    }

    // Cross-file violations
    for (const err of result.crossFileResult.errors) {
      lines.push(`  \u2717 ${err.file} [${err.ruleId}] ${err.message}`);
    }
    for (const warn of result.crossFileResult.warnings) {
      lines.push(`  \u26A0 ${warn.file} [${warn.ruleId}] ${warn.message}`);
    }

    if (lines.length > 0) console.log(lines.join('\n'));
    console.log('');
    const totalFiles = result.game.slides.length + result.game.cssFiles.length + (result.game.configPath ? 1 : 0);
    const parts = [`${totalFiles} files`];
    if (result.totalErrors > 0) parts.push(`${result.totalErrors} error${result.totalErrors !== 1 ? 's' : ''}`);
    if (result.totalWarnings > 0) parts.push(`${result.totalWarnings} warning${result.totalWarnings !== 1 ? 's' : ''}`);
    if (result.totalErrors === 0 && result.totalWarnings === 0) parts.push('all clean');
    console.log(parts.join(', '));
    process.exit(result.passed ? 0 : 1);
  }

  if (!args.staged && args.files.length === 0) {
    console.error('Error: No files specified. Run with --help for usage.');
    process.exit(1);
  }

  // Resolve files: --staged from git, otherwise from globs
  let resolvedFiles: string[];
  if (args.staged) {
    resolvedFiles = getStagedFiles();
    if (resolvedFiles.length === 0) {
      // No staged HTML/CSS files — nothing to validate, not an error
      console.log('No staged .html or .css files to validate.');
      process.exit(0);
    }
  } else {
    resolvedFiles = await glob(args.files, config.ignore);
    if (resolvedFiles.length === 0) {
      console.error('Error: No matching files found.');
      process.exit(1);
    }
  }

  // --fix mode: fix files then report remaining violations
  if (args.fix) {
    let totalFixed = 0;
    let totalRemaining = 0;

    for (const file of resolvedFiles) {
      const relPath = relative(process.cwd(), file);
      const result = fixFile(file, config.rules, args.dryRun);

      if (result.fixed > 0) {
        const action = args.dryRun ? 'would fix' : 'fixed';
        console.log(`  \u2714 ${relPath}: ${action} ${result.fixed} violation${result.fixed !== 1 ? 's' : ''}`);
        totalFixed += result.fixed;
      }
      if (result.remaining.length > 0) {
        console.log(`  \u2717 ${relPath}: ${result.remaining.length} unfixable violation${result.remaining.length !== 1 ? 's' : ''}`);
        totalRemaining += result.remaining.length;
      }
    }

    console.log('');
    const parts: string[] = [`${resolvedFiles.length} file${resolvedFiles.length !== 1 ? 's' : ''}`];
    if (totalFixed > 0) parts.push(`${totalFixed} ${args.dryRun ? 'would be ' : ''}fixed`);
    if (totalRemaining > 0) parts.push(`${totalRemaining} remaining`);
    if (totalFixed === 0 && totalRemaining === 0) parts.push('all clean');
    console.log(parts.join(', '));

    process.exit(totalRemaining > 0 ? 1 : 0);
  }

  // Normal validation mode
  const results: { file: string; result: ValidationResult | CSSValidationResult | ConfigValidationResult }[] = [];
  let hasErrors = false;

  for (const file of resolvedFiles) {
    const content = readFileSync(file, 'utf-8');
    const relPath = relative(process.cwd(), file);

    if (file.endsWith('.json')) {
      const result = validateConfigFile(file, { rules: config.rules }, args.revealKey);
      results.push({ file: relPath, result });
      if (!result.passed) hasErrors = true;
    } else if (file.endsWith('.css')) {
      const result = validateCSS(content, { rules: config.rules });
      results.push({ file: relPath, result });
      if (!result.passed) hasErrors = true;
    } else {
      const result = validate(content, { rules: config.rules });
      results.push({ file: relPath, result });
      if (!result.passed) hasErrors = true;
    }
  }

  console.log(format(results, args.outputFormat));
  process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
