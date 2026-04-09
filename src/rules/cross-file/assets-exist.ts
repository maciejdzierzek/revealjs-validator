import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { registerCrossFileRule } from './index.js';
import type { CrossFileViolation, CrossFileRule, CrossFileContext } from './index.js';
import type { SlideElement } from '../../parser.js';

// Attributes that contain asset paths
const ASSET_ATTRIBUTES = [
  'src', 'data-src',
  'data-background-image', 'data-background-video',
  'data-preview-image', 'data-preview-video',
];

function collectAssetPaths(el: SlideElement): { attr: string; path: string }[] {
  const paths: { attr: string; path: string }[] = [];
  function walk(e: SlideElement): void {
    for (const attr of ASSET_ATTRIBUTES) {
      const val = e.attributes[attr];
      if (!val) continue;
      // Skip URLs (http, https, data:, //)
      if (val.startsWith('http://') || val.startsWith('https://') ||
          val.startsWith('data:') || val.startsWith('//')) continue;
      // Skip empty and fragment-only
      if (!val || val.startsWith('#')) continue;
      paths.push({ attr, path: val });
    }
    for (const child of e.children) walk(child);
  }
  walk(el);
  return paths;
}

// ---------------------------------------------------------------------------
// Rule: cross-assets-exist
//
// Checks that asset paths referenced in slides actually exist on disk.
// Resolves paths relative to project directory.
// ---------------------------------------------------------------------------
const crossAssetsExist: CrossFileRule = {
  id: 'cross-assets-exist',
  category: 'cross-file',
  defaultSeverity: 'error',
  description: 'Asset file referenced in slide does not exist.',
  docsReference: 'General — asset path integrity',
  crosscheckKey: 'assets-exist',
  check(ctx: CrossFileContext): CrossFileViolation[] {
    const violations: CrossFileViolation[] = [];
    const projectDir = ctx.project.dir;

    // For RunRiva-style paths like /games/oscar-po-2000/assets/photo.jpg
    // we need to find the server root. Heuristic: walk up from projectDir
    // looking for a directory containing "server/" or "package.json".
    const serverRoot = findServerRoot(projectDir);

    for (let i = 0; i < ctx.slides.length; i++) {
      const { file, slideId, parsed } = ctx.slides[i];
      const slide = parsed.flatSlides[0];
      if (!slide) continue;

      const assetPaths = collectAssetPaths(slide.element);
      for (const { attr, path } of assetPaths) {
        const resolved = resolvePath(path, projectDir, serverRoot);
        if (resolved && !existsSync(resolved)) {
          violations.push({
            ruleId: 'cross-assets-exist',
            message: `Asset "${path}" (${attr}) not found on disk.`,
            file,
            slideId,
            slideIndex: i,
          });
        }
      }
    }

    return violations;
  },
};

/**
 * Resolve an asset path to an absolute file path.
 *
 * - Absolute paths (/games/...) → resolve from server root
 * - Relative paths (assets/...) → resolve from project directory
 */
function resolvePath(
  assetPath: string,
  projectDir: string,
  serverRoot: string | null,
): string | null {
  if (assetPath.startsWith('/')) {
    // Absolute URL path — resolve from server root
    if (serverRoot) {
      return join(serverRoot, assetPath);
    }
    // No server root found — can't resolve, skip
    return null;
  }
  // Relative path — resolve from project directory
  return resolve(projectDir, assetPath);
}

/**
 * Walk up from projectDir looking for a plausible server root
 * (directory containing package.json or server/).
 */
function findServerRoot(projectDir: string): string | null {
  let current = projectDir;
  for (let i = 0; i < 10; i++) {
    if (existsSync(join(current, 'package.json')) ||
        existsSync(join(current, 'server'))) {
      return current;
    }
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return null;
}

registerCrossFileRule(crossAssetsExist);
