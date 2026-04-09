import { describe, it, expect } from 'vitest';
import { fixHTMLSource, fixCSSSource } from '../../src/fixer.js';
import { validate, validateCSS } from '../../src/index.js';

describe('HTML fixer', () => {
  it('should fix inline CSS background on section', () => {
    const input = '<div class="reveal"><div class="slides"><section style="background: #ff0000;"><h2>Bad</h2></section></div></div>';
    const result = fixHTMLSource(input);
    expect(result.fixed).toBeGreaterThanOrEqual(1);
    expect(result.source).toContain('data-background-color="#ff0000"');
    expect(result.source).not.toContain('style="background:');
    // Revalidate
    const check = validate(result.source);
    const bgErrors = check.errors.filter((e) => e.ruleId === 'no-css-background-on-section');
    expect(bgErrors).toHaveLength(0);
  });

  it('should fix missing-slide-background by adding data-background-color="#000"', () => {
    const input = '<div class="reveal"><div class="slides"><section><h2>No bg</h2></section></div></div>';
    const result = fixHTMLSource(input);
    expect(result.fixed).toBeGreaterThanOrEqual(1);
    expect(result.source).toContain('data-background-color="#000"');
  });

  it('should be idempotent — fixing already clean file changes nothing', () => {
    const input = '<div class="reveal"><div class="slides"><section data-background-color="#000"><h2>OK</h2></section></div></div>';
    const result = fixHTMLSource(input);
    expect(result.fixed).toBe(0);
    expect(result.source).toBe(input);
  });
});

describe('CSS fixer', () => {
  it('should remove background-color from .reveal', () => {
    const input = `.reveal {\n  background-color: #080810;\n  font-size: 44px;\n}`;
    const result = fixCSSSource(input);
    expect(result.fixed).toBeGreaterThanOrEqual(1);
    expect(result.source).not.toContain('background-color');
    expect(result.source).toContain('font-size: 44px');
    // Revalidate
    const check = validateCSS(result.source);
    const bgErrors = check.errors.filter((e) => e.ruleId === 'css-no-background-on-reveal');
    expect(bgErrors).toHaveLength(0);
  });

  it('should be idempotent — fixing clean CSS changes nothing', () => {
    const input = `.reveal {\n  font-size: 44px;\n}`;
    const result = fixCSSSource(input);
    expect(result.fixed).toBe(0);
    expect(result.source).toBe(input);
  });
});
