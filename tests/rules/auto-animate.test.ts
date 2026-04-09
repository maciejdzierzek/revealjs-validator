import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('auto-animate rules', () => {
  describe('valid slides', () => {
    it('should pass with correct auto-animate usage', () => {
      const result = validate(fixture('valid/auto-animate.html'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('auto-animate-pairs', () => {
    it('should flag lone auto-animate slide without pair', () => {
      const result = validate(fixture('invalid/auto-animate-no-pair.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'auto-animate-pairs');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('no adjacent slide');
    });
  });

  describe('auto-animate-on-section', () => {
    it('should flag data-auto-animate on non-section elements', () => {
      const result = validate(fixture('invalid/auto-animate-on-element.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'auto-animate-on-section');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('<div>');
    });
  });

  describe('data-id-needs-auto-animate', () => {
    it('should warn about data-id in non-auto-animate slides', () => {
      const result = validate(fixture('invalid/auto-animate-misc.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'data-id-needs-auto-animate');
      expect(warns).toHaveLength(1);
      expect(warns[0].context).toContain('orphan');
    });
  });

  describe('data-id-inline-styles', () => {
    it('should warn about data-id elements without inline style', () => {
      const result = validate(fixture('invalid/auto-animate-misc.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'data-id-inline-styles');
      expect(warns.length).toBeGreaterThanOrEqual(1);
      expect(warns[0].message).toContain('no inline style');
    });
  });

  describe('auto-animate-delay-not-on-section', () => {
    it('should flag data-auto-animate-delay on section', () => {
      const result = validate(fixture('invalid/auto-animate-misc.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'auto-animate-delay-not-on-section');
      expect(errors).toHaveLength(1);
    });
  });

  describe('auto-animate-restart-needs-auto-animate', () => {
    it('should warn about restart without auto-animate', () => {
      const result = validate(fixture('invalid/auto-animate-misc.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'auto-animate-restart-needs-auto-animate');
      expect(warns).toHaveLength(1);
    });
  });

  describe('auto-animate-id-needs-auto-animate', () => {
    it('should warn about auto-animate-id without auto-animate', () => {
      const result = validate(fixture('invalid/auto-animate-misc.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'auto-animate-id-needs-auto-animate');
      expect(warns).toHaveLength(1);
    });
  });
});
