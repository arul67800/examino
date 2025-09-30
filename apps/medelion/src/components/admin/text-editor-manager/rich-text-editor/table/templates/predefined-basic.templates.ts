import { TableTemplate, TemplateCategory, TemplateSize, TemplateComplexity } from '../types/template.types';
import { CellDataType } from '../types/table.types';

// Basic Templates
export const basicTableTemplate: TableTemplate = {
  id: 'basic-table',
  name: 'Basic Table',
  description: 'A simple table for general data entry and display',
  category: 'business' as TemplateCategory,
  tags: ['basic', 'simple', 'data'],
  size: 'small' as TemplateSize,
  complexity: 'simple' as TemplateComplexity,
  
  thumbnail: '/templates/basic-table.png',
  icon: 'Table',
  color: '#3B82F6',
  
  dimensions: {
    rows: 5,
    columns: 4,
    minRows: 2,
    maxRows: 1000,
    minColumns: 2,
    maxColumns: 50
  },
  
  columns: [
    {
      name: 'ID',
      type: 'number' as CellDataType,
      width: 80,
      format: { type: 'number', number: { style: 'decimal' } },
      validation: { rules: [{ type: 'required', message: 'ID is required', severity: 'error', rule: {} }] },
      unique: true,
      autoIncrement: true
    },
    {
      name: 'Name',
      type: 'text' as CellDataType,
      width: 150,
      format: { type: 'text', text: { case: 'title' } },
      validation: { rules: [{ type: 'required', message: 'Name is required', severity: 'error', rule: {} }] },
      required: true
    },
    {
      name: 'Category',
      type: 'text' as CellDataType,
      width: 120,
      format: { type: 'text' }
    },
    {
      name: 'Status',
      type: 'text' as CellDataType,
      width: 100,
      format: { type: 'text' }
    }
  ],
  
  style: {
    table: {
      backgroundColor: '#FFFFFF',
      borders: {
        outer: { width: 1, style: 'solid', color: '#E5E7EB' }
      }
    },
    header: {
      backgroundColor: '#F9FAFB',
      fontWeight: 'bold',
      borders: {
        bottom: { width: 2, style: 'solid', color: '#D1D5DB' }
      }
    },
    body: {
      backgroundColor: '#FFFFFF'
    },
    alternateRows: {
      backgroundColor: '#F9FAFB'
    }
  },
  
  settings: {
    showHeaders: true,
    showRowNumbers: true,
    alternateRowColors: true,
    sortable: true,
    filterable: true,
    resizable: true,
    selectable: 'multiple'
  },
  
  data: {
    sampleRows: [
      [1, 'Sample Item 1', 'Category A', 'Active'],
      [2, 'Sample Item 2', 'Category B', 'Inactive'],
      [3, 'Sample Item 3', 'Category A', 'Pending']
    ]
  },
  
  metadata: {
    author: 'Examino Team',
    version: '1.0.0',
    created: new Date('2024-01-01'),
    updated: new Date('2024-01-01'),
    license: 'MIT',
    popularity: 95,
    rating: 4.8,
    featured: true
  },
  
  features: {
    formulas: false,
    validation: true,
    charts: false,
    filters: true,
    sorting: true,
    grouping: false,
    pivoting: false,
    conditional: false,
    automation: false,
    collaboration: false
  },
  
  customizable: {
    columns: true,
    rows: true,
    styling: true,
    validation: true,
    formulas: false,
    data: true
  }
};

// Export all templates
export const predefinedTemplates: TableTemplate[] = [
  basicTableTemplate
];