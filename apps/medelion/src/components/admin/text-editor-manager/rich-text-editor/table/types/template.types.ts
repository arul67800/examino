import { AdvancedTableData, CellStyle, TableSettings } from './table.types';
import { CellFormat } from './format.types';
import { CellValidation } from './validation.types';

export type TemplateCategory = 'business' | 'financial' | 'academic' | 'personal' | 'project' | 'data' | 'report' | 'form' | 'schedule' | 'inventory' | 'custom';
export type TemplateSize = 'small' | 'medium' | 'large' | 'extra-large' | 'custom';
export type TemplateComplexity = 'simple' | 'intermediate' | 'advanced' | 'expert';

export interface TemplateColumnConfig {
  name: string;
  type: string;
  width?: number;
  format?: CellFormat;
  validation?: CellValidation;
  style?: CellStyle;
  required?: boolean;
  unique?: boolean;
  defaultValue?: any;
  description?: string;
  tooltip?: string;
  placeholder?: string;
}

export interface TemplateRowConfig {
  type?: 'header' | 'data' | 'footer' | 'group' | 'summary';
  style?: CellStyle;
  height?: number;
  cells?: { [columnIndex: number]: any };
  required?: boolean;
  description?: string;
}

export interface TemplateStyle {
  table?: CellStyle;
  header?: CellStyle;
  body?: CellStyle;
  footer?: CellStyle;
  alternateRows?: CellStyle;
  selectedCell?: CellStyle;
  hoveredCell?: CellStyle;
  errorCell?: CellStyle;
  warningCell?: CellStyle;
  requiredCell?: CellStyle;
  readonlyCell?: CellStyle;
  customStyles?: { [key: string]: CellStyle };
}

export interface TemplateFormulas {
  [cellReference: string]: string;
}

export interface TemplateValidation {
  [columnId: string]: CellValidation;
}

export interface TemplateData {
  sampleRows?: any[][];
  headers?: string[];
  formulas?: TemplateFormulas;
  mockData?: {
    rowCount: number;
    generateFunction?: (rowIndex: number, columnIndex: number, columnConfig: TemplateColumnConfig) => any;
  };
}

export interface TableTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  size: TemplateSize;
  complexity: TemplateComplexity;
  
  // Visual
  thumbnail?: string;
  icon?: string;
  color?: string;
  
  // Structure
  dimensions: {
    rows: number;
    columns: number;
    minRows?: number;
    maxRows?: number;
    minColumns?: number;
    maxColumns?: number;
  };
  
  columns: TemplateColumnConfig[];
  rows?: TemplateRowConfig[];
  
  // Styling
  style: TemplateStyle;
  
  // Configuration
  settings: Partial<TableSettings>;
  validation?: TemplateValidation;
  data?: TemplateData;
  
  // Metadata
  metadata: {
    author?: string;
    version: string;
    created: Date;
    updated: Date;
    license?: string;
    source?: string;
    popularity?: number;
    rating?: number;
    downloads?: number;
    featured?: boolean;
    premium?: boolean;
  };
  
  // Features
  features: {
    formulas: boolean;
    validation: boolean;
    charts: boolean;
    filters: boolean;
    sorting: boolean;
    grouping: boolean;
    pivoting: boolean;
    conditional: boolean;
    automation: boolean;
    collaboration: boolean;
  };
  
  // Customization
  customizable: {
    columns: boolean;
    rows: boolean;
    styling: boolean;
    validation: boolean;
    formulas: boolean;
    data: boolean;
  };
  
  // Documentation
  documentation?: {
    description: string;
    instructions: string[];
    examples: string[];
    tips: string[];
    warnings: string[];
    videoUrl?: string;
    helpUrl?: string;
  };
}

export interface TemplateLibrary {
  templates: TableTemplate[];
  categories: Array<{
    id: TemplateCategory;
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
  }>;
  featured: string[];
  popular: string[];
  recent: string[];
  favorites: string[];
  custom: string[];
}

export interface TemplateFilters {
  category?: TemplateCategory[];
  size?: TemplateSize[];
  complexity?: TemplateComplexity[];
  features?: string[];
  tags?: string[];
  author?: string;
  rating?: { min: number; max: number };
  popular?: boolean;
  featured?: boolean;
  premium?: boolean;
  customizable?: boolean;
  search?: string;
}

export interface TemplatePreview {
  template: TableTemplate;
  data: AdvancedTableData;
  rendered: boolean;
  loading: boolean;
  error?: string;
}

export interface TemplateCustomization {
  templateId: string;
  customizations: {
    name?: string;
    description?: string;
    dimensions?: { rows: number; columns: number };
    columns?: Partial<TemplateColumnConfig>[];
    style?: Partial<TemplateStyle>;
    settings?: Partial<TableSettings>;
    data?: Partial<TemplateData>;
  };
  preview: boolean;
  applied: boolean;
}

export interface TemplateBuilder {
  current: Partial<TableTemplate>;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    completed: boolean;
    required: boolean;
    component: string;
  }>;
  currentStep: number;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateExport {
  template: TableTemplate;
  format: 'json' | 'xlsx' | 'csv' | 'sql' | 'xml' | 'yaml';
  options: {
    includeData: boolean;
    includeStyle: boolean;
    includeValidation: boolean;
    includeFormulas: boolean;
    includeMetadata: boolean;
    compression: boolean;
    encryption: boolean;
  };
}

export interface TemplateImport {
  file: File;
  format: 'json' | 'xlsx' | 'csv' | 'sql' | 'xml' | 'yaml';
  options: {
    detectHeaders: boolean;
    inferTypes: boolean;
    parseFormulas: boolean;
    preserveStyle: boolean;
    validateData: boolean;
    preview: boolean;
  };
  result?: {
    template: Partial<TableTemplate>;
    errors: string[];
    warnings: string[];
    preview: AdvancedTableData;
  };
}