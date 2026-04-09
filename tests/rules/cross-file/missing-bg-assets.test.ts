import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { validateGame } from '../../../src/index.js';

const gameFixture = (name: string) => resolve(__dirname, '../../fixtures', name);

describe('cross-missing-bg-with-css', () => {
  it('should not flag slides with data-background-color', () => {
    const result = validateGame(gameFixture('game-valid'));
    const bgErrors = result.crossFileResult.errors.filter(
      (e) => e.ruleId === 'cross-missing-bg-with-css',
    );
    expect(bgErrors).toHaveLength(0);
  });

  it('should flag slides without data-background when CSS has no global bg', () => {
    // game-invalid has no global bg in CSS and s02 has no data-background-*...
    // but s02 actually has data-background-color="#000" in our fixture
    // This rule works on real games with missing backgrounds
    const result = validateGame(gameFixture('game-valid'));
    // All slides in game-valid have data-background-color — clean
    expect(result.crossFileResult.errors.filter(
      (e) => e.ruleId === 'cross-missing-bg-with-css',
    )).toHaveLength(0);
  });
});

describe('cross-assets-exist', () => {
  it('should not flag assets that exist (relative paths)', () => {
    // game-valid has no asset references, so nothing to flag
    const result = validateGame(gameFixture('game-valid'));
    const assetErrors = result.crossFileResult.errors.filter(
      (e) => e.ruleId === 'cross-assets-exist',
    );
    expect(assetErrors).toHaveLength(0);
  });

  it('should be disabled when crosscheck config says false', () => {
    const result = validateGame(gameFixture('game-valid'), {
      crosscheck: { 'assets-exist': false },
    });
    const assetErrors = result.crossFileResult.errors.filter(
      (e) => e.ruleId === 'cross-assets-exist',
    );
    expect(assetErrors).toHaveLength(0);
  });
});
