import { EditorUtils } from './EditorUtils';

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number | string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  fontVariant?: 'normal' | 'small-caps' | 'all-small-caps' | 'petite-caps' | 'all-petite-caps' | 'unicase' | 'titling-caps';
  letterSpacing?: number | string;
  lineHeight?: number | string;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width' | 'full-size-kana';
  textDecoration?: {
    line?: 'none' | 'underline' | 'overline' | 'line-through';
    color?: string;
    style?: 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy';
    thickness?: 'auto' | 'from-font' | string;
  };
  textShadow?: {
    offsetX: number;
    offsetY: number;
    blurRadius: number;
    color: string;
  }[];
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
  textIndent?: string | number;
  wordSpacing?: string | number;
  whiteSpace?: 'normal' | 'nowrap' | 'pre' | 'pre-wrap' | 'pre-line' | 'break-spaces';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  hyphens?: 'none' | 'manual' | 'auto';
  textOrientation?: 'mixed' | 'upright' | 'sideways' | 'sideways-right' | 'use-glyph-orientation';
  writingMode?: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr' | 'sideways-rl' | 'sideways-lr';
  direction?: 'ltr' | 'rtl';
}

export interface TextEffect {
  id: string;
  name: string;
  description: string;
  cssClass: string;
  styles: Partial<CSSStyleDeclaration>;
  preview?: string;
  category: 'basic' | 'shadow' | 'gradient' | 'glow' | 'animation' | '3d';
}

export class AdvancedTypographyEngine {
  private static readonly GOOGLE_FONTS_API = 'https://fonts.googleapis.com/css2';
  private static loadedFonts = new Set<string>();

  // Font Management
  static async loadGoogleFont(fontFamily: string, weights?: number[], styles?: string[]): Promise<void> {
    if (this.loadedFonts.has(fontFamily)) return;

    const weightParams = weights?.join(',') || '400';
    const styleParams = styles?.join(',') || 'normal';
    const fontUrl = `${this.GOOGLE_FONTS_API}?family=${encodeURIComponent(fontFamily)}:wght@${weightParams}&display=swap`;

    try {
      const link = document.createElement('link');
      link.href = fontUrl;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      
      this.loadedFonts.add(fontFamily);
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}:`, error);
    }
  }

  static async loadSystemFonts(): Promise<string[]> {
    // Get system fonts using CSS Font Loading API if available
    if ('fonts' in document) {
      try {
        const fonts = await (document as any).fonts.ready;
        return Array.from(fonts.values()).map((font: any) => font.family);
      } catch (error) {
        console.warn('Failed to load system fonts:', error);
      }
    }

    // Fallback to common system fonts
    return [
      'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
      'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Sans Unicode', 'Tahoma',
      'Lucida Console', 'Monaco', 'Menlo', 'Consolas', 'Inconsolata'
    ];
  }

  // Typography Analysis
  static analyzeTextReadability(element: HTMLElement): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const styles = window.getComputedStyle(element);
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Font size analysis
    const fontSize = parseFloat(styles.fontSize);
    if (fontSize < 14) {
      issues.push('Font size too small for comfortable reading');
      recommendations.push('Increase font size to at least 14px');
      score -= 20;
    }

    // Line height analysis
    const lineHeight = parseFloat(styles.lineHeight) / fontSize;
    if (lineHeight < 1.4) {
      issues.push('Line height too tight');
      recommendations.push('Increase line height to at least 1.4x font size');
      score -= 15;
    } else if (lineHeight > 1.8) {
      issues.push('Line height too loose');
      recommendations.push('Decrease line height to improve text flow');
      score -= 10;
    }

    // Contrast analysis (simplified)
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    if (color === backgroundColor) {
      issues.push('Poor color contrast');
      recommendations.push('Ensure sufficient contrast between text and background');
      score -= 30;
    }

    // Line length analysis
    const width = element.getBoundingClientRect().width;
    const charactersPerLine = Math.floor(width / (fontSize * 0.5)); // Rough estimate
    if (charactersPerLine > 80) {
      issues.push('Lines too long for comfortable reading');
      recommendations.push('Limit line length to 50-80 characters');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  // Text Effects
  static readonly TEXT_EFFECTS: TextEffect[] = [
    {
      id: 'simple-shadow',
      name: 'Simple Shadow',
      description: 'Basic drop shadow effect',
      category: 'shadow',
      cssClass: 'text-effect-simple-shadow',
      styles: {
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
      }
    },
    {
      id: 'glow-effect',
      name: 'Glow Effect',
      description: 'Soft glowing text',
      category: 'glow',
      cssClass: 'text-effect-glow',
      styles: {
        textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor'
      }
    },
    {
      id: 'gradient-text',
      name: 'Gradient Text',
      description: 'Gradient color fill',
      category: 'gradient',
      cssClass: 'text-effect-gradient',
      styles: {
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        webkitBackgroundClip: 'text',
        webkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }
    },
    {
      id: 'embossed',
      name: 'Embossed',
      description: '3D embossed appearance',
      category: '3d',
      cssClass: 'text-effect-embossed',
      styles: {
        color: '#ccc',
        textShadow: '-1px -1px 0px #fff, 1px 1px 0px #999'
      }
    },
    {
      id: 'neon-sign',
      name: 'Neon Sign',
      description: 'Retro neon sign effect',
      category: 'glow',
      cssClass: 'text-effect-neon',
      styles: {
        color: '#fff',
        textShadow: `
          0 0 5px currentColor,
          0 0 10px currentColor,
          0 0 20px currentColor,
          0 0 40px #ff00ff,
          0 0 80px #ff00ff,
          0 0 90px #ff00ff,
          0 0 100px #ff00ff,
          0 0 150px #ff00ff
        `
      }
    },
    {
      id: 'letterpress',
      name: 'Letterpress',
      description: 'Pressed into paper effect',
      category: '3d',
      cssClass: 'text-effect-letterpress',
      styles: {
        color: '#666',
        textShadow: '0px 1px 0px #999, 0px -1px 0px #fff'
      }
    }
  ];

  // Apply typography styles
  static applyTypography(element: HTMLElement, styles: TypographyStyle): void {
    if (!element) return;

    const cssStyles: Partial<CSSStyleDeclaration> = {};

    // Basic font properties
    if (styles.fontFamily) cssStyles.fontFamily = styles.fontFamily;
    if (styles.fontSize) cssStyles.fontSize = `${styles.fontSize}px`;
    if (styles.fontWeight) cssStyles.fontWeight = String(styles.fontWeight);
    if (styles.fontStyle) cssStyles.fontStyle = styles.fontStyle;
    if (styles.fontVariant) cssStyles.fontVariant = styles.fontVariant;

    // Spacing and layout
    if (styles.letterSpacing) cssStyles.letterSpacing = String(styles.letterSpacing);
    if (styles.lineHeight) cssStyles.lineHeight = String(styles.lineHeight);
    if (styles.wordSpacing) cssStyles.wordSpacing = String(styles.wordSpacing);
    if (styles.textIndent) cssStyles.textIndent = String(styles.textIndent);

    // Text transformation and alignment
    if (styles.textTransform) cssStyles.textTransform = styles.textTransform;
    if (styles.textAlign) cssStyles.textAlign = styles.textAlign;

    // Colors
    if (styles.color) cssStyles.color = styles.color;
    if (styles.backgroundColor) cssStyles.backgroundColor = styles.backgroundColor;

    // Text decoration
    if (styles.textDecoration) {
      const { line, color, style, thickness } = styles.textDecoration;
      let decoration = '';
      if (line) decoration += line;
      if (color) decoration += ` ${color}`;
      if (style) decoration += ` ${style}`;
      if (thickness) decoration += ` ${thickness}`;
      cssStyles.textDecoration = decoration.trim();
    }

    // Text shadow
    if (styles.textShadow && styles.textShadow.length > 0) {
      cssStyles.textShadow = styles.textShadow
        .map(shadow => `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blurRadius}px ${shadow.color}`)
        .join(', ');
    }

    // Advanced text properties
    if (styles.whiteSpace) cssStyles.whiteSpace = styles.whiteSpace;
    if (styles.wordBreak) cssStyles.wordBreak = styles.wordBreak;
    if (styles.hyphens) cssStyles.hyphens = styles.hyphens;
    if (styles.textOrientation) (cssStyles as any).textOrientation = styles.textOrientation;
    if (styles.writingMode) cssStyles.writingMode = styles.writingMode;
    if (styles.direction) cssStyles.direction = styles.direction;

    // Apply all styles
    Object.assign(element.style, cssStyles);
  }

  // Smart font pairing suggestions
  static getFontPairingSuggestions(primaryFont: string): string[] {
    const pairings: Record<string, string[]> = {
      'Helvetica': ['Georgia', 'Times New Roman', 'Playfair Display'],
      'Arial': ['Times New Roman', 'Georgia', 'Merriweather'],
      'Georgia': ['Helvetica', 'Arial', 'Open Sans'],
      'Times New Roman': ['Helvetica', 'Arial', 'Lato'],
      'Roboto': ['Roboto Slab', 'Playfair Display', 'Lora'],
      'Open Sans': ['Merriweather', 'Playfair Display', 'Lora'],
      'Lato': ['Merriweather', 'Playfair Display', 'Source Serif Pro'],
      'Montserrat': ['Merriweather', 'Crimson Text', 'Source Serif Pro']
    };

    return pairings[primaryFont] || ['Georgia', 'Times New Roman', 'Helvetica'];
  }

  // Generate typography scale
  static generateTypographyScale(baseSize: number = 16, ratio: number = 1.25): number[] {
    const scale: number[] = [];
    const steps = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
    
    steps.forEach(step => {
      scale.push(Math.round(baseSize * Math.pow(ratio, step)));
    });
    
    return scale;
  }

  // Text formatting utilities
  static formatText(text: string, options: {
    case?: 'upper' | 'lower' | 'title' | 'sentence';
    removeExtraSpaces?: boolean;
    addSmartQuotes?: boolean;
    addNonBreakingSpaces?: boolean;
  }): string {
    let formatted = text;

    // Remove extra spaces
    if (options.removeExtraSpaces) {
      formatted = formatted.replace(/\s+/g, ' ').trim();
    }

    // Case transformations
    switch (options.case) {
      case 'upper':
        formatted = formatted.toUpperCase();
        break;
      case 'lower':
        formatted = formatted.toLowerCase();
        break;
      case 'title':
        formatted = formatted.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'sentence':
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1).toLowerCase();
        break;
    }

    // Smart quotes
    if (options.addSmartQuotes) {
      formatted = formatted
        .replace(/"/g, '\u201C') // Left double quotation mark
        .replace(/"/g, '\u201D') // Right double quotation mark
        .replace(/'/g, '\u2018') // Left single quotation mark
        .replace(/'/g, '\u2019'); // Right single quotation mark
    }

    // Non-breaking spaces
    if (options.addNonBreakingSpaces) {
      formatted = formatted.replace(/ (\w{1,3}) /g, ' $1 '); // Add non-breaking spaces around short words
    }

    return formatted;
  }

  // Get optimal line length for readability
  static getOptimalLineLength(fontSize: number): { min: number; ideal: number; max: number } {
    const charWidth = fontSize * 0.5; // Approximate character width
    return {
      min: Math.floor(300 / charWidth), // ~45 characters
      ideal: Math.floor(450 / charWidth), // ~65 characters  
      max: Math.floor(550 / charWidth) // ~80 characters
    };
  }
}