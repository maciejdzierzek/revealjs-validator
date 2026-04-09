import { execSync } from 'child_process';
import { resolve } from 'path';

/**
 * Get list of staged HTML and CSS files from git.
 * Returns absolute paths. Returns empty array if not in a git repo
 * or no matching files are staged.
 */
export function getStagedFiles(): string[] {
  try {
    const output = execSync(
      'git diff --cached --name-only --diff-filter=ACM',
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
    );

    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.endsWith('.html') || line.endsWith('.css'))
      .map((line) => resolve(line));
  } catch {
    // Not in a git repo, or git not available
    return [];
  }
}
