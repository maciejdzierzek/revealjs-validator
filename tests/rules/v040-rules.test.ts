import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('notes-inside-section', () => {
  it('should pass when notes are direct child of section', () => {
    const result = validate(fixture('valid/notes-timing.html'));
    const issues = [...result.errors, ...result.warnings].filter(
      (e) => e.ruleId === 'notes-inside-section',
    );
    expect(issues).toEqual([]);
  });

  it('should flag notes nested inside other elements', () => {
    const result = validate(fixture('invalid/notes-timing.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'notes-inside-section');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('direct child');
  });
});

describe('valid-timing-value', () => {
  it('should pass with valid numeric timing', () => {
    const result = validate(fixture('valid/notes-timing.html'));
    const issues = [...result.errors, ...result.warnings].filter(
      (e) => e.ruleId === 'valid-timing-value',
    );
    expect(issues).toEqual([]);
  });

  it('should flag non-numeric and negative timing', () => {
    const result = validate(fixture('invalid/notes-timing.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'valid-timing-value');
    expect(errors).toHaveLength(2);
    expect(errors[0].context).toContain('slow');
    expect(errors[1].context).toContain('-10');
  });
});

describe('duplicate-data-id', () => {
  it('should flag duplicate data-id in one slide', () => {
    const result = validate(fixture('invalid/duplicate-data-id.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'duplicate-data-id');
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('2 times');
    expect(errors[0].context).toContain('box');
  });
});
