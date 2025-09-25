/**
 * Theme Context and Provider
 * React context for managing theme state with persistence
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { 
  Theme, 
  ThemeContextValue, 
  ColorName, 
  ThemeMode, 
  Direction,
  ThemeConfig
} from './types';
import { createTheme, getNextMode, getOppositeDirection } from './factory';

const THEME_STORAGE_KEY = 'medelion-theme';

/**
 * Theme Context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Default theme configuration
 */
const defaultConfig: ThemeConfig = {
  colorName: 'green',
  mode: 'black',
  direction: 'ltr',
};

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultColorName?: ColorName;
  defaultMode?: ThemeMode;
  defaultDirection?: Direction;
  storageKey?: string;
  enableSystemModeDetection?: boolean;
  enableDirectionDetection?: boolean;
}

/**
 * Detect system preference for dark mode
 */
const getSystemMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

/**
 * Detect system preference for direction
 */
const getSystemDirection = (): Direction => {
  if (typeof window === 'undefined') return 'ltr';
  
  const htmlDir = document.documentElement.dir;
  const bodyDir = document.body.dir;
  
  if (htmlDir === 'rtl' || bodyDir === 'rtl') return 'rtl';
  
  // Check for RTL languages
  const lang = navigator.language || document.documentElement.lang;
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ku', 'dv'];
  const isRTL = rtlLanguages.some(rtlLang => lang.startsWith(rtlLang));
  
  return isRTL ? 'rtl' : 'ltr';
};

/**
 * Load theme from storage
 */
const loadThemeFromStorage = (storageKey: string): Partial<ThemeConfig> | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/**
 * Save theme to storage
 */
const saveThemeToStorage = (storageKey: string, config: ThemeConfig): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(config));
  } catch {
    // Storage might be unavailable
  }
};

/**
 * Theme Provider Component
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultColorName = 'green',
  defaultMode = 'black',
  defaultDirection = 'ltr',
  storageKey = THEME_STORAGE_KEY,
  enableSystemModeDetection = true,
  enableDirectionDetection = true,
}) => {
  // Initialize state with defaults
  const [colorName, setColorNameState] = useState<ColorName>(defaultColorName);
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [direction, setDirectionState] = useState<Direction>(defaultDirection);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme from storage and system preferences
  useEffect(() => {
    const stored = loadThemeFromStorage(storageKey);
    
    let initialColorName = defaultColorName;
    let initialMode = defaultMode;
    let initialDirection = defaultDirection;
    
    // Load from storage if available
    if (stored) {
      initialColorName = stored.colorName || initialColorName;
      initialMode = stored.mode || initialMode;
      initialDirection = stored.direction || initialDirection;
    } else {
      // Only use system preferences if explicitly enabled and no defaults provided
      if (enableSystemModeDetection && defaultMode === 'light') {
        initialMode = getSystemMode();
      }
      if (enableDirectionDetection && defaultDirection === 'ltr') {
        initialDirection = getSystemDirection();
      }
    }
    
    setColorNameState(initialColorName);
    setModeState(initialMode);
    setDirectionState(initialDirection);
    setIsInitialized(true);
  }, [
    defaultColorName, 
    defaultMode, 
    defaultDirection, 
    storageKey, 
    enableSystemModeDetection, 
    enableDirectionDetection
  ]);

  // Listen for system mode changes (only if enabled and no stored preference)
  useEffect(() => {
    if (!enableSystemModeDetection || typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no stored preference exists and system detection is explicitly enabled
      const stored = loadThemeFromStorage(storageKey);
      if (!stored?.mode && enableSystemModeDetection && defaultMode === 'light') {
        setModeState(e.matches ? 'dark' : 'light');
      }
    };
    
    // Don't add listener if system detection is disabled
    if (enableSystemModeDetection) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [enableSystemModeDetection, storageKey, defaultMode]);

  // Save to storage when theme changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const config: ThemeConfig = { colorName, mode, direction };
    saveThemeToStorage(storageKey, config);
  }, [colorName, mode, direction, storageKey, isInitialized]);

  // Update document attributes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    document.documentElement.setAttribute('data-theme-mode', mode);
    document.documentElement.setAttribute('data-theme-color', colorName);
    document.documentElement.setAttribute('dir', direction);
    
    // Add CSS class for easier styling
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, '')
      .replace(/mode-\w+/g, '')
      .replace(/dir-\w+/g, '') + 
      ` theme-${colorName} mode-${mode} dir-${direction}`.trim();
  }, [mode, colorName, direction]);

  // Create current theme
  const theme = React.useMemo(() => {
    return createTheme({ colorName, mode, direction });
  }, [colorName, mode, direction]);

  // Theme manipulation functions
  const setColorName = useCallback((newColorName: ColorName) => {
    setColorNameState(newColorName);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    setDirectionState(newDirection);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState(currentMode => getNextMode(currentMode));
  }, []);

  const toggleDirection = useCallback(() => {
    setDirectionState(currentDirection => getOppositeDirection(currentDirection));
  }, []);

  // Context value
  const contextValue: ThemeContextValue = {
    theme,
    colorName,
    mode,
    direction,
    setColorName,
    setMode,
    setDirection,
    toggleMode,
    toggleDirection,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook to get current theme object only
 */
export const useThemeObject = (): Theme => {
  return useTheme().theme;
};

/**
 * Hook to get theme colors
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook to get semantic colors
 */
export const useSemanticColors = () => {
  const { theme } = useTheme();
  return theme.colors.semantic;
};

/**
 * Hook to get raw color palettes
 */
export const useRawColors = () => {
  const { theme } = useTheme();
  return theme.colors.raw;
};

/**
 * Hook to get typography system
 */
export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook to get spacing system
 */
export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

/**
 * Hook for conditional rendering based on theme mode
 */
export const useThemeMode = () => {
  const { mode } = useTheme();
  
  return {
    mode,
    isLight: mode === 'light',
    isDark: mode === 'dark',
    isBlack: mode === 'black',
    isDarkMode: mode === 'dark' || mode === 'black',
  };
};

/**
 * Hook for conditional rendering based on direction
 */
export const useDirection = () => {
  const { direction } = useTheme();
  
  return {
    direction,
    isLTR: direction === 'ltr',
    isRTL: direction === 'rtl',
  };
};