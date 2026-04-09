import { readdirSync, statSync } from 'fs';
import { resolve, relative, join } from 'path';

/**
 * Simple glob expansion for CLI.
 * Supports * and ** patterns. No external dependencies.
 */
export async function glob(
  patterns: string[],
  ignore: string[] = [],
): Promise<string[]> {
  const files = new Set<string>();

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      const expanded = expandGlob(pattern);
      for (const f of expanded) files.add(f);
    } else {
      const full = resolve(pattern);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          const expanded = expandGlob(join(pattern, '**/*.html'));
          for (const f of expanded) files.add(f);
        } else {
          files.add(full);
        }
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  // Filter out ignored patterns
  if (ignore.length > 0) {
    const result: string[] = [];
    for (const f of files) {
      const rel = relative(process.cwd(), f);
      const shouldIgnore = ignore.some((pat) => matchSimple(rel, pat));
      if (!shouldIgnore) result.push(f);
    }
    return result.sort();
  }

  return [...files].sort();
}

function expandGlob(pattern: string): string[] {
  // Split pattern into directory prefix and glob part
  const parts = pattern.split('/');
  let baseDir = '.';
  const globParts: string[] = [];
  let hitGlob = false;

  for (const part of parts) {
    if (!hitGlob && !part.includes('*')) {
      baseDir = join(baseDir, part);
    } else {
      hitGlob = true;
      globParts.push(part);
    }
  }

  const globPattern = globParts.join('/');
  const results: string[] = [];
  walkDir(resolve(baseDir), '', globPattern, results);
  return results;
}

function walkDir(base: string, rel: string, pattern: string, results: string[]): void {
  let entries;
  try {
    entries = readdirSync(join(base, rel), { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      walkDir(base, entryRel, pattern, results);
    } else if (entry.isFile()) {
      if (matchSimple(entryRel, pattern)) {
        results.push(join(base, entryRel));
      }
    }
  }
}

function matchSimple(str: string, pattern: string): boolean {
  // Convert glob pattern to regex
  let regex = pattern
    .replace(/\./g, '\\.')
    .replace(/\*\*/g, '{{DOUBLESTAR}}')
    .replace(/\*/g, '[^/]*')
    .replace(/\{\{DOUBLESTAR\}\}/g, '.*');
  return new RegExp(`^${regex}$`).test(str);
}
