export type FormatType = 'text' | 'number' | 'currency' | 'percentage' | 'date' | 'time' | 'datetime' | 'boolean' | 'email' | 'phone' | 'url' | 'color' | 'custom';
export type NumberFormatStyle = 'decimal' | 'currency' | 'percent' | 'scientific' | 'engineering' | 'compact';
export type DateFormatStyle = 'full' | 'long' | 'medium' | 'short';
export type TimeFormatStyle = 'full' | 'long' | 'medium' | 'short';

export interface NumberFormat {
  style: NumberFormatStyle;
  currency?: string;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  useGrouping?: boolean;
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
  roundingMode?: 'ceil' | 'floor' | 'expand' | 'trunc' | 'halfCeil' | 'halfFloor' | 'halfExpand' | 'halfTrunc' | 'halfEven';
  roundingPriority?: 'auto' | 'morePrecision' | 'lessPrecision';
  roundingIncrement?: number;
  trailingZeroDisplay?: 'auto' | 'stripIfInteger';
}

export interface DateFormat {
  dateStyle?: DateFormatStyle;
  timeStyle?: TimeFormatStyle;
  weekday?: 'narrow' | 'short' | 'long';
  era?: 'narrow' | 'short' | 'long';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  fractionalSecondDigits?: 0 | 1 | 2 | 3;
  timeZoneName?: 'short' | 'long' | 'shortOffset' | 'longOffset' | 'shortGeneric' | 'longGeneric';
  timeZone?: string;
  hour12?: boolean;
  hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
  formatMatcher?: 'basic' | 'best fit';
  calendar?: string;
  numberingSystem?: string;
  localeMatcher?: 'lookup' | 'best fit';
}

export interface TextFormat {
  case?: 'lower' | 'upper' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab';
  trim?: boolean;
  truncate?: {
    length: number;
    omission?: string;
    position?: 'start' | 'middle' | 'end';
  };
  mask?: {
    pattern: string;
    placeholder?: string;
    showMask?: boolean;
  };
  prefix?: string;
  suffix?: string;
  padding?: {
    length: number;
    character?: string;
    position?: 'start' | 'end';
  };
  wrap?: {
    length: number;
    break?: boolean;
    hyphenate?: boolean;
  };
}

export interface BooleanFormat {
  trueText?: string;
  falseText?: string;
  nullText?: string;
  icon?: {
    true?: string;
    false?: string;
    null?: string;
  };
  color?: {
    true?: string;
    false?: string;
    null?: string;
  };
  style?: 'text' | 'icon' | 'checkbox' | 'toggle' | 'chip' | 'badge';
}

export interface ColorFormat {
  format: 'hex' | 'rgb' | 'rgba' | 'hsl' | 'hsla' | 'hwb' | 'lab' | 'lch' | 'oklab' | 'oklch';
  alpha?: boolean;
  uppercase?: boolean;
  compress?: boolean;
  showSwatch?: boolean;
  swatchSize?: number;
  showText?: boolean;
}

export interface CustomFormat {
  pattern: string;
  formatter: (value: any, format?: any, locale?: string) => string;
  parser?: (text: string, format?: any, locale?: string) => any;
  validator?: (value: any, format?: any) => boolean;
  placeholder?: string;
  description?: string;
  examples?: string[];
}

export interface CellFormat {
  type: FormatType;
  locale?: string;
  timezone?: string;
  number?: NumberFormat;
  date?: DateFormat;
  text?: TextFormat;
  boolean?: BooleanFormat;
  color?: ColorFormat;
  custom?: CustomFormat;
  conditional?: Array<{
    condition: (value: any, row: any, table: any) => boolean;
    format: CellFormat;
  }>;
  preview?: boolean;
  editable?: boolean;
  copyFormatting?: boolean;
}

export interface FormatPreset {
  id: string;
  name: string;
  description?: string;
  category: string;
  format: CellFormat;
  icon?: string;
  preview?: string;
  popular?: boolean;
  custom?: boolean;
}

export interface FormatLibrary {
  presets: FormatPreset[];
  categories: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    order: number;
  }>;
  recent: string[];
  favorites: string[];
  custom: FormatPreset[];
}

export interface FormatOptions {
  showPreview: boolean;
  showDescription: boolean;
  showExamples: boolean;
  allowCustom: boolean;
  recentCount: number;
  searchable: boolean;
  categories: boolean;
  favorites: boolean;
  autoApply: boolean;
  inheritFromColumn: boolean;
  inheritFromRow: boolean;
  inheritFromTable: boolean;
}