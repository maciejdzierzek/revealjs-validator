import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, join, dirname } from 'path';
import type { ValidatorConfig } from './config.js';

export interface SlideEntry {
  id?: string;
  file: string;
  /** Absolute path resolved from project dir */
  absolutePath: string;
}

export interface ProjectContext {
  /** Absolute path to project directory */
  dir: string;
  /** Absolute path to config.json (if found) */
  configPath: string | null;
  /** Raw parsed config (if found) */
  config: Record<string, unknown> | null;
  /** Reveal.js config (if found) */
  revealConfig: Record<string, unknown> | null;
  /** Slides in order from config, or alphabetical fallback */
  slides: SlideEntry[];
  /** CSS theme files found */
  cssFiles: string[];
  /** Subset of cssFiles that are platform base CSS (classes-only: provide classes but skip dead-code and per-file CSS rules) */
  cssBaseFiles?: Set<string>;
  /** Assets directory (if exists) */
  assetsDir: string | null;
}

/**
 * Load a project directory for cross-file validation.
 *
 * Auto-detect: looks for config.json with a "slides" array containing
 * objects with a "file" field. Configurable via validatorConfig.project
 * for non-standard formats.
 *
 * Fallback: if no config.json or no slides array, reads all .html files
 * from slides/ subdirectory in alphabetical order.
 */
export function loadProject(
  dir: string,
  validatorConfig?: ValidatorConfig,
): ProjectContext {
  const absDir = resolve(dir);

  if (!existsSync(absDir)) {
    throw new Error(`Game directory not found: ${absDir}`);
  }

  // Config field names (configurable for non-standard formats)
  const slidesKey = validatorConfig?.project?.slidesKey ?? 'slides';
  const fileField = validatorConfig?.project?.fileField ?? 'file';

  // Look for config.json
  const configPath = join(absDir, 'config.json');
  let config: Record<string, unknown> | null = null;
  let revealConfig: Record<string, unknown> | null = null;
  let slides: SlideEntry[] = [];

  if (existsSync(configPath)) {
    config = JSON.parse(readFileSync(configPath, 'utf-8'));

    // Extract reveal config
    if (config && typeof config['reveal'] === 'object' && config['reveal'] !== null) {
      revealConfig = config['reveal'] as Record<string, unknown>;
    }

    // Extract slides from config
    const slidesArray = config?.[slidesKey];
    if (Array.isArray(slidesArray)) {
      for (const entry of slidesArray) {
        if (typeof entry === 'object' && entry !== null && typeof entry[fileField] === 'string') {
          const filePath = entry[fileField] as string;
          const absolutePath = resolve(absDir, filePath);
          if (existsSync(absolutePath)) {
            slides.push({
              id: typeof entry['id'] === 'string' ? entry['id'] : undefined,
              file: filePath,
              absolutePath,
            });
          }
        }
      }
    }
  }

  // Fallback: no config or no slides found — scan slides/ directory
  if (slides.length === 0) {
    const slidesDir = join(absDir, 'slides');
    if (existsSync(slidesDir)) {
      const htmlFiles = readdirSync(slidesDir)
        .filter((f) => f.endsWith('.html'))
        .sort();
      slides = htmlFiles.map((f) => ({
        file: `slides/${f}`,
        absolutePath: join(slidesDir, f),
      }));
    }
  }

  // Find CSS theme files
  const cssFiles: string[] = [];
  const themeDir = join(absDir, 'theme');
  if (existsSync(themeDir)) {
    const cssEntries = readdirSync(themeDir).filter((f) => f.endsWith('.css'));
    for (const f of cssEntries) {
      cssFiles.push(join(themeDir, f));
    }
  }

  // Add base CSS files from crosscheck config (e.g., platform base styles)
  // Base files provide classes for cross-css-classes-used but are excluded from
  // per-file CSS rules and cross-css-classes-defined (they serve multiple games).
  const cssBaseFiles = new Set<string>();
  const baseCSSEntries = validatorConfig?.crosscheck?.['css-base-files'] ?? [];
  for (const baseFile of baseCSSEntries) {
    const resolved = resolve(baseFile);
    if (existsSync(resolved) && !cssFiles.includes(resolved)) {
      cssFiles.push(resolved);
      cssBaseFiles.add(resolved);
    }
  }

  // Assets directory
  const assetsDir = existsSync(join(absDir, 'assets')) ? join(absDir, 'assets') : null;

  return {
    dir: absDir,
    configPath: existsSync(configPath) ? configPath : null,
    config,
    revealConfig,
    slides,
    cssFiles,
    cssBaseFiles,
    assetsDir,
  };
}
