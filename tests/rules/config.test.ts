import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { validateConfigFile, validateConfig } from '../../src/index.js';

const fixture = (name: string) => resolve(__dirname, '..', 'fixtures', name);

describe('config validation', () => {
  describe('valid config', () => {
    it('should pass with correct config (reveal key auto-detect)', () => {
      const result = validateConfigFile(fixture('valid/config.json'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });

    it('should pass with flat config (no reveal key)', () => {
      const result = validateConfigFile(fixture('valid/config-flat.json'));
      expect(result.errors).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('invalid config', () => {
    it('should flag invalid transition', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-valid-transition');
      expect(err).toHaveLength(1);
      expect(err[0].message).toContain('dissolve');
    });

    it('should flag invalid transitionSpeed', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-valid-transition-speed');
      expect(err).toHaveLength(1);
      expect(err[0].message).toContain('turbo');
    });

    it('should flag invalid backgroundTransition', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-valid-background-transition');
      expect(err).toHaveLength(1);
    });

    it('should flag non-numeric width and negative height', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-width-height-numeric');
      expect(err).toHaveLength(2);
    });

    it('should flag margin out of range', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-margin-range');
      expect(err).toHaveLength(1);
    });

    it('should flag bad minScale/maxScale', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-min-max-scale');
      expect(err.length).toBeGreaterThanOrEqual(2);
    });

    it('should flag non-numeric autoSlide', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-auto-slide-numeric');
      expect(err).toHaveLength(1);
    });

    it('should flag invalid navigationMode', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-navigation-mode');
      expect(err).toHaveLength(1);
    });

    it('should flag invalid view mode', () => {
      const result = validateConfigFile(fixture('invalid/config-bad.json'));
      const err = result.errors.filter((e) => e.ruleId === 'config-view-mode');
      expect(err).toHaveLength(1);
    });
  });

  describe('programmatic API', () => {
    it('should validate config object directly', () => {
      const result = validateConfig({ transition: 'invalid' });
      expect(result.passed).toBe(false);
      expect(result.errors[0].ruleId).toBe('config-valid-transition');
    });
  });

  describe('reveal-key override', () => {
    it('should use custom key path', () => {
      const result = validateConfigFile(fixture('valid/config.json'), undefined, 'reveal');
      expect(result.passed).toBe(true);
    });
  });
});
