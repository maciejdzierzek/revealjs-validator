import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { validate } from '../../src/index.js';

const fixture = (name: string) =>
  readFileSync(resolve(__dirname, '..', 'fixtures', name), 'utf-8');

describe('media rules', () => {
  it('should pass valid media usage', () => {
    const result = validate(fixture('valid/layout-media-structure.html'));
    const mediaIssues = [...result.errors, ...result.warnings].filter(
      (v) => ['no-src-and-data-src', 'data-autoplay-on-media', 'data-preload-needs-data-src'].includes(v.ruleId),
    );
    expect(mediaIssues).toEqual([]);
  });

  describe('no-src-and-data-src', () => {
    it('should warn about both src and data-src', () => {
      const result = validate(fixture('invalid/media.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'no-src-and-data-src');
      expect(warns).toHaveLength(1);
      expect(warns[0].message).toContain('<img>');
    });
  });

  describe('data-autoplay-on-media', () => {
    it('should warn about data-autoplay on non-media element', () => {
      const result = validate(fixture('invalid/media.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'data-autoplay-on-media');
      expect(warns).toHaveLength(1);
      expect(warns[0].message).toContain('<div>');
    });
  });

  describe('data-preload-needs-data-src', () => {
    it('should warn about data-preload on iframe with src', () => {
      const result = validate(fixture('invalid/media.html'));
      const warns = result.warnings.filter((e) => e.ruleId === 'data-preload-needs-data-src');
      expect(warns).toHaveLength(1);
    });
  });
});
