/**
 * Mode Definitions
 * Semantic color mappings for light, dark, and black modes
 */

import type { SemanticColors, ColorName, ThemeMode, ColorShades } from './types';
import { colorPalettes, withAlpha, commonSemanticColors, neutralColors } from './colors';

/**
 * Create semantic colors for light mode
 */
export const createLightModeColors = (colorName: ColorName): SemanticColors => {
  const palette = colorPalettes[colorName];
  const gray = colorPalettes.gray;

  return {
    background: {
      primary: neutralColors.white,
      secondary: gray[50],
      tertiary: gray[100],
      elevated: neutralColors.white,
      overlay: withAlpha(neutralColors.black, 50),
    },
    surface: {
      primary: neutralColors.white,
      secondary: gray[50],
      tertiary: gray[100],
      elevated: neutralColors.white,
      overlay: withAlpha(neutralColors.white, 90),
    },
    text: {
      primary: gray[900],
      secondary: gray[700],
      tertiary: gray[500],
      disabled: gray[400],
      inverse: neutralColors.white,
    },
    border: {
      primary: gray[200],
      secondary: gray[100],
      focus: palette[500],
      error: commonSemanticColors.error.light,
      success: commonSemanticColors.success.light,
      warning: commonSemanticColors.warning.light,
    },
    action: {
      primary: palette[500],
      secondary: palette[100],
      tertiary: palette[50],
      hover: palette[600],
      pressed: palette[700],
      disabled: gray[200],
      focus: withAlpha(palette[500], 20),
    },
    status: {
      error: commonSemanticColors.error.light,
      warning: commonSemanticColors.warning.light,
      success: commonSemanticColors.success.light,
      info: commonSemanticColors.info.light,
    },
    shadow: {
      small: withAlpha(neutralColors.black, 10),
      medium: withAlpha(neutralColors.black, 20),
      large: withAlpha(neutralColors.black, 25),
      colored: withAlpha(palette[500], 25),
    },
  };
};

/**
 * Create semantic colors for dark mode
 */
export const createDarkModeColors = (colorName: ColorName): SemanticColors => {
  const palette = colorPalettes[colorName];
  const gray = colorPalettes.gray;

  return {
    background: {
      primary: gray[900],
      secondary: gray[800],
      tertiary: gray[700],
      elevated: gray[800],
      overlay: withAlpha(neutralColors.black, 70),
    },
    surface: {
      primary: gray[800],
      secondary: gray[700],
      tertiary: gray[600],
      elevated: gray[700],
      overlay: withAlpha(gray[900], 90),
    },
    text: {
      primary: gray[100],
      secondary: gray[300],
      tertiary: gray[400],
      disabled: gray[500],
      inverse: gray[900],
    },
    border: {
      primary: gray[700],
      secondary: gray[800],
      focus: palette[400],
      error: commonSemanticColors.error.dark,
      success: commonSemanticColors.success.dark,
      warning: commonSemanticColors.warning.dark,
    },
    action: {
      primary: palette[400],
      secondary: withAlpha(palette[400], 20),
      tertiary: withAlpha(palette[400], 10),
      hover: palette[300],
      pressed: palette[200],
      disabled: gray[600],
      focus: withAlpha(palette[400], 20),
    },
    status: {
      error: commonSemanticColors.error.dark,
      warning: commonSemanticColors.warning.dark,
      success: commonSemanticColors.success.dark,
      info: commonSemanticColors.info.dark,
    },
    shadow: {
      small: withAlpha(neutralColors.black, 20),
      medium: withAlpha(neutralColors.black, 30),
      large: withAlpha(neutralColors.black, 50),
      colored: withAlpha(palette[400], 30),
    },
  };
};

/**
 * Create semantic colors for black mode (AMOLED friendly)
 */
export const createBlackModeColors = (colorName: ColorName): SemanticColors => {
  const palette = colorPalettes[colorName];
  const gray = colorPalettes.gray;

  return {
    background: {
      primary: neutralColors.black,
      secondary: gray[950],
      tertiary: gray[900],
      elevated: gray[950],
      overlay: withAlpha(neutralColors.black, 80),
    },
    surface: {
      primary: gray[950],
      secondary: gray[900],
      tertiary: gray[800],
      elevated: gray[900],
      overlay: withAlpha(neutralColors.black, 95),
    },
    text: {
      primary: gray[50],
      secondary: gray[200],
      tertiary: gray[400],
      disabled: gray[500],
      inverse: neutralColors.black,
    },
    border: {
      primary: gray[800],
      secondary: gray[900],
      focus: palette[300],
      error: commonSemanticColors.error.black,
      success: commonSemanticColors.success.black,
      warning: commonSemanticColors.warning.black,
    },
    action: {
      primary: palette[300],
      secondary: withAlpha(palette[300], 20),
      tertiary: withAlpha(palette[300], 10),
      hover: palette[200],
      pressed: palette[100],
      disabled: gray[700],
      focus: withAlpha(palette[300], 20),
    },
    status: {
      error: commonSemanticColors.error.black,
      warning: commonSemanticColors.warning.black,
      success: commonSemanticColors.success.black,
      info: commonSemanticColors.info.black,
    },
    shadow: {
      small: withAlpha(neutralColors.black, 30),
      medium: withAlpha(neutralColors.black, 40),
      large: withAlpha(neutralColors.black, 60),
      colored: withAlpha(palette[300], 20),
    },
  };
};

/**
 * Get semantic colors based on mode and color name
 */
export const getSemanticColors = (mode: ThemeMode, colorName: ColorName): SemanticColors => {
  switch (mode) {
    case 'light':
      return createLightModeColors(colorName);
    case 'dark':
      return createDarkModeColors(colorName);
    case 'black':
      return createBlackModeColors(colorName);
    default:
      return createLightModeColors(colorName);
  }
};

/**
 * Mode-specific adjustments for better accessibility
 */
export const modeAdjustments = {
  light: {
    shadowIntensity: 1,
    borderOpacity: 1,
    textContrast: 'high',
  },
  dark: {
    shadowIntensity: 1.5,
    borderOpacity: 0.8,
    textContrast: 'medium',
  },
  black: {
    shadowIntensity: 2,
    borderOpacity: 0.6,
    textContrast: 'high',
  },
} as const;

/**
 * Get contrast color for text on background
 */
export const getContrastColor = (backgroundColor: string, mode: ThemeMode): string => {
  // Simple logic - in a real implementation, you might want to use a more sophisticated algorithm
  switch (mode) {
    case 'light':
      return colorPalettes.gray[900];
    case 'dark':
      return colorPalettes.gray[100];
    case 'black':
      return colorPalettes.gray[50];
    default:
      return colorPalettes.gray[900];
  }
};