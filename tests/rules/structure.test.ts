import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('structure rules', () => {
  it('should pass valid structure', () => {
    const result = validate(fixture('valid/layout-media-structure.html'));
    const structIssues = [...result.errors, ...result.warnings].filter(
      (v) => ['no-inline-transition-css', 'no-display-none-on-section', 'valid-data-visibility'].includes(v.ruleId),
    );
    expect(structIssues).toEqual([]);
  });

  describe('no-inline-transition-css', () => {
    it('should warn about CSS transition in inline style', () => {
      const result = validate(fixture('invalid/structure.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'no-inline-transition-css');
      expect(warns).toHaveLength(1);
    });
  });

  describe('no-display-none-on-section', () => {
    it('should warn about display:none and visibility:hidden on section', () => {
      const result = validate(fixture('invalid/structure.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'no-display-none-on-section');
      expect(warns).toHaveLength(2);
    });
  });

  describe('valid-data-visibility', () => {
    it('should flag invalid data-visibility value', () => {
      const result = validate(fixture('invalid/structure.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'valid-data-visibility');
      expect(errors).toHaveLength(1);
      expect(errors[0].context).toContain('invisible');
    });
  });
});
