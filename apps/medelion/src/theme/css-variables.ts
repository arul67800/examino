/**
 * CSS Variables Integration
 * Generate CSS custom properties from theme for seamless CSS integration
 */

import type { Theme, CSSCustomProperties, ColorName } from './types';
import { createTheme } from './factory';

/**
 * Convert camelCase to kebab-case
 */
const camelToKebab = (str: string): string => {
  return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
};

/**
 * Flatten nested object into dot notation
 */
const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
  const flattened: Record<string, string> = {};
  
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}-${camelToKebab(key)}` : camelToKebab(key);
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(flattened, flattenObject(value, newKey));
    } else if (typeof value === 'string' || typeof value === 'number') {
      flattened[newKey] = String(value);
    }
  });
  
  return flattened;
};

/**
 * Generate CSS custom properties from theme
 */
export const generateCSSVariables = (theme: Theme): CSSCustomProperties => {
  const variables: CSSCustomProperties = {};
  
  // Add theme meta information
  variables['theme-mode'] = theme.mode;
  variables['theme-color'] = theme.colorName;
  variables['theme-direction'] = theme.direction;
  
  // Flatten and add all theme properties
  const flattened = flattenObject({
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    breakpoints: theme.breakpoints,
    borderRadius: theme.borderRadius,
    shadows: theme.shadows,
    transitions: theme.transitions,
    zIndex: theme.zIndex,
  });
  
  // Add -- prefix to all variables
  Object.entries(flattened).forEach(([key, value]) => {
    variables[`--${key}`] = value;
  });
  
  return variables;
};

/**
 * Generate CSS string from custom properties
 */
export const generateCSSString = (variables: CSSCustomProperties, selector = ':root'): string => {
  const cssRules = Object.entries(variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n');
    
  return `${selector} {\n${cssRules}\n}`;
};

/**
 * Generate complete CSS for all theme combinations
 */
export const generateAllThemeCSS = (): string => {
  const colorNames: ColorName[] = ['green', 'blue', 'pink', 'orange', 'red', 'gray'];
  const modes = ['light', 'dark', 'black'] as const;
  const directions = ['ltr', 'rtl'] as const;
  
  let css = '';
  
  // Generate base theme (default)
  const defaultTheme = createTheme();
  const defaultVariables = generateCSSVariables(defaultTheme);
  css += generateCSSString(defaultVariables, ':root') + '\n\n';
  
  // Generate theme-specific overrides
  for (const colorName of colorNames) {
    for (const mode of modes) {
      for (const direction of directions) {
        const theme = createTheme({ colorName, mode, direction });
        const variables = generateCSSVariables(theme);
        const selector = `[data-theme-color="${colorName}"][data-theme-mode="${mode}"][dir="${direction}"]`;
        
        css += generateCSSString(variables, selector) + '\n\n';
      }
    }
  }
  
  return css;
};

/**
 * Utility class names for CSS integration
 */
export const themeClassNames = {
  // Mode classes
  light: 'mode-light',
  dark: 'mode-dark',
  black: 'mode-black',
  
  // Color classes
  green: 'theme-green',
  blue: 'theme-blue',
  pink: 'theme-pink',
  orange: 'theme-orange',
  red: 'theme-red',
  gray: 'theme-gray',
  
  // Direction classes
  ltr: 'dir-ltr',
  rtl: 'dir-rtl',
} as const;

/**
 * CSS utility classes for common theme patterns
 */
export const generateUtilityCSS = (): string => {
  return `
/* Theme Utility Classes */

/* Background Colors */
.bg-primary { background-color: var(--colors-semantic-background-primary); }
.bg-secondary { background-color: var(--colors-semantic-background-secondary); }
.bg-tertiary { background-color: var(--colors-semantic-background-tertiary); }
.bg-elevated { background-color: var(--colors-semantic-background-elevated); }
.bg-overlay { background-color: var(--colors-semantic-background-overlay); }

/* Surface Colors */
.surface-primary { background-color: var(--colors-semantic-surface-primary); }
.surface-secondary { background-color: var(--colors-semantic-surface-secondary); }
.surface-tertiary { background-color: var(--colors-semantic-surface-tertiary); }
.surface-elevated { background-color: var(--colors-semantic-surface-elevated); }
.surface-overlay { background-color: var(--colors-semantic-surface-overlay); }

/* Text Colors */
.text-primary { color: var(--colors-semantic-text-primary); }
.text-secondary { color: var(--colors-semantic-text-secondary); }
.text-tertiary { color: var(--colors-semantic-text-tertiary); }
.text-disabled { color: var(--colors-semantic-text-disabled); }
.text-inverse { color: var(--colors-semantic-text-inverse); }

/* Border Colors */
.border-primary { border-color: var(--colors-semantic-border-primary); }
.border-secondary { border-color: var(--colors-semantic-border-secondary); }
.border-focus { border-color: var(--colors-semantic-border-focus); }
.border-error { border-color: var(--colors-semantic-border-error); }
.border-success { border-color: var(--colors-semantic-border-success); }
.border-warning { border-color: var(--colors-semantic-border-warning); }

/* Action Colors */
.action-primary { background-color: var(--colors-semantic-action-primary); }
.action-secondary { background-color: var(--colors-semantic-action-secondary); }
.action-tertiary { background-color: var(--colors-semantic-action-tertiary); }
.action-hover:hover { background-color: var(--colors-semantic-action-hover); }
.action-pressed:active { background-color: var(--colors-semantic-action-pressed); }
.action-disabled:disabled { background-color: var(--colors-semantic-action-disabled); }
.action-focus:focus { background-color: var(--colors-semantic-action-focus); }

/* Status Colors */
.status-error { color: var(--colors-semantic-status-error); }
.status-warning { color: var(--colors-semantic-status-warning); }
.status-success { color: var(--colors-semantic-status-success); }
.status-info { color: var(--colors-semantic-status-info); }

/* Shadows */
.shadow-xs { box-shadow: var(--shadows-xs); }
.shadow-sm { box-shadow: var(--shadows-sm); }
.shadow-base { box-shadow: var(--shadows-base); }
.shadow-md { box-shadow: var(--shadows-md); }
.shadow-lg { box-shadow: var(--shadows-lg); }
.shadow-xl { box-shadow: var(--shadows-xl); }
.shadow-2xl { box-shadow: var(--shadows-2-xl); }
.shadow-inner { box-shadow: var(--shadows-inner); }
.shadow-none { box-shadow: var(--shadows-none); }

/* Typography */
.font-sans { font-family: var(--typography-font-family-sans); }
.font-serif { font-family: var(--typography-font-family-serif); }
.font-mono { font-family: var(--typography-font-family-mono); }

.text-xs { font-size: var(--typography-font-size-xs); }
.text-sm { font-size: var(--typography-font-size-sm); }
.text-base { font-size: var(--typography-font-size-base); }
.text-lg { font-size: var(--typography-font-size-lg); }
.text-xl { font-size: var(--typography-font-size-xl); }
.text-2xl { font-size: var(--typography-font-size-2-xl); }
.text-3xl { font-size: var(--typography-font-size-3-xl); }
.text-4xl { font-size: var(--typography-font-size-4-xl); }
.text-5xl { font-size: var(--typography-font-size-5-xl); }
.text-6xl { font-size: var(--typography-font-size-6-xl); }

/* Border Radius */
.rounded-none { border-radius: var(--border-radius-none); }
.rounded-sm { border-radius: var(--border-radius-sm); }
.rounded { border-radius: var(--border-radius-base); }
.rounded-md { border-radius: var(--border-radius-md); }
.rounded-lg { border-radius: var(--border-radius-lg); }
.rounded-xl { border-radius: var(--border-radius-xl); }
.rounded-2xl { border-radius: var(--border-radius-2-xl); }
.rounded-3xl { border-radius: var(--border-radius-3-xl); }
.rounded-full { border-radius: var(--border-radius-full); }

/* Directional Support */
[dir="rtl"] .text-left { text-align: right; }
[dir="rtl"] .text-right { text-align: left; }
[dir="ltr"] .text-left { text-align: left; }
[dir="ltr"] .text-right { text-align: right; }

/* RTL-aware margins */
.ms-auto { margin-inline-start: auto; }
.me-auto { margin-inline-end: auto; }
.ps-2 { padding-inline-start: var(--spacing-2); }
.pe-2 { padding-inline-end: var(--spacing-2); }
.ps-4 { padding-inline-start: var(--spacing-4); }
.pe-4 { padding-inline-end: var(--spacing-4); }

/* Theme transitions */
.theme-transition {
  transition: 
    background-color var(--transitions-duration-normal) var(--transitions-timing-ease),
    color var(--transitions-duration-normal) var(--transitions-timing-ease),
    border-color var(--transitions-duration-normal) var(--transitions-timing-ease);
}

/* Focus styles */
.focus-ring:focus {
  outline: 2px solid var(--colors-semantic-border-focus);
  outline-offset: 2px;
}

.focus-ring:focus-visible {
  outline: 2px solid var(--colors-semantic-border-focus);
  outline-offset: 2px;
}
`;
};

/**
 * Helper to apply CSS variables to DOM
 */
export const applyCSSVariables = (theme: Theme, element: HTMLElement = document.documentElement): void => {
  const variables = generateCSSVariables(theme);
  
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

/**
 * Helper to remove CSS variables from DOM
 */
export const removeCSSVariables = (theme: Theme, element: HTMLElement = document.documentElement): void => {
  const variables = generateCSSVariables(theme);
  
  Object.keys(variables).forEach((property) => {
    element.style.removeProperty(property);
  });
};

/**
 * Generate CSS variable reference helper
 */
export const cssVar = (variableName: string): string => {
  return `var(--${camelToKebab(variableName)})`;
};

/**
 * Generate CSS variable reference with fallback
 */
export const cssVarWithFallback = (variableName: string, fallback: string): string => {
  return `var(--${camelToKebab(variableName)}, ${fallback})`;
};