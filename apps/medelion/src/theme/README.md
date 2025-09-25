# Medelion Theme System

A comprehensive, type-safe theme system for React applications with support for:

- **Multiple Color Themes**: Green, Blue, Pink, Orange, Red, Gray
- **Three Display Modes**: Light, Dark, Black (AMOLED-friendly)
- **Full Directional Support**: LTR and RTL layouts
- **CSS Variables Integration**: Seamless CSS-in-JS and traditional CSS support
- **Type Safety**: Complete TypeScript support throughout

## Quick Start

### 1. Basic Setup

Wrap your app with the `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/theme';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Using Theme in Components

Access theme colors without conditional checks:

```tsx
import { useTheme } from '@/theme';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: theme.colors.semantic.background.primary,
        color: theme.colors.semantic.text.primary,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.lg,
      }}
    >
      This automatically adapts to all theme modes!
    </div>
  );
}
```

### 3. Theme Controls

```tsx
import { useTheme } from '@/theme';

function ThemeControls() {
  const { 
    colorName, 
    mode, 
    direction, 
    setColorName, 
    toggleMode, 
    toggleDirection 
  } = useTheme();

  return (
    <div>
      <button onClick={() => setColorName('blue')}>Blue Theme</button>
      <button onClick={() => setColorName('green')}>Green Theme</button>
      <button onClick={toggleMode}>
        Current: {mode} (Click to cycle)
      </button>
      <button onClick={toggleDirection}>
        Direction: {direction}
      </button>
    </div>
  );
}
```

## Advanced Usage

### CSS Variables Integration

The theme system automatically generates CSS custom properties:

```css
/* These variables are automatically available */
.my-element {
  background-color: var(--colors-semantic-background-primary);
  color: var(--colors-semantic-text-primary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
}
```

### Directional Styling (RTL Support)

Use directional utilities for RTL-aware layouts:

```tsx
import { useDirectionalStyles } from '@/theme';

function DirectionalComponent() {
  const { directional } = useDirectionalStyles();
  
  const styles = directional({
    marginStart: '16px', // Automatically becomes marginLeft (LTR) or marginRight (RTL)
    textAlign: 'left',   // Automatically flips for RTL
  });
  
  return <div style={styles}>Directional content</div>;
}
```

### Multiple Theme Hooks

```tsx
import { 
  useThemeColor,
  useThemeStyles, 
  usePrimaryColor,
  useBreakpoints,
  useConditionalStyles
} from '@/theme';

function AdvancedComponent() {
  // Get specific colors
  const bgColor = useThemeColor('colors.semantic.background.primary');
  const primaryColor = usePrimaryColor();
  
  // Responsive breakpoints
  const { up, down } = useBreakpoints();
  
  // Theme-aware styles
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.semantic.surface.primary,
      [up('md')]: {
        padding: theme.spacing[8],
      },
      [down('sm')]: {
        padding: theme.spacing[4],
      },
    },
  }));
  
  // Conditional styles based on theme state
  const conditionalStyles = useConditionalStyles({
    light: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    dark: { boxShadow: '0 2px 4px rgba(0,0,0,0.3)' },
    rtl: { textAlign: 'right' },
  });
  
  return (
    <div style={{ ...styles.container, ...conditionalStyles }}>
      Advanced themed component
    </div>
  );
}
```

## Theme Configuration

### Custom Theme Provider Setup

```tsx
import { ThemeProvider } from '@/theme';

function App() {
  return (
    <ThemeProvider
      defaultColorName="green"
      defaultMode="dark"
      defaultDirection="ltr"
      enableSystemModeDetection={true}
      enableDirectionDetection={true}
      storageKey="my-app-theme"
    >
      <YourApp />
    </ThemeProvider>
  );
}
```

### Generating Complete CSS

For traditional CSS workflows, generate complete theme CSS:

```tsx
import { generateCompleteThemeCSS } from '@/theme';

// Generate CSS string with all themes, utilities, and directional support
const themeCSS = generateCompleteThemeCSS();

// Save to file or inject into document
```

## Available Color Themes

- **Green**: Nature-inspired green palette
- **Blue**: Classic blue palette (default)
- **Pink**: Warm pink palette
- **Orange**: Vibrant orange palette  
- **Red**: Bold red palette
- **Gray**: Neutral gray palette

## Display Modes

- **Light**: Standard light mode with white backgrounds
- **Dark**: Dark mode with gray backgrounds
- **Black**: AMOLED-friendly pure black mode

## Semantic Color System

All colors are accessed through semantic names that automatically adapt:

- `background.primary` - Main background color
- `background.secondary` - Secondary background
- `text.primary` - Main text color
- `text.secondary` - Secondary text color
- `action.primary` - Primary action color (buttons, links)
- `border.primary` - Border colors
- `status.error/warning/success/info` - Status colors

## TypeScript Support

Full type safety with IntelliSense support:

```tsx
import type { Theme, ColorName, ThemeMode } from '@/theme';

// All theme properties are fully typed
const theme: Theme = createTheme({
  colorName: 'blue', // ✅ Autocomplete available
  mode: 'dark',      // ✅ Autocomplete available
  direction: 'ltr',  // ✅ Autocomplete available
});
```

## Utility Classes

The system generates utility classes for traditional CSS:

```html
<!-- Background colors -->
<div class="bg-primary">Primary background</div>
<div class="surface-elevated">Elevated surface</div>

<!-- Text colors -->
<p class="text-primary">Primary text</p>
<p class="text-secondary">Secondary text</p>

<!-- Directional utilities -->
<div class="ms-4 pe-2">Margin start 4, padding end 2</div>

<!-- Theme transitions -->
<div class="theme-transition">Smooth theme changes</div>
```

## Best Practices

1. **Always use semantic colors** instead of raw color values
2. **Use directional properties** (`marginStart`/`marginEnd`) instead of `marginLeft`/`marginRight`
3. **Leverage the spacing system** instead of hardcoded values
4. **Use theme-aware breakpoints** for responsive design
5. **Apply transitions** for smooth theme switching

## Examples

### Button Component

```tsx
import { useTheme, useDirectionalStyles } from '@/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

function Button({ variant = 'primary', children }: ButtonProps) {
  const { theme } = useTheme();
  const { directional } = useDirectionalStyles();
  
  const baseStyles = {
    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    fontFamily: theme.typography.fontFamily.sans,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer',
    transition: `all ${theme.transitions.duration.normal} ${theme.transitions.timing.ease}`,
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.semantic.action.primary,
      color: theme.colors.semantic.text.inverse,
    },
    secondary: {
      backgroundColor: theme.colors.semantic.action.secondary,
      color: theme.colors.semantic.text.primary,
      border: `1px solid ${theme.colors.semantic.border.primary}`,
    },
  };
  
  const directionalStyles = directional({
    textAlign: 'left' as const,
  });
  
  return (
    <button 
      style={{
        ...baseStyles,
        ...variantStyles[variant],
        ...directionalStyles,
      }}
    >
      {children}
    </button>
  );
}
```

This theme system provides a complete, production-ready solution for theming React applications with comprehensive feature support and excellent developer experience.