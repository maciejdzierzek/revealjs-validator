/**
 * Parse a JSON string and extract the Reveal.js config object.
 *
 * Auto-detect: looks for "reveal" key in root JSON.
 * If found → use as Reveal.js config.
 * If not → treat entire JSON as Reveal.js config.
 *
 * Override with revealKey for non-standard structures
 * (e.g., "presentation.settings.reveal").
 */
export function parseRevealConfig(
  json: string,
  revealKey?: string,
): Record<string, unknown> {
  const parsed = JSON.parse(json);

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Config must be a JSON object.');
  }

  // Explicit key path
  if (revealKey) {
    const keys = revealKey.split('.');
    let current: unknown = parsed;
    for (const key of keys) {
      if (typeof current !== 'object' || current === null) {
        throw new Error(`Config path "${revealKey}" not found — "${key}" is not an object.`);
      }
      current = (current as Record<string, unknown>)[key];
    }
    if (typeof current !== 'object' || current === null) {
      throw new Error(`Config path "${revealKey}" is not an object.`);
    }
    return current as Record<string, unknown>;
  }

  // Auto-detect: look for "reveal" key
  if ('reveal' in parsed && typeof parsed.reveal === 'object' && parsed.reveal !== null) {
    return parsed.reveal as Record<string, unknown>;
  }

  // Fallback: treat entire JSON as Reveal.js config
  return parsed as Record<string, unknown>;
}
