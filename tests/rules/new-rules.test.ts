import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('valid-autoslide-value', () => {
  it('should flag non-numeric autoslide values', () => {
    const result = validate(fixture('invalid/autoslide.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'valid-autoslide-value');
    expect(errors).toHaveLength(3);
    expect(errors[0].context).toContain('fast');
    expect(errors[1].context).toContain('-500');
    expect(errors[2].context).toContain('slow');
  });
});

describe('vertical-slides-nesting', () => {
  it('should flag triple-nested sections', () => {
    const result = validate(fixture('invalid/vertical-nesting.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'vertical-slides-nesting');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('Triple-nested');
  });
});

describe('markdown-requires-script', () => {
  it('should flag data-markdown without script tag', () => {
    const result = validate(fixture('invalid/markdown-no-script.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'markdown-requires-script');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('script');
  });
});

describe('code-line-numbers-structure', () => {
  it('should flag data-line-numbers on non-code elements', () => {
    const result = validate(fixture('invalid/code-line-numbers.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'code-line-numbers-structure');
    expect(errors).toHaveLength(2);
    expect(errors[0].context).toContain('<pre');
    expect(errors[1].context).toContain('<div');
  });
});

describe('missing-slide-background', () => {
  it('should warn about slides without data-background-*', () => {
    const result = validate(fixture('invalid/missing-background.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'missing-slide-background');
    expect(warns).toHaveLength(1);
    expect(warns[0].slideIndex).toBe(0);
  });

  it('should not warn when slide has data-background-color', () => {
    const result = validate(fixture('invalid/missing-background.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'missing-slide-background');
    // Only 1 warning for the first slide, second slide has bg
    expect(warns).toHaveLength(1);
  });
});
