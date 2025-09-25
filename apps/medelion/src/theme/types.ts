/**
 * Theme Types and Interfaces
 * Comprehensive type definitions for the theme system
 */

export type ColorName = 'green' | 'blue' | 'pink' | 'orange' | 'red' | 'gray';
export type ThemeMode = 'light' | 'dark' | 'black';
export type Direction = 'ltr' | 'rtl';

/**
 * Color shade variations for each color
 */
export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;  // Primary shade
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

/**
 * Semantic color mappings based on mode
 */
export interface SemanticColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };
  action: {
    primary: string;
    secondary: string;
    tertiary: string;
    hover: string;
    pressed: string;
    disabled: string;
    focus: string;
  };
  status: {
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  shadow: {
    small: string;
    medium: string;
    large: string;
    colored: string;
  };
}

/**
 * Typography system
 */
export interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

/**
 * Spacing system
 */
export interface Spacing {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

/**
 * Breakpoint system
 */
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/**
 * Border radius system
 */
export interface BorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/**
 * Shadow system
 */
export interface Shadows {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

/**
 * Animation and transition system
 */
export interface Transitions {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    linear: string;
  };
}

/**
 * Z-index system
 */
export interface ZIndex {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
}

/**
 * Complete theme structure
 */
export interface Theme {
  mode: ThemeMode;
  colorName: ColorName;
  direction: Direction;
  colors: {
    raw: Record<ColorName, ColorShades>;
    semantic: SemanticColors;
  };
  typography: Typography;
  spacing: Spacing;
  breakpoints: Breakpoints;
  borderRadius: BorderRadius;
  shadows: Shadows;
  transitions: Transitions;
  zIndex: ZIndex;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  colorName: ColorName;
  mode: ThemeMode;
  direction: Direction;
  customColors?: Partial<Record<ColorName, Partial<ColorShades>>>;
  customSemanticColors?: Partial<SemanticColors>;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  theme: Theme;
  colorName: ColorName;
  mode: ThemeMode;
  direction: Direction;
  setColorName: (color: ColorName) => void;
  setMode: (mode: ThemeMode) => void;
  setDirection: (direction: Direction) => void;
  toggleMode: () => void;
  toggleDirection: () => void;
}

/**
 * CSS custom properties mapping
 */
export type CSSCustomProperties = Record<string, string>;

/**
 * Direction-aware CSS properties
 */
export interface DirectionalStyles {
  marginStart: string;
  marginEnd: string;
  paddingStart: string;
  paddingEnd: string;
  borderStartWidth: string;
  borderEndWidth: string;
  borderStartColor: string;
  borderEndColor: string;
  borderStartStyle: string;
  borderEndStyle: string;
  left: string;
  right: string;
  textAlign: 'left' | 'right' | 'center';
}