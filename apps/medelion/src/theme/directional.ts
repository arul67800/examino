/**
 * Directional Support Utilities
 * LTR/RTL support utilities and CSS-in-JS helpers for directional layouts
 */

import type { Direction } from './types';

/**
 * RTL language codes for automatic direction detection
 */
export const RTL_LANGUAGES = [
  'ar', // Arabic
  'he', // Hebrew
  'fa', // Persian/Farsi
  'ur', // Urdu
  'ku', // Kurdish
  'dv', // Dhivehi/Maldivian
  'ps', // Pashto
  'sd', // Sindhi
  'ug', // Uighur
  'yi', // Yiddish
] as const;

/**
 * Detect direction from language code
 */
export const detectDirectionFromLanguage = (languageCode: string): Direction => {
  const lang = languageCode.toLowerCase().split('-')[0]; // Get language part without region
  return RTL_LANGUAGES.includes(lang as any) ? 'rtl' : 'ltr';
};

/**
 * Detect direction from HTML element
 */
export const detectDirectionFromElement = (element?: HTMLElement): Direction => {
  if (!element) {
    if (typeof document === 'undefined') return 'ltr';
    element = document.documentElement;
  }
  
  // Check explicit dir attribute
  const explicitDir = element.getAttribute('dir');
  if (explicitDir === 'rtl' || explicitDir === 'ltr') {
    return explicitDir as Direction;
  }
  
  // Check computed style
  if (typeof window !== 'undefined') {
    const computedStyle = window.getComputedStyle(element);
    const computedDir = computedStyle.direction;
    if (computedDir === 'rtl') return 'rtl';
  }
  
  // Check language
  const lang = element.lang || (typeof navigator !== 'undefined' ? navigator.language : '');
  if (lang) {
    return detectDirectionFromLanguage(lang);
  }
  
  return 'ltr';
};

/**
 * CSS logical properties mapping
 */
export const logicalProperties = {
  // Margin
  marginStart: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'marginLeft' : 'marginRight']: value,
  }),
  marginEnd: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'marginRight' : 'marginLeft']: value,
  }),
  marginInlineStart: (value: string) => ({ marginInlineStart: value }),
  marginInlineEnd: (value: string) => ({ marginInlineEnd: value }),
  
  // Padding
  paddingStart: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'paddingLeft' : 'paddingRight']: value,
  }),
  paddingEnd: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'paddingRight' : 'paddingLeft']: value,
  }),
  paddingInlineStart: (value: string) => ({ paddingInlineStart: value }),
  paddingInlineEnd: (value: string) => ({ paddingInlineEnd: value }),
  
  // Border
  borderStartWidth: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderLeftWidth' : 'borderRightWidth']: value,
  }),
  borderEndWidth: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderRightWidth' : 'borderLeftWidth']: value,
  }),
  borderStartColor: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderLeftColor' : 'borderRightColor']: value,
  }),
  borderEndColor: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderRightColor' : 'borderLeftColor']: value,
  }),
  borderStartStyle: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderLeftStyle' : 'borderRightStyle']: value,
  }),
  borderEndStyle: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderRightStyle' : 'borderLeftStyle']: value,
  }),
  
  // Border radius
  borderStartStartRadius: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderTopLeftRadius' : 'borderTopRightRadius']: value,
  }),
  borderStartEndRadius: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderTopRightRadius' : 'borderTopLeftRadius']: value,
  }),
  borderEndStartRadius: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderBottomLeftRadius' : 'borderBottomRightRadius']: value,
  }),
  borderEndEndRadius: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: value,
  }),
  
  // Positioning
  insetStart: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'left' : 'right']: value,
  }),
  insetEnd: (value: string, direction: Direction) => ({
    [direction === 'ltr' ? 'right' : 'left']: value,
  }),
  insetInlineStart: (value: string) => ({ insetInlineStart: value }),
  insetInlineEnd: (value: string) => ({ insetInlineEnd: value }),
  
  // Text alignment
  textAlignStart: (direction: Direction) => ({
    textAlign: direction === 'ltr' ? 'left' : 'right',
  }),
  textAlignEnd: (direction: Direction) => ({
    textAlign: direction === 'ltr' ? 'right' : 'left',
  }),
};

/**
 * Helper function to create directional styles
 */
export const directional = (direction: Direction) => {
  return {
    // Margin helpers
    ms: (value: string) => logicalProperties.marginStart(value, direction),
    me: (value: string) => logicalProperties.marginEnd(value, direction),
    
    // Padding helpers
    ps: (value: string) => logicalProperties.paddingStart(value, direction),
    pe: (value: string) => logicalProperties.paddingEnd(value, direction),
    
    // Border helpers
    borderStart: (width: string, style = 'solid', color?: string) => {
      const borderSide = direction === 'ltr' ? 'borderLeft' : 'borderRight';
      return {
        [`${borderSide}Width`]: width,
        [`${borderSide}Style`]: style,
        ...(color && { [`${borderSide}Color`]: color }),
      };
    },
    borderEnd: (width: string, style = 'solid', color?: string) => {
      const borderSide = direction === 'ltr' ? 'borderRight' : 'borderLeft';
      return {
        [`${borderSide}Width`]: width,
        [`${borderSide}Style`]: style,
        ...(color && { [`${borderSide}Color`]: color }),
      };
    },
    
    // Positioning helpers
    start: (value: string) => logicalProperties.insetStart(value, direction),
    end: (value: string) => logicalProperties.insetEnd(value, direction),
    
    // Text alignment helpers
    textStart: () => logicalProperties.textAlignStart(direction),
    textEnd: () => logicalProperties.textAlignEnd(direction),
    
    // Transform helpers
    translateStart: (value: string) => ({
      transform: `translateX(${direction === 'ltr' ? value : `-${value.replace('-', '')}`})`,
    }),
    translateEnd: (value: string) => ({
      transform: `translateX(${direction === 'ltr' ? `-${value.replace('-', '')}` : value})`,
    }),
    
    // Utility getters
    isLTR: direction === 'ltr',
    isRTL: direction === 'rtl',
    direction,
    opposite: direction === 'ltr' ? 'rtl' : 'ltr',
  };
};

/**
 * CSS selectors for directional styling
 */
export const directionalSelectors = {
  ltr: '[dir="ltr"]',
  rtl: '[dir="rtl"]',
  ltrOnly: '[dir="ltr"]:not([dir="rtl"])',
  rtlOnly: '[dir="rtl"]:not([dir="ltr"])',
};

/**
 * Generate CSS classes for directional utilities
 */
export const generateDirectionalCSS = (): string => {
  return `
/* Directional Utility Classes */

/* LTR specific styles */
[dir="ltr"] .ltr\\:text-left { text-align: left; }
[dir="ltr"] .ltr\\:text-right { text-align: right; }
[dir="ltr"] .ltr\\:float-left { float: left; }
[dir="ltr"] .ltr\\:float-right { float: right; }
[dir="ltr"] .ltr\\:ml-auto { margin-left: auto; }
[dir="ltr"] .ltr\\:mr-auto { margin-right: auto; }

/* RTL specific styles */
[dir="rtl"] .rtl\\:text-left { text-align: left; }
[dir="rtl"] .rtl\\:text-right { text-align: right; }
[dir="rtl"] .rtl\\:float-left { float: left; }
[dir="rtl"] .rtl\\:float-right { float: right; }
[dir="rtl"] .rtl\\:ml-auto { margin-left: auto; }
[dir="rtl"] .rtl\\:mr-auto { margin-right: auto; }

/* Logical properties (modern browsers) */
.ms-0 { margin-inline-start: 0; }
.ms-1 { margin-inline-start: 0.25rem; }
.ms-2 { margin-inline-start: 0.5rem; }
.ms-3 { margin-inline-start: 0.75rem; }
.ms-4 { margin-inline-start: 1rem; }
.ms-auto { margin-inline-start: auto; }

.me-0 { margin-inline-end: 0; }
.me-1 { margin-inline-end: 0.25rem; }
.me-2 { margin-inline-end: 0.5rem; }
.me-3 { margin-inline-end: 0.75rem; }
.me-4 { margin-inline-end: 1rem; }
.me-auto { margin-inline-end: auto; }

.ps-0 { padding-inline-start: 0; }
.ps-1 { padding-inline-start: 0.25rem; }
.ps-2 { padding-inline-start: 0.5rem; }
.ps-3 { padding-inline-start: 0.75rem; }
.ps-4 { padding-inline-start: 1rem; }

.pe-0 { padding-inline-end: 0; }
.pe-1 { padding-inline-end: 0.25rem; }
.pe-2 { padding-inline-end: 0.5rem; }
.pe-3 { padding-inline-end: 0.75rem; }
.pe-4 { padding-inline-end: 1rem; }

/* Text alignment */
.text-start { text-align: start; }
.text-end { text-align: end; }

/* Border utilities */
.border-s { border-inline-start-width: 1px; }
.border-e { border-inline-end-width: 1px; }

/* Position utilities */
.start-0 { inset-inline-start: 0; }
.start-full { inset-inline-start: 100%; }
.end-0 { inset-inline-end: 0; }
.end-full { inset-inline-end: 100%; }

/* Fallback for older browsers */
[dir="ltr"] .ms-0 { margin-left: 0; }
[dir="ltr"] .ms-1 { margin-left: 0.25rem; }
[dir="ltr"] .ms-2 { margin-left: 0.5rem; }
[dir="ltr"] .ms-3 { margin-left: 0.75rem; }
[dir="ltr"] .ms-4 { margin-left: 1rem; }
[dir="ltr"] .ms-auto { margin-left: auto; }

[dir="rtl"] .ms-0 { margin-right: 0; }
[dir="rtl"] .ms-1 { margin-right: 0.25rem; }
[dir="rtl"] .ms-2 { margin-right: 0.5rem; }
[dir="rtl"] .ms-3 { margin-right: 0.75rem; }
[dir="rtl"] .ms-4 { margin-right: 1rem; }
[dir="rtl"] .ms-auto { margin-right: auto; }

[dir="ltr"] .me-0 { margin-right: 0; }
[dir="ltr"] .me-1 { margin-right: 0.25rem; }
[dir="ltr"] .me-2 { margin-right: 0.5rem; }
[dir="ltr"] .me-3 { margin-right: 0.75rem; }
[dir="ltr"] .me-4 { margin-right: 1rem; }
[dir="ltr"] .me-auto { margin-right: auto; }

[dir="rtl"] .me-0 { margin-left: 0; }
[dir="rtl"] .me-1 { margin-left: 0.25rem; }
[dir="rtl"] .me-2 { margin-left: 0.5rem; }
[dir="rtl"] .me-3 { margin-left: 0.75rem; }
[dir="rtl"] .me-4 { margin-left: 1rem; }
[dir="rtl"] .me-auto { margin-left: auto; }

[dir="ltr"] .text-start { text-align: left; }
[dir="rtl"] .text-start { text-align: right; }
[dir="ltr"] .text-end { text-align: right; }
[dir="rtl"] .text-end { text-align: left; }

[dir="ltr"] .start-0 { left: 0; }
[dir="rtl"] .start-0 { right: 0; }
[dir="ltr"] .end-0 { right: 0; }
[dir="rtl"] .end-0 { left: 0; }
`;
};

/**
 * Flip values for RTL (useful for transforms, positions, etc.)
 */
export const flipValue = (value: string | number, direction: Direction): string => {
  if (direction === 'ltr') return String(value);
  
  const strValue = String(value);
  
  // Handle negative numbers
  if (strValue.startsWith('-')) {
    return strValue.substring(1);
  }
  
  // Handle positive numbers (make them negative for RTL)
  if (!isNaN(Number(strValue))) {
    return `-${strValue}`;
  }
  
  // Handle CSS values like '10px', '2rem', etc.
  const match = strValue.match(/^(-?)([0-9.]+)(.*)$/);
  if (match) {
    const [, sign, number, unit] = match;
    const flippedSign = sign === '-' ? '' : '-';
    return `${flippedSign}${number}${unit}`;
  }
  
  return strValue;
};

/**
 * Icon flip utility for RTL
 */
export const flipIcon = (direction: Direction) => ({
  transform: direction === 'rtl' ? 'scaleX(-1)' : 'none',
});

/**
 * Animation utilities for directional layouts
 */
export const directionalAnimations = {
  slideInStart: (direction: Direction) => ({
    '@keyframes slideInStart': {
      from: {
        transform: `translateX(${direction === 'ltr' ? '-100%' : '100%'})`,
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    },
  }),
  
  slideInEnd: (direction: Direction) => ({
    '@keyframes slideInEnd': {
      from: {
        transform: `translateX(${direction === 'ltr' ? '100%' : '-100%'})`,
        opacity: 0,
      },
      to: {
        transform: 'translateX(0)',
        opacity: 1,
      },
    },
  }),
  
  slideOutStart: (direction: Direction) => ({
    '@keyframes slideOutStart': {
      from: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      to: {
        transform: `translateX(${direction === 'ltr' ? '-100%' : '100%'})`,
        opacity: 0,
      },
    },
  }),
  
  slideOutEnd: (direction: Direction) => ({
    '@keyframes slideOutEnd': {
      from: {
        transform: 'translateX(0)',
        opacity: 1,
      },
      to: {
        transform: `translateX(${direction === 'ltr' ? '100%' : '-100%'})`,
        opacity: 0,
      },
    },
  }),
};

/**
 * Helper to create CSS-in-JS media queries with direction support
 */
export const createDirectionalMediaQuery = (breakpoint: string, direction: Direction, styles: any) => ({
  [`@media (min-width: ${breakpoint})`]: {
    [`[dir="${direction}"]`]: styles,
  },
});