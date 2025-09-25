/**
 * Color Palette Definitions
 * Comprehensive color palettes for all supported themes
 */

import type { ColorShades, ColorName } from './types';

/**
 * Green color palette
 */
export const greenPalette: ColorShades = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
};

/**
 * Blue color palette
 */
export const bluePalette: ColorShades = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
};

/**
 * Pink color palette
 */
export const pinkPalette: ColorShades = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  950: '#500724',
};

/**
 * Orange color palette
 */
export const orangePalette: ColorShades = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
};

/**
 * Red color palette
 */
export const redPalette: ColorShades = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
};

/**
 * Gray color palette
 */
export const grayPalette: ColorShades = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
};

/**
 * Complete color palettes mapping
 */
export const colorPalettes: Record<ColorName, ColorShades> = {
  green: greenPalette,
  blue: bluePalette,
  pink: pinkPalette,
  orange: orangePalette,
  red: redPalette,
  gray: grayPalette,
};

/**
 * Neutral colors (used across all themes)
 */
export const neutralColors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
};

/**
 * Common semantic colors that don't change based on theme color
 */
export const commonSemanticColors = {
  error: {
    light: '#ef4444',
    dark: '#f87171',
    black: '#fca5a5',
  },
  success: {
    light: '#22c55e',
    dark: '#4ade80',
    black: '#86efac',
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24',
    black: '#fcd34d',
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa',
    black: '#93c5fd',
  },
};

/**
 * Alpha values for creating transparent colors
 */
export const alphaValues = {
  0: '00',
  5: '0d',
  10: '1a',
  20: '33',
  25: '40',
  30: '4d',
  40: '66',
  50: '80',
  60: '99',
  70: 'b3',
  75: 'bf',
  80: 'cc',
  90: 'e6',
  95: 'f2',
  100: 'ff',
};

/**
 * Utility function to create transparent colors
 */
export const withAlpha = (color: string, alpha: keyof typeof alphaValues): string => {
  // Remove # if present
  const cleanColor = color.replace('#', '');
  return `#${cleanColor}${alphaValues[alpha]}`;
};

/**
 * Utility function to get color by name and shade
 */
export const getColor = (colorName: ColorName, shade: keyof ColorShades): string => {
  return colorPalettes[colorName][shade];
};

/**
 * Utility function to get the primary color for a theme
 */
export const getPrimaryColor = (colorName: ColorName): string => {
  return colorPalettes[colorName][500];
};