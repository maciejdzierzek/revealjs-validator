import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { validateGame } from '../../../src/index.js';

const gameFixture = (name: string) => resolve(__dirname, '../../fixtures', name);

describe('cross-css-classes-used', () => {
  it('should not flag classes defined in theme CSS', () => {
    const result = validateGame(gameFixture('game-valid'));
    const used = result.crossFileResult.warnings.filter(
      (w) => w.ruleId === 'cross-css-classes-used',
    );
    // game-valid slides use classes not in its minimal theme — that's expected
    // But Reveal.js API classes should be filtered out
    for (const w of used) {
      expect(w.message).not.toContain('fragment');
      expect(w.message).not.toContain('r-stretch');
      expect(w.message).not.toContain('reveal');
    }
  });
});

describe('cross-css-classes-defined', () => {
  it('should not flag Reveal.js dynamic classes', () => {
    const result = validateGame(gameFixture('game-valid'));
    const defined = result.crossFileResult.warnings.filter(
      (w) => w.ruleId === 'cross-css-classes-defined',
    );
    for (const w of defined) {
      expect(w.message).not.toContain('present');
      expect(w.message).not.toContain('past');
      expect(w.message).not.toContain('future');
    }
  });
});

describe('crosscheck toggle', () => {
  it('should disable css-classes-used when crosscheck config says false', () => {
    const result = validateGame(gameFixture('game-valid'), {
      crosscheck: { 'css-classes-used': false },
    });
    const used = result.crossFileResult.warnings.filter(
      (w) => w.ruleId === 'cross-css-classes-used',
    );
    expect(used).toHaveLength(0);
  });
});
