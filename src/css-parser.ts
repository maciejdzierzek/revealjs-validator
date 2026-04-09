import * as csstree from 'css-tree';

export interface CSSRule {
  /** Full selector text, e.g. ".reveal .slides section" */
  selector: string;
  /** Individual selector parts for matching */
  selectorParts: string[];
  /** Property declarations */
  declarations: CSSDeclaration[];
  /** Line number in source (1-based) */
  line: number;
}

export interface CSSDeclaration {
  property: string;
  value: string;
  line: number;
}

export interface CSSKeyframes {
  name: string;
  line: number;
}

export interface CSSParseResult {
  rules: CSSRule[];
  keyframes: CSSKeyframes[];
}

/**
 * Parse a CSS string into structured rules for validation.
 */
export function parseCSS(css: string): CSSParseResult {
  const ast = csstree.parse(css, {
    positions: true,
    parseCustomProperty: false,
  });

  const rules: CSSRule[] = [];
  const keyframes: CSSKeyframes[] = [];

  csstree.walk(ast, {
    visit: 'Rule',
    enter(node) {
      if (node.prelude.type !== 'SelectorList') return;

      const selectorText = csstree.generate(node.prelude);
      const selectorParts = selectorText.split(',').map((s) => s.trim());

      const declarations: CSSDeclaration[] = [];
      if (node.block && node.block.type === 'Block') {
        csstree.walk(node.block, {
          visit: 'Declaration',
          enter(decl) {
            declarations.push({
              property: decl.property,
              value: csstree.generate(decl.value),
              line: decl.loc?.start.line ?? 0,
            });
          },
        });
      }

      rules.push({
        selector: selectorText,
        selectorParts,
        declarations,
        line: node.loc?.start.line ?? 0,
      });
    },
  });

  csstree.walk(ast, {
    visit: 'Atrule',
    enter(node) {
      if (node.name === 'keyframes' || node.name === '-webkit-keyframes') {
        const name = node.prelude ? csstree.generate(node.prelude) : '';
        keyframes.push({
          name,
          line: node.loc?.start.line ?? 0,
        });
      }
    },
  });

  return { rules, keyframes };
}
