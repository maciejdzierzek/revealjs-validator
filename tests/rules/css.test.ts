import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validateCSS } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('CSS rules', () => {
  describe('valid CSS', () => {
    it('should pass with no violations on correct theme', () => {
      const result = validateCSS(fixture('valid/theme.css'));
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.passed).toBe(true);
    });
  });

  describe('css-no-background-on-reveal', () => {
    it('should flag background on .reveal', () => {
      const result = validateCSS(fixture('invalid/theme-background.css'));
      const errors = result.errors.filter(
        (e) => e.ruleId === 'css-no-background-on-reveal',
      );
      expect(errors).toHaveLength(2);
      expect(errors[0].selector).toBe('.reveal');
      expect(errors[0].property).toBe('background-color');
      expect(errors[1].selector).toBe('.reveal-viewport');
      expect(errors[1].property).toBe('background');
    });
  });

  describe('css-no-background-on-section', () => {
    it('should flag background on section selectors', () => {
      const result = validateCSS(fixture('invalid/theme-background.css'));
      const errors = result.errors.filter(
        (e) => e.ruleId === 'css-no-background-on-section',
      );
      expect(errors).toHaveLength(1);
      expect(errors[0].selector).toContain('section');
      expect(errors[0].property).toBe('background-color');
    });
  });

  describe('css-no-transition-on-animated', () => {
    it('should warn about transition on slide elements', () => {
      const result = validateCSS(fixture('invalid/theme-transition.css'));
      const warns = result.warnings.filter(
        (e) => e.ruleId === 'css-no-transition-on-animated',
      );
      expect(warns).toHaveLength(2);
      expect(warns[0].selector).toContain('.mood-bar');
      expect(warns[1].selector).toContain('.ink-tag');
    });
  });

  describe('css-no-dead-keyframes', () => {
    it('should warn about unused @keyframes', () => {
      const result = validateCSS(fixture('invalid/theme-transition.css'));
      const warns = result.warnings.filter(
        (e) => e.ruleId === 'css-no-dead-keyframes',
      );
      expect(warns).toHaveLength(1);
      expect(warns[0].value).toBe('fadeInSlow');
    });

    it('should not flag used @keyframes', () => {
      const result = validateCSS(fixture('valid/theme.css'));
      const warns = result.warnings.filter(
        (e) => e.ruleId === 'css-no-dead-keyframes',
      );
      expect(warns).toEqual([]);
    });
  });

  describe('config overrides', () => {
    it('should suppress CSS rule when set to off', () => {
      const result = validateCSS(fixture('invalid/theme-background.css'), {
        rules: { 'css-no-background-on-reveal': 'off' },
      });
      const errors = result.errors.filter(
        (e) => e.ruleId === 'css-no-background-on-reveal',
      );
      expect(errors).toHaveLength(0);
    });
  });
});
