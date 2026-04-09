import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { RuleConfig } from './rules/index.js';

export interface ValidatorConfig {
  rules?: RuleConfig;
  ignore?: string[];
}

const CONFIG_FILENAMES = [
  '.revealjs-validator.json',
  'revealjs-validator.config.json',
];

/**
 * Load config from a specific path or search current directory.
 * Returns empty config if no file found (all rules use defaults).
 */
export function loadConfig(configPath?: string): ValidatorConfig {
  if (configPath) {
    const fullPath = resolve(configPath);
    if (!existsSync(fullPath)) {
      throw new Error(`Config file not found: ${fullPath}`);
    }
    return JSON.parse(readFileSync(fullPath, 'utf-8'));
  }

  for (const name of CONFIG_FILENAMES) {
    const fullPath = resolve(name);
    if (existsSync(fullPath)) {
      return JSON.parse(readFileSync(fullPath, 'utf-8'));
    }
  }

  return {};
}
