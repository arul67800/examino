import React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface ContextMenuState {
  isVisible: boolean;
  position: Position;
  selectedCell: HTMLTableCellElement | null;
}

export interface TableContextMenuProps {
  isVisible: boolean;
  position: Position;
  onClose: () => void;
  selectedCell?: HTMLTableCellElement | null;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action?: () => void;
  submenu?: ContextMenuItem[];
  separator?: boolean;
  disabled?: boolean;
  color?: boolean;
}

export interface TableBorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  color: string;
}

export interface TableStyle {
  backgroundColor?: string;
  borderTop?: TableBorderStyle;
  borderRight?: TableBorderStyle;
  borderBottom?: TableBorderStyle;
  borderLeft?: TableBorderStyle;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface CellRange {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

export interface TableOperations {
  // Basic Operations
  findTable: () => HTMLTableElement | null;
  findCellPosition: (cell: HTMLTableCellElement) => { row: number; col: number };
  
  // Color Operations
  applyColorToElement: (element: HTMLElement, color: string, type: 'background' | 'text') => void;
  colorEntireHeader: (color: string) => void;
  colorEntireRow: (color: string) => void;
  colorAlternativeRows: (color: string) => void;
  colorAlternativeColumns: (color: string) => void;
  colorSelectedCells: (color: string, type: 'background' | 'text') => void;
  
  // Row Operations
  deleteRowAbove: () => void;
  deleteRowBelow: () => void;
  deleteCurrentRow: () => void;
  deleteSelectedRows: () => void;
  addRowAbove: () => void;
  addRowBelow: () => void;
  addMultipleRows: (count: number, position: 'above' | 'below') => void;
  duplicateRow: () => void;
  moveRowUp: () => void;
  moveRowDown: () => void;
  
  // Column Operations
  deleteColumnLeft: () => void;
  deleteColumnRight: () => void;
  deleteCurrentColumn: () => void;
  deleteSelectedColumns: () => void;
  addColumnLeft: () => void;
  addColumnRight: () => void;
  addMultipleColumns: (count: number, position: 'left' | 'right') => void;
  duplicateColumn: () => void;
  moveColumnLeft: () => void;
  moveColumnRight: () => void;
  
  // Cell Operations
  mergeCells: () => void;
  splitCell: (rows: number, cols: number) => void;
  mergeRight: () => void;
  mergeDown: () => void;
  clearCellContent: () => void;
  clearCellFormatting: () => void;
  
  // Selection Operations
  selectRow: () => void;
  selectColumn: () => void;
  selectTable: () => void;
  selectCellRange: (range: CellRange) => void;
  
  // Table Structure
  addHeaderRow: () => void;
  removeHeaderRow: () => void;
  addFooterRow: () => void;
  removeFooterRow: () => void;
  convertFirstRowToHeader: () => void;
  convertHeaderToRow: () => void;
  
  // Formatting
  applyTableStyle: (style: TableStyle) => void;
  setBorders: (style: TableBorderStyle, sides: ('top' | 'right' | 'bottom' | 'left')[]) => void;
  removeBorders: () => void;
  setTableAlignment: (alignment: 'left' | 'center' | 'right') => void;
  setCellAlignment: (horizontal: 'left' | 'center' | 'right', vertical: 'top' | 'middle' | 'bottom') => void;
  setCellPadding: (padding: number) => void;
  setColumnWidth: (width: number | 'auto') => void;
  setRowHeight: (height: number | 'auto') => void;
  
  // Table Properties
  setTableWidth: (width: number | 'auto' | string) => void;
  setTableCaption: (caption: string) => void;
  removeTableCaption: () => void;
  setTableSummary: (summary: string) => void;
  
  // Data Operations
  sortTableByColumn: (columnIndex: number, ascending: boolean) => void;
  filterTable: (columnIndex: number, filterValue: string) => void;
  clearFilter: () => void;
  
  // Conversion
  convertTableToText: (delimiter: string) => string;
  convertTextToTable: (text: string, delimiter: string, rows: number, cols: number) => void;
  
  // Advanced Features
  insertFormula: (formula: string) => void;
  calculateSum: (range: CellRange) => number;
  calculateAverage: (range: CellRange) => number;
  autoFitColumns: () => void;
  autoFitTable: () => void;
  distributeRowsEvenly: () => void;
  distributeColumnsEvenly: () => void;
  
  // Table Styles & Themes
  applyTableTheme: (theme: 'light' | 'dark' | 'colorful' | 'minimal' | 'professional') => void;
  toggleAlternatingRowColors: () => void;
  toggleAlternatingColumnColors: () => void;
  
  // Import/Export
  exportTableAsCSV: () => string;
  exportTableAsJSON: () => string;
  importFromCSV: (csvData: string) => void;
  
  // Accessibility
  setTableHeaders: (type: 'row' | 'column' | 'both') => void;
  addTableScope: () => void;
  setTableRole: (role: string) => void;
}

export type TableTheme = 'light' | 'dark' | 'colorful' | 'minimal' | 'professional' | 'grid' | 'striped' | 'bordered';

export type BorderSide = 'top' | 'right' | 'bottom' | 'left' | 'all' | 'inside' | 'outside';