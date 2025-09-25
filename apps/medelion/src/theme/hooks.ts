/**
 * Theme Hooks and Utilities
 * Additional hooks and utility functions for theme integration
 */

'use client';

import { useMemo, useCallback } from 'react';
import type { Theme, ColorName, ColorShades, DirectionalStyles } from './types';
import { useTheme, useThemeObject, useSemanticColors, useDirection } from './context';
import { getThemeColor } from './factory';

/**
 * Hook to get a specific color by path
 * Usage: const bgColor = useThemeColor('colors.semantic.background.primary')
 */
export const useThemeColor = (path: string): string => {
  const theme = useThemeObject();
  
  return useMemo(() => {
    return getThemeColor(theme, path);
  }, [theme, path]);
};

/**
 * Hook to get multiple colors by paths
 * Usage: const { bg, text } = useThemeColors({
 *   bg: 'colors.semantic.background.primary',
 *   text: 'colors.semantic.text.primary'
 * })
 */
export const useThemeColorMap = <T extends Record<string, string>>(
  colorMap: T
): Record<keyof T, string> => {
  const theme = useThemeObject();
  
  return useMemo(() => {
    const result: any = {};
    
    Object.entries(colorMap).forEach(([key, path]) => {
      result[key] = getThemeColor(theme, path);
    });
    
    return result;
  }, [theme, colorMap]);
};

/**
 * Hook to get colors from a specific palette
 * Usage: const blueColors = usePalette('blue')
 */
export const usePalette = (colorName: ColorName): ColorShades => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return theme.colors.raw[colorName];
  }, [theme.colors.raw, colorName]);
};

/**
 * Hook to get the current primary color
 */
export const usePrimaryColor = (): string => {
  const { theme, colorName } = useTheme();
  
  return useMemo(() => {
    return theme.colors.raw[colorName][500];
  }, [theme.colors.raw, colorName]);
};

/**
 * Hook for creating CSS-in-JS styles with theme support
 * Usage: const styles = useThemeStyles((theme) => ({
 *   container: {
 *     backgroundColor: theme.colors.semantic.background.primary,
 *     color: theme.colors.semantic.text.primary,
 *   }
 * }))
 */
export const useThemeStyles = <T>(
  stylesFn: (theme: Theme) => T
): T => {
  const theme = useThemeObject();
  
  return useMemo(() => {
    return stylesFn(theme);
  }, [theme, stylesFn]);
};

/**
 * Hook for responsive breakpoint utilities
 */
export const useBreakpoints = () => {
  const theme = useThemeObject();
  
  const breakpoints = useMemo(() => theme.breakpoints, [theme.breakpoints]);
  
  const up = useCallback((breakpoint: keyof typeof breakpoints) => {
    return `@media (min-width: ${breakpoints[breakpoint]})`;
  }, [breakpoints]);
  
  const down = useCallback((breakpoint: keyof typeof breakpoints) => {
    const breakpointKeys = Object.keys(breakpoints) as (keyof typeof breakpoints)[];
    const currentIndex = breakpointKeys.indexOf(breakpoint);
    
    if (currentIndex === 0) return '@media (max-width: 0px)'; // No smaller breakpoint
    
    const previousBreakpoint = breakpointKeys[currentIndex - 1];
    const maxWidth = parseInt(breakpoints[previousBreakpoint]) - 1;
    
    return `@media (max-width: ${maxWidth}px)`;
  }, [breakpoints]);
  
  const between = useCallback((min: keyof typeof breakpoints, max: keyof typeof breakpoints) => {
    const maxWidth = parseInt(breakpoints[max]) - 1;
    return `@media (min-width: ${breakpoints[min]}) and (max-width: ${maxWidth}px)`;
  }, [breakpoints]);
  
  return {
    breakpoints,
    up,
    down,
    between,
  };
};

/**
 * Hook for theme-aware animations
 */
export const useThemeTransitions = () => {
  const theme = useThemeObject();
  
  const transitions = useMemo(() => theme.transitions, [theme.transitions]);
  
  const create = useCallback((
    properties: string | string[],
    duration?: keyof typeof transitions.duration,
    timing?: keyof typeof transitions.timing
  ) => {
    const props = Array.isArray(properties) ? properties.join(', ') : properties;
    const dur = duration ? transitions.duration[duration] : transitions.duration.normal;
    const tim = timing ? transitions.timing[timing] : transitions.timing.ease;
    
    return `${props} ${dur} ${tim}`;
  }, [transitions]);
  
  return {
    transitions,
    create,
    durations: transitions.duration,
    timings: transitions.timing,
  };
};

/**
 * Hook for directional styles (LTR/RTL support)
 */
export const useDirectionalStyles = () => {
  const { direction } = useDirection();
  
  const directional = useCallback((styles: Partial<DirectionalStyles>) => {
    const result: any = {};
    
    // Handle margin and padding
    if (styles.marginStart !== undefined) {
      result[direction === 'ltr' ? 'marginLeft' : 'marginRight'] = styles.marginStart;
    }
    if (styles.marginEnd !== undefined) {
      result[direction === 'ltr' ? 'marginRight' : 'marginLeft'] = styles.marginEnd;
    }
    if (styles.paddingStart !== undefined) {
      result[direction === 'ltr' ? 'paddingLeft' : 'paddingRight'] = styles.paddingStart;
    }
    if (styles.paddingEnd !== undefined) {
      result[direction === 'ltr' ? 'paddingRight' : 'paddingLeft'] = styles.paddingEnd;
    }
    
    // Handle borders
    if (styles.borderStartWidth !== undefined) {
      result[direction === 'ltr' ? 'borderLeftWidth' : 'borderRightWidth'] = styles.borderStartWidth;
    }
    if (styles.borderEndWidth !== undefined) {
      result[direction === 'ltr' ? 'borderRightWidth' : 'borderLeftWidth'] = styles.borderEndWidth;
    }
    if (styles.borderStartColor !== undefined) {
      result[direction === 'ltr' ? 'borderLeftColor' : 'borderRightColor'] = styles.borderStartColor;
    }
    if (styles.borderEndColor !== undefined) {
      result[direction === 'ltr' ? 'borderRightColor' : 'borderLeftColor'] = styles.borderEndColor;
    }
    if (styles.borderStartStyle !== undefined) {
      result[direction === 'ltr' ? 'borderLeftStyle' : 'borderRightStyle'] = styles.borderStartStyle;
    }
    if (styles.borderEndStyle !== undefined) {
      result[direction === 'ltr' ? 'borderRightStyle' : 'borderLeftStyle'] = styles.borderEndStyle;
    }
    
    // Handle positioning
    if (styles.left !== undefined) {
      result[direction === 'ltr' ? 'left' : 'right'] = styles.left;
    }
    if (styles.right !== undefined) {
      result[direction === 'ltr' ? 'right' : 'left'] = styles.right;
    }
    
    // Handle text alignment
    if (styles.textAlign !== undefined) {
      if (styles.textAlign === 'left') {
        result.textAlign = direction === 'ltr' ? 'left' : 'right';
      } else if (styles.textAlign === 'right') {
        result.textAlign = direction === 'ltr' ? 'right' : 'left';
      } else {
        result.textAlign = styles.textAlign;
      }
    }
    
    return result;
  }, [direction]);
  
  return {
    directional,
    isRTL: direction === 'rtl',
    isLTR: direction === 'ltr',
    direction,
  };
};

/**
 * Hook for creating theme-aware component variants
 * Usage: const buttonVariants = useThemeVariants({
 *   primary: (theme) => ({ backgroundColor: theme.colors.semantic.action.primary }),
 *   secondary: (theme) => ({ backgroundColor: theme.colors.semantic.action.secondary })
 * })
 */
export const useThemeVariants = <T extends Record<string, (theme: Theme) => any>>(
  variants: T
): Record<keyof T, any> => {
  const theme = useThemeObject();
  
  return useMemo(() => {
    const result: any = {};
    
    Object.entries(variants).forEach(([key, styleFn]) => {
      result[key] = styleFn(theme);
    });
    
    return result;
  }, [theme, variants]);
};

/**
 * Hook for creating conditional theme-based styles
 * Usage: const styles = useConditionalStyles({
 *   light: { backgroundColor: 'white' },
 *   dark: { backgroundColor: 'black' },
 *   rtl: { textAlign: 'right' }
 * })
 */
export const useConditionalStyles = (conditions: {
  light?: Record<string, any>;
  dark?: Record<string, any>;
  black?: Record<string, any>;
  ltr?: Record<string, any>;
  rtl?: Record<string, any>;
  green?: Record<string, any>;
  blue?: Record<string, any>;
  pink?: Record<string, any>;
  orange?: Record<string, any>;
  red?: Record<string, any>;
  gray?: Record<string, any>;
}) => {
  const { mode, colorName, direction } = useTheme();
  
  return useMemo(() => {
    let styles = {};
    
    // Apply mode-based styles
    if (conditions[mode]) {
      styles = { ...styles, ...conditions[mode] };
    }
    
    // Apply direction-based styles
    if (conditions[direction]) {
      styles = { ...styles, ...conditions[direction] };
    }
    
    // Apply color-based styles
    const colorCondition = conditions[colorName];
    if (colorCondition) {
      styles = { ...styles, ...colorCondition };
    }
    
    return styles;
  }, [mode, colorName, direction, conditions]);
};

/**
 * Hook to get theme-aware shadow styles
 */
export const useShadows = () => {
  const theme = useThemeObject();
  const semanticColors = useSemanticColors();
  
  const shadows = useMemo(() => theme.shadows, [theme.shadows]);
  
  const createShadow = useCallback((size: keyof typeof shadows, color?: string) => {
    const baseShadow = shadows[size];
    
    if (color) {
      // Replace rgb(0 0 0 / alpha) with custom color
      return baseShadow.replace(/rgb\(0 0 0 \/ ([\d.]+)\)/g, (match, alpha) => {
        return `${color}${Math.round(parseFloat(alpha) * 255).toString(16).padStart(2, '0')}`;
      });
    }
    
    return baseShadow;
  }, [shadows]);
  
  const coloredShadow = useCallback((size: keyof typeof shadows) => {
    return createShadow(size, semanticColors.shadow.colored);
  }, [createShadow, semanticColors.shadow.colored]);
  
  return {
    shadows,
    createShadow,
    coloredShadow,
  };
};