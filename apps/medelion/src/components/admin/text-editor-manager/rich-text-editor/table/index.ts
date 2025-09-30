// Type exports
export * from './types';

// Component exports
export * from './components';

// Context exports - using direct import to avoid any module resolution issues
export { 
  TableProvider, 
  useTable, 
  TableContext,
  createInitialTableState,
  tableReducer
} from './context/TableContext';

// Template exports
export { predefinedTemplates } from './templates/predefined-basic.templates';

// Utility exports
export { 
  createEmptyTable, 
  tableToCSV, 
  tableToJSON, 
  validateCell, 
  formatCellValue,
  parseCSV,
  updateCellContent,
  applyCellStyle,
  insertRow,
  insertColumn,
  deleteRow,
  deleteColumn,
  getCellsInRange,
  generateCellId,
  parseCellId,
  generateRowId,
  generateColumnId
} from './utils/table.utils';

// Hook exports
export { useTableIntegration } from './hooks/useTableIntegration';

// Main component exports
export { AdvancedTableEditor } from './components/AdvancedTableEditor';
export { InsertMenu } from './components/InsertMenu';
export { TableGrid, TableToolbar, FormattingPanel, TableSettingsPanel } from './components';

// Integration component
export { WordTableIntegration, useSimpleTableIntegration } from './WordTableIntegration';