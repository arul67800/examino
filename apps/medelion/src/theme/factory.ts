/**
 * Theme Factory and Core Utilities
 * Central factory for creating theme objects and utility functions
 */

import type {
  Theme,
  ThemeConfig,
  ThemeMode,
  ColorName,
  Direction,
  Typography,
  Spacing,
  Breakpoints,
  BorderRadius,
  Shadows,
  Transitions,
  ZIndex,
} from './types';
import { colorPalettes } from './colors';
import { getSemanticColors } from './modes';

/**
 * Default typography system
 */
export const defaultTypography: Typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    thin: 100,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

/**
 * Default spacing system (based on 0.25rem = 4px)
 */
export const defaultSpacing: Spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
};

/**
 * Default breakpoint system
 */
export const defaultBreakpoints: Breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Default border radius system
 */
export const defaultBorderRadius: BorderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
};

/**
 * Default shadow system
 */
export const defaultShadows: Shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

/**
 * Default transition system
 */
export const defaultTransitions: Transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  timing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
  },
};

/**
 * Default z-index system
 */
export const defaultZIndex: ZIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

/**
 * Default theme configuration
 */
export const defaultThemeConfig: ThemeConfig = {
  colorName: 'green',
  mode: 'black',
  direction: 'ltr',
};

/**
 * Create a complete theme object
 */
export const createTheme = (config: Partial<ThemeConfig> = {}): Theme => {
  const finalConfig = { ...defaultThemeConfig, ...config };
  
  const semanticColors = getSemanticColors(finalConfig.mode, finalConfig.colorName);
  
  // Merge custom colors if provided
  const rawColors = { ...colorPalettes };
  if (config.customColors) {
    Object.entries(config.customColors).forEach(([colorName, customShades]) => {
      if (customShades) {
        rawColors[colorName as ColorName] = {
          ...rawColors[colorName as ColorName],
          ...customShades,
        };
      }
    });
  }

  // Merge custom semantic colors if provided
  const finalSemanticColors = config.customSemanticColors 
    ? mergeSemanticColors(semanticColors, config.customSemanticColors)
    : semanticColors;

  return {
    mode: finalConfig.mode,
    colorName: finalConfig.colorName,
    direction: finalConfig.direction,
    colors: {
      raw: rawColors,
      semantic: finalSemanticColors,
    },
    typography: defaultTypography,
    spacing: defaultSpacing,
    breakpoints: defaultBreakpoints,
    borderRadius: defaultBorderRadius,
    shadows: defaultShadows,
    transitions: defaultTransitions,
    zIndex: defaultZIndex,
  };
};

/**
 * Deep merge semantic colors
 */
const mergeSemanticColors = (base: any, custom: any): any => {
  const result = { ...base };
  
  Object.keys(custom).forEach(key => {
    if (typeof custom[key] === 'object' && custom[key] !== null && !Array.isArray(custom[key])) {
      result[key] = mergeSemanticColors(result[key] || {}, custom[key]);
    } else {
      result[key] = custom[key];
    }
  });
  
  return result;
};

/**
 * Get theme color by path (e.g., 'colors.semantic.background.primary')
 */
export const getThemeColor = (theme: Theme, path: string): string => {
  const keys = path.split('.');
  let value: any = theme;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      console.warn(`Theme color path "${path}" not found`);
      return '#000000'; // fallback color
    }
  }
  
  return typeof value === 'string' ? value : '#000000';
};

/**
 * Create multiple themes for all combinations
 */
export const createAllThemes = (): Record<string, Theme> => {
  const themes: Record<string, Theme> = {};
  const colorNames: ColorName[] = ['green', 'blue', 'pink', 'orange', 'red', 'gray'];
  const modes: ThemeMode[] = ['light', 'dark', 'black'];
  const directions: Direction[] = ['ltr', 'rtl'];
  
  for (const colorName of colorNames) {
    for (const mode of modes) {
      for (const direction of directions) {
        const key = `${colorName}-${mode}-${direction}`;
        themes[key] = createTheme({ colorName, mode, direction });
      }
    }
  }
  
  return themes;
};

/**
 * Utility to check if current theme is dark
 */
export const isDarkMode = (theme: Theme): boolean => {
  return theme.mode === 'dark' || theme.mode === 'black';
};

/**
 * Utility to get opposite direction
 */
export const getOppositeDirection = (direction: Direction): Direction => {
  return direction === 'ltr' ? 'rtl' : 'ltr';
};

/**
 * Utility to get next mode in cycle
 */
export const getNextMode = (currentMode: ThemeMode): ThemeMode => {
  switch (currentMode) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'black';
    case 'black':
      return 'light';
    default:
      return 'light';
  }
};