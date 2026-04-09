import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('unknown-data-attribute', () => {
  it('should flag typos in Reveal.js attributes', () => {
    const result = validate(fixture('invalid/unknown-attrs.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'unknown-data-attribute');
    expect(warns).toHaveLength(2);
    expect(warns[0].message).toContain('data-transition');
    expect(warns[1].message).toContain('data-visibility');
  });
});

describe('data-line-numbers-format', () => {
  it('should flag invalid line numbers format', () => {
    const result = validate(fixture('invalid/extras.html'));
    const errors = result.errors.filter((e) => e.ruleId === 'data-line-numbers-format');
    expect(errors).toHaveLength(1);
    expect(errors[0].context).toContain('1-2-3');
  });
});

describe('duplicate-notes', () => {
  it('should warn about both data-notes and aside.notes', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'duplicate-notes');
    expect(warns).toHaveLength(1);
  });
});

describe('valid-background-size', () => {
  it('should warn about invalid background-size', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'valid-background-size');
    expect(warns).toHaveLength(1);
    expect(warns[0].context).toContain('huge');
  });
});

describe('valid-background-position', () => {
  it('should warn about invalid background-position', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'valid-background-position');
    expect(warns).toHaveLength(1);
    expect(warns[0].context).toContain('middle');
  });
});

describe('valid-background-repeat', () => {
  it('should warn about invalid background-repeat', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'valid-background-repeat');
    expect(warns).toHaveLength(1);
    expect(warns[0].context).toContain('tile');
  });
});

describe('data-autoslide-on-fragment', () => {
  it('should warn about autoslide on non-fragment element', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'data-autoslide-on-fragment');
    expect(warns).toHaveLength(1);
  });
});

describe('uncounted-not-at-end', () => {
  it('should warn when uncounted slides are in the middle', () => {
    const result = validate(fixture('invalid/uncounted-middle.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'uncounted-not-at-end');
    expect(warns).toHaveLength(1);
  });
});

describe('data-ignore-on-media', () => {
  it('should warn about data-ignore on non-media elements', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'data-ignore-on-media');
    expect(warns).toHaveLength(1);
  });
});

describe('r-stack-without-fragments', () => {
  it('should warn about r-stack without fragment children', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'r-stack-without-fragments');
    expect(warns).toHaveLength(1);
    expect(warns[0].context).toContain('3 children');
  });
});

describe('valid-preview-fit', () => {
  it('should warn about invalid data-preview-fit', () => {
    const result = validate(fixture('invalid/extras.html'));
    const warns = result.warnings.filter((e) => e.ruleId === 'valid-preview-fit');
    expect(warns).toHaveLength(1);
    expect(warns[0].context).toContain('fill');
  });
});

describe('broken-slide-link', () => {
  it('should warn about invalid slide link format', () => {
    const html = `<div class="reveal"><div class="slides">
      <section data-background-color="#000">
        <a href="#/0/0/0">Triple nested</a>
      </section>
    </div></div>`;
    const result = validate(html);
    const warns = result.warnings.filter((e) => e.ruleId === 'broken-slide-link');
    expect(warns).toHaveLength(1);
  });
});
