import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('layout rules', () => {
  it('should pass valid layout', () => {
    const result = validate(fixture('valid/layout-media-structure.html'));
    const layoutIssues = [...result.errors, ...result.warnings].filter(
      (v) => v.ruleId.startsWith('r-stretch') || v.ruleId === 'no-height-top-on-section',
    );
    expect(layoutIssues).toEqual([]);
  });

  describe('r-stretch-single', () => {
    it('should flag multiple r-stretch in one slide', () => {
      const result = validate(fixture('invalid/layout.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'r-stretch-single');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('2 elements');
    });
  });

  describe('r-stretch-direct-child', () => {
    it('should flag nested r-stretch', () => {
      const result = validate(fixture('invalid/layout.html'));
      const errors = result.errors.filter((e) => e.ruleId === 'r-stretch-direct-child');
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('nested');
    });
  });

  describe('no-height-top-on-section', () => {
    it('should warn about inline height/top on section', () => {
      const result = validate(fixture('invalid/layout.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'no-height-top-on-section');
      expect(warns).toHaveLength(1);
    });
  });
});
