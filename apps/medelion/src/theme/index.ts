/**
 * Theme System - Main Export
 * Comprehensive theme system with light, dark, and black modes,
 * multiple color options, and full LTR/RTL support
 */

// Import theme CSS styles
import './theme.css';

// Types and Interfaces
export type {
  ColorName,
  ThemeMode,
  Direction,
  ColorShades,
  SemanticColors,
  Typography,
  Spacing,
  Breakpoints,
  BorderRadius,
  Shadows,
  Transitions,
  ZIndex,
  Theme,
  ThemeConfig,
  ThemeContextValue,
  CSSCustomProperties,
  DirectionalStyles,
} from './types';

// Color System
export {
  greenPalette,
  bluePalette,
  pinkPalette,
  orangePalette,
  redPalette,
  grayPalette,
  colorPalettes,
  neutralColors,
  commonSemanticColors,
  alphaValues,
  withAlpha,
  getColor,
  getPrimaryColor,
} from './colors';

// Mode System
export {
  createLightModeColors,
  createDarkModeColors,
  createBlackModeColors,
  getSemanticColors,
  modeAdjustments,
  getContrastColor,
} from './modes';

// Theme Factory and Utilities
export {
  defaultTypography,
  defaultSpacing,
  defaultBreakpoints,
  defaultBorderRadius,
  defaultShadows,
  defaultTransitions,
  defaultZIndex,
  defaultThemeConfig,
  createTheme,
  getThemeColor,
  createAllThemes,
  isDarkMode,
  getOppositeDirection,
  getNextMode,
} from './factory';

// React Context and Provider
export {
  ThemeProvider,
  useTheme,
  useThemeObject,
  useThemeColors,
  useSemanticColors,
  useRawColors,
  useTypography,
  useSpacing,
  useThemeMode,
  useDirection,
} from './context';

// Advanced Hooks and Utilities
export {
  useThemeColor,
  useThemeColorMap,
  usePalette,
  usePrimaryColor,
  useThemeStyles,
  useBreakpoints,
  useThemeTransitions,
  useDirectionalStyles,
  useThemeVariants,
  useConditionalStyles,
  useShadows,
} from './hooks';

// CSS Variables Integration
export {
  generateCSSVariables,
  generateCSSString,
  generateAllThemeCSS,
  generateUtilityCSS,
  themeClassNames,
  applyCSSVariables,
  removeCSSVariables,
  cssVar,
  cssVarWithFallback,
} from './css-variables';

// Directional Support
export {
  RTL_LANGUAGES,
  detectDirectionFromLanguage,
  detectDirectionFromElement,
  logicalProperties,
  directional,
  directionalSelectors,
  generateDirectionalCSS,
  flipValue,
  flipIcon,
  directionalAnimations,
  createDirectionalMediaQuery,
} from './directional';

// Import required functions and types for theme creation
import { createTheme } from './factory';
import { detectDirectionFromElement } from './directional';
import type { ThemeMode, ColorName, Direction, ThemeConfig } from './types';

// Default theme instance for immediate use
export const defaultTheme = createTheme();

// Pre-built themes for common use cases
export const themes = {
  // Light themes
  light: {
    green: createTheme({ colorName: 'green', mode: 'light' }),
    blue: createTheme({ colorName: 'blue', mode: 'light' }),
    pink: createTheme({ colorName: 'pink', mode: 'light' }),
    orange: createTheme({ colorName: 'orange', mode: 'light' }),
    red: createTheme({ colorName: 'red', mode: 'light' }),
    gray: createTheme({ colorName: 'gray', mode: 'light' }),
  },
  
  // Dark themes
  dark: {
    green: createTheme({ colorName: 'green', mode: 'dark' }),
    blue: createTheme({ colorName: 'blue', mode: 'dark' }),
    pink: createTheme({ colorName: 'pink', mode: 'dark' }),
    orange: createTheme({ colorName: 'orange', mode: 'dark' }),
    red: createTheme({ colorName: 'red', mode: 'dark' }),
    gray: createTheme({ colorName: 'gray', mode: 'dark' }),
  },
  
  // Black themes (AMOLED friendly)
  black: {
    green: createTheme({ colorName: 'green', mode: 'black' }),
    blue: createTheme({ colorName: 'blue', mode: 'black' }),
    pink: createTheme({ colorName: 'pink', mode: 'black' }),
    orange: createTheme({ colorName: 'orange', mode: 'black' }),
    red: createTheme({ colorName: 'red', mode: 'black' }),
    gray: createTheme({ colorName: 'gray', mode: 'black' }),
  },
} as const;

// Utility constants
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'black'];
export const COLOR_NAMES: ColorName[] = ['green', 'blue', 'pink', 'orange', 'red', 'gray'];
export const DIRECTIONS: Direction[] = ['ltr', 'rtl'];

// Theme system metadata
export const THEME_VERSION = '1.0.0';
export const THEME_NAME = 'Medelion Theme System';

/**
 * Quick start utility - sets up theme with sensible defaults
 * @param config Optional theme configuration
 * @returns Theme instance ready to use
 */
export const quickStartTheme = (config?: Partial<ThemeConfig>) => {
  const detectedDirection = typeof window !== 'undefined' 
    ? detectDirectionFromElement() 
    : 'ltr';
    
  const detectedMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'black' 
    : 'black';
  
  return createTheme({
    direction: detectedDirection,
    mode: detectedMode,
    colorName: 'green',
    ...config,
  });
};

/**
 * Helper to generate complete CSS for the theme system
 * Includes all themes, utility classes, and directional support
 */
export const generateCompleteThemeCSS = (): string => {
  // Import functions locally to avoid circular dependency
  const { generateAllThemeCSS, generateUtilityCSS } = require('./css-variables');
  const { generateDirectionalCSS } = require('./directional');
  
  const allThemeCSS = generateAllThemeCSS();
  const utilityCSS = generateUtilityCSS();
  const directionalCSS = generateDirectionalCSS();
  
  return `
/*
 * ${THEME_NAME} v${THEME_VERSION}
 * Complete CSS for theme system with full feature support
 * Generated automatically - do not edit manually
 */

${allThemeCSS}

${utilityCSS}

${directionalCSS}

/* Additional theme system utilities */
.theme-transition * {
  transition: 
    background-color var(--transitions-duration-normal) var(--transitions-timing-ease),
    color var(--transitions-duration-normal) var(--transitions-timing-ease),
    border-color var(--transitions-duration-normal) var(--transitions-timing-ease),
    box-shadow var(--transitions-duration-normal) var(--transitions-timing-ease);
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  .theme-transition,
  .theme-transition * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
};