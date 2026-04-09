import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('backgrounds rules', () => {
  describe('valid slides', () => {
    it('should pass with no violations on correct backgrounds', () => {
      const result = validate(fixture('valid/basic-backgrounds.html'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('no-css-background-on-section', () => {
    it('should flag inline CSS background on <section>', () => {
      const result = validate(fixture('invalid/css-background.html'));
      const bgErrors = result.errors.filter(
        (e) => e.ruleId === 'no-css-background-on-section',
      );
      expect(bgErrors).toHaveLength(3);
      expect(bgErrors[0].message).toContain('data-background-color');
    });
  });

  describe('valid-background-attributes', () => {
    it('should flag data-background-* on non-section elements', () => {
      const result = validate(fixture('invalid/background-attrs-wrong-element.html'));
      const attrErrors = result.errors.filter(
        (e) => e.ruleId === 'valid-background-attributes',
      );
      expect(attrErrors).toHaveLength(2);
      expect(attrErrors[0].message).toContain('<div>');
      expect(attrErrors[1].message).toContain('<img>');
    });
  });

  describe('background-opacity-range', () => {
    it('should flag opacity outside 0-1 range', () => {
      const result = validate(fixture('invalid/background-opacity-range.html'));
      const opacityErrors = result.errors.filter(
        (e) => e.ruleId === 'background-opacity-range',
      );
      expect(opacityErrors).toHaveLength(3);
      expect(opacityErrors[0].context).toContain('1.5');
      expect(opacityErrors[1].context).toContain('-0.1');
      expect(opacityErrors[2].context).toContain('half');
    });
  });

  describe('background-video-flags', () => {
    it('should warn about video flags without data-background-video', () => {
      const result = validate(fixture('invalid/background-video-flags.html'));
      const flagWarnings = result.warnings.filter(
        (e) => e.ruleId === 'background-video-flags',
      );
      expect(flagWarnings).toHaveLength(2);
    });
  });

  describe('background-interactive-requires-iframe', () => {
    it('should warn about interactive without iframe', () => {
      const result = validate(fixture('invalid/background-interactive.html'));
      const interactiveWarnings = result.warnings.filter(
        (e) => e.ruleId === 'background-interactive-requires-iframe',
      );
      expect(interactiveWarnings).toHaveLength(1);
    });
  });

  describe('config overrides', () => {
    it('should suppress rule when set to off', () => {
      const result = validate(fixture('invalid/css-background.html'), {
        rules: { 'no-css-background-on-section': 'off' },
      });
      const bgErrors = result.errors.filter(
        (e) => e.ruleId === 'no-css-background-on-section',
      );
      expect(bgErrors).toHaveLength(0);
    });

    it('should downgrade error to warning', () => {
      const result = validate(fixture('invalid/css-background.html'), {
        rules: { 'no-css-background-on-section': 'warn' },
      });
      expect(result.errors.filter((e) => e.ruleId === 'no-css-background-on-section')).toHaveLength(0);
      expect(result.warnings.filter((e) => e.ruleId === 'no-css-background-on-section')).toHaveLength(3);
      expect(result.passed).toBe(true);
    });
  });
});
