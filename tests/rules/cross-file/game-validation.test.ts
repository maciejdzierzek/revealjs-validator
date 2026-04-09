import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { validateGame } from '../../../src/index.js';

const gameFixture = (name: string) => resolve(__dirname, '../../fixtures', name);

describe('--game validation', () => {
  describe('valid game', () => {
    it('should pass with correct auto-animate pairs', () => {
      const result = validateGame(gameFixture('game-valid'));
      expect(result.totalErrors).toBe(0);
      expect(result.passed).toBe(true);
      expect(result.game.slides).toHaveLength(4);
      expect(result.game.cssFiles).toHaveLength(1);
    });
  });

  describe('invalid game — broken auto-animate pairs', () => {
    it('should flag slides with auto-animate but no pair', () => {
      const result = validateGame(gameFixture('game-invalid'));
      const crossErrors = result.crossFileResult.errors.filter(
        (e) => e.ruleId === 'cross-auto-animate-pairs',
      );
      expect(crossErrors.length).toBeGreaterThanOrEqual(1);
      expect(crossErrors[0].message).toContain('neither the previous nor next');
    });

    it('should auto-disable per-file auto-animate-pairs', () => {
      const result = validateGame(gameFixture('game-invalid'));
      // Per-file auto-animate-pairs should NOT fire (disabled by --game)
      const perFileAutoAnimate = result.perFileResults.flatMap((r) =>
        [...r.result.errors, ...r.result.warnings].filter(
          (e) => e.ruleId === 'auto-animate-pairs',
        ),
      );
      expect(perFileAutoAnimate).toHaveLength(0);
    });
  });

  describe('game loader', () => {
    it('should read config.json and resolve slide paths', () => {
      const result = validateGame(gameFixture('game-valid'));
      expect(result.game.configPath).toContain('config.json');
      expect(result.game.revealConfig).toBeTruthy();
      expect(result.game.revealConfig?.['transition']).toBe('fade');
    });

    it('should validate reveal config from game', () => {
      const result = validateGame(gameFixture('game-valid'));
      // Config is valid — no config errors
      expect(result.configResult?.errors).toEqual([]);
    });
  });
});
