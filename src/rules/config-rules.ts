import { registerConfigRule } from './config-index.js';
import type { ConfigViolation, ConfigRule } from './config-index.js';

// Source: docs/source/config.md + docs/source/transitions.md
const VALID_TRANSITIONS = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];
const VALID_SPEEDS = ['default', 'fast', 'slow'];
const VALID_NAV_MODES = ['default', 'linear', 'grid'];

function makeViolation(
  ruleId: string,
  property: string,
  value: unknown,
  message: string,
): ConfigViolation {
  return { ruleId, message, property, value };
}

// ---------------------------------------------------------------------------
// Rule: config-valid-transition
// Source: docs/source/config.md — "transition"
// ---------------------------------------------------------------------------
const configValidTransition: ConfigRule = {
  id: 'config-valid-transition',
  category: 'config',
  defaultSeverity: 'error',
  description: 'transition must be: none, fade, slide, convex, concave, or zoom.',
  docsReference: 'config.md — transition option',
  fixHint: 'Use: none, fade, slide, convex, concave, or zoom',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['transition'];
    if (val === undefined) return [];
    if (typeof val !== 'string' || !VALID_TRANSITIONS.includes(val)) {
      return [makeViolation('config-valid-transition', 'transition', val,
        `Invalid transition "${val}". Valid: ${VALID_TRANSITIONS.join(', ')}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-valid-transition-speed
// Source: docs/source/config.md — "transitionSpeed"
// ---------------------------------------------------------------------------
const configValidTransitionSpeed: ConfigRule = {
  id: 'config-valid-transition-speed',
  category: 'config',
  defaultSeverity: 'error',
  description: 'transitionSpeed must be: default, fast, or slow.',
  docsReference: 'config.md — transitionSpeed option',
  fixHint: 'Use: default, fast, or slow',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['transitionSpeed'];
    if (val === undefined) return [];
    if (typeof val !== 'string' || !VALID_SPEEDS.includes(val)) {
      return [makeViolation('config-valid-transition-speed', 'transitionSpeed', val,
        `Invalid transitionSpeed "${val}". Valid: ${VALID_SPEEDS.join(', ')}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-valid-background-transition
// Source: docs/source/config.md — "backgroundTransition"
// ---------------------------------------------------------------------------
const configValidBackgroundTransition: ConfigRule = {
  id: 'config-valid-background-transition',
  category: 'config',
  defaultSeverity: 'error',
  description: 'backgroundTransition must be: none, fade, slide, convex, concave, or zoom.',
  docsReference: 'config.md — backgroundTransition option',
  fixHint: 'Use: none, fade, slide, convex, concave, or zoom',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['backgroundTransition'];
    if (val === undefined) return [];
    if (typeof val !== 'string' || !VALID_TRANSITIONS.includes(val)) {
      return [makeViolation('config-valid-background-transition', 'backgroundTransition', val,
        `Invalid backgroundTransition "${val}". Valid: ${VALID_TRANSITIONS.join(', ')}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-width-height-numeric
// Source: docs/source/config.md — "width", "height"
// ---------------------------------------------------------------------------
const configWidthHeightNumeric: ConfigRule = {
  id: 'config-width-height-numeric',
  category: 'config',
  defaultSeverity: 'error',
  description: 'width and height must be numeric (pixels).',
  docsReference: 'config.md — width/height options',
  fixHint: 'Set to a positive number in pixels (e.g., 1280)',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const violations: ConfigViolation[] = [];
    for (const prop of ['width', 'height'] as const) {
      const val = config[prop];
      if (val === undefined) continue;
      if (typeof val !== 'number' || val <= 0) {
        violations.push(makeViolation('config-width-height-numeric', prop, val,
          `${prop} must be a positive number (pixels), got ${JSON.stringify(val)}.`));
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: config-margin-range
// Source: docs/source/config.md — "margin"
// ---------------------------------------------------------------------------
const configMarginRange: ConfigRule = {
  id: 'config-margin-range',
  category: 'config',
  defaultSeverity: 'error',
  description: 'margin must be between 0.0 and 1.0.',
  docsReference: 'config.md — margin option',
  fixHint: 'Set to a value between 0 and 1 (e.g., 0.06)',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['margin'];
    if (val === undefined) return [];
    if (typeof val !== 'number' || val < 0 || val > 1) {
      return [makeViolation('config-margin-range', 'margin', val,
        `margin must be between 0 and 1, got ${JSON.stringify(val)}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-min-max-scale
// Source: docs/source/config.md — "minScale", "maxScale"
// ---------------------------------------------------------------------------
const configMinMaxScale: ConfigRule = {
  id: 'config-min-max-scale',
  category: 'config',
  defaultSeverity: 'error',
  description: 'minScale and maxScale must be positive, and minScale < maxScale.',
  docsReference: 'config.md — minScale/maxScale options',
  fixHint: 'Set to positive numbers where minScale < maxScale',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const violations: ConfigViolation[] = [];
    const min = config['minScale'];
    const max = config['maxScale'];

    if (min !== undefined && (typeof min !== 'number' || min <= 0)) {
      violations.push(makeViolation('config-min-max-scale', 'minScale', min,
        `minScale must be a positive number, got ${JSON.stringify(min)}.`));
    }
    if (max !== undefined && (typeof max !== 'number' || max <= 0)) {
      violations.push(makeViolation('config-min-max-scale', 'maxScale', max,
        `maxScale must be a positive number, got ${JSON.stringify(max)}.`));
    }
    if (typeof min === 'number' && typeof max === 'number' && min >= max) {
      violations.push(makeViolation('config-min-max-scale', 'minScale/maxScale', { min, max },
        `minScale (${min}) must be less than maxScale (${max}).`));
    }

    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule: config-auto-slide-numeric
// Source: docs/source/config.md — "autoSlide"
// ---------------------------------------------------------------------------
const configAutoSlideNumeric: ConfigRule = {
  id: 'config-auto-slide-numeric',
  category: 'config',
  defaultSeverity: 'error',
  description: 'autoSlide must be a non-negative number (milliseconds). 0 = disabled.',
  docsReference: 'config.md — autoSlide option',
  fixHint: 'Set to milliseconds (e.g., 5000) or 0 to disable',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['autoSlide'];
    if (val === undefined || val === false) return []; // false = disabled
    if (typeof val !== 'number' || val < 0) {
      return [makeViolation('config-auto-slide-numeric', 'autoSlide', val,
        `autoSlide must be a non-negative number (milliseconds), got ${JSON.stringify(val)}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-navigation-mode
// Source: docs/source/config.md — "navigationMode"
// ---------------------------------------------------------------------------
const configNavigationMode: ConfigRule = {
  id: 'config-navigation-mode',
  category: 'config',
  defaultSeverity: 'error',
  description: 'navigationMode must be: default, linear, or grid.',
  docsReference: 'config.md — navigationMode option',
  fixHint: 'Use: default, linear, or grid',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['navigationMode'];
    if (val === undefined) return [];
    if (typeof val !== 'string' || !VALID_NAV_MODES.includes(val)) {
      return [makeViolation('config-navigation-mode', 'navigationMode', val,
        `Invalid navigationMode "${val}". Valid: ${VALID_NAV_MODES.join(', ')}.`)];
    }
    return [];
  },
};

// ---------------------------------------------------------------------------
// Rule: config-view-mode
// Source: docs/source/scroll-view.md — "view"
// ---------------------------------------------------------------------------
const configViewMode: ConfigRule = {
  id: 'config-view-mode',
  category: 'config',
  defaultSeverity: 'error',
  description: 'view must be undefined (default) or "scroll".',
  docsReference: 'scroll-view.md — "view" config option',
  fixHint: 'Use: "scroll" or remove the property',
  check(config: Record<string, unknown>): ConfigViolation[] {
    const val = config['view'];
    if (val === undefined) return [];
    if (val !== 'scroll') {
      return [makeViolation('config-view-mode', 'view', val,
        `Invalid view mode "${val}". Valid: "scroll" or omit for default.`)];
    }
    return [];
  },
};

registerConfigRule(configValidTransition);
registerConfigRule(configValidTransitionSpeed);
registerConfigRule(configValidBackgroundTransition);
registerConfigRule(configWidthHeightNumeric);
registerConfigRule(configMarginRange);
registerConfigRule(configMinMaxScale);
registerConfigRule(configAutoSlideNumeric);
registerConfigRule(configNavigationMode);
registerConfigRule(configViewMode);
