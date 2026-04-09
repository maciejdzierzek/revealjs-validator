import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('transitions rules', () => {
  describe('valid slides', () => {
    it('should pass with correct transition usage', () => {
      const result = validate(fixture('valid/transitions.html'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('valid-transition-values', () => {
    it('should flag invalid transition value', () => {
      const result = validate(fixture('invalid/transition-values.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'valid-transition-values');
      // "dissolve" on section + "wipe" on background-transition
      expect(errors).toHaveLength(2);
      expect(errors[0].context).toContain('dissolve');
      expect(errors[1].context).toContain('wipe');
    });
  });

  describe('valid-transition-speed', () => {
    it('should flag invalid speed value', () => {
      const result = validate(fixture('invalid/transition-values.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'valid-transition-speed');
      expect(errors).toHaveLength(1);
      expect(errors[0].context).toContain('turbo');
    });
  });

  describe('transition-on-section', () => {
    it('should flag transition attributes on non-section elements', () => {
      const result = validate(fixture('invalid/transition-values.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'transition-on-section');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('<div>');
    });
  });
});
