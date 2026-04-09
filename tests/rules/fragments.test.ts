import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('fragments rules', () => {
  describe('valid slides', () => {
    it('should pass with correct fragment usage', () => {
      const result = validate(fixture('valid/fragments.html'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('valid-fragment-classes', () => {
    it('should flag fragment effect class without fragment base class', () => {
      const result = validate(fixture('invalid/fragment-classes.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'valid-fragment-classes');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('fade-out');
    });
  });

  describe('fragment-index-numeric', () => {
    it('should flag non-numeric and negative fragment-index', () => {
      const result = validate(fixture('invalid/fragment-classes.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'fragment-index-numeric');
      expect(errors).toHaveLength(2);
      expect(errors[0].context).toContain('abc');
      expect(errors[1].context).toContain('-1');
    });
  });

  describe('fragment-index-needs-fragment', () => {
    it('should warn about fragment-index without fragment class', () => {
      const result = validate(fixture('invalid/fragment-classes.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'fragment-index-needs-fragment');
      expect(warns).toHaveLength(1);
    });
  });
});
