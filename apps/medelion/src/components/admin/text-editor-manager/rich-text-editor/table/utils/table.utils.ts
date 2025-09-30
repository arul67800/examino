import { AdvancedTableData, TableCell, TableColumn, TableRow, CellStyle } from '../types/table.types';
import { CellFormat } from '../types/format.types';
import { ValidationResult } from '../types/validation.types';

// Cell ID utilities
export const generateCellId = (rowId: string, columnId: string): string => {
  return `cell-${rowId}-${columnId}`;
};

export const parseCellId = (cellId: string): { rowId: string; columnId: string } => {
  const parts = cellId.split('-');
  if (parts.length !== 3 || parts[0] !== 'cell') {
    throw new Error(`Invalid cell ID format: ${cellId}`);
  }
  return { rowId: parts[1], columnId: parts[2] };
};

export const generateRowId = (): string => {
  return `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateColumnId = (): string => {
  return `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Table data utilities
export const createEmptyTable = (rows: number = 5, columns: number = 4): AdvancedTableData => {
  const tableId = `table-${Date.now()}`;
  const columnData: TableColumn[] = [];
  const rowData: TableRow[] = [];

  // Create columns
  for (let i = 0; i < columns; i++) {
    const columnId = generateColumnId();
    columnData.push({
      id: columnId,
      name: `Column ${String.fromCharCode(65 + i)}`, // A, B, C, etc.
      type: 'text',
      width: 120,
      sortable: true,
      filterable: true,
      resizable: true,
      reorderable: true,
      hideable: true,
      pinnable: false
    });
  }

  // Create rows
  for (let i = 0; i < rows; i++) {
    const rowId = generateRowId();
    const cells: { [columnId: string]: TableCell } = {};

    columnData.forEach(column => {
      const cellId = generateCellId(rowId, column.id);
      cells[column.id] = {
        id: cellId,
        content: '',
        type: column.type,
        metadata: {
          id: cellId,
          created: new Date(),
          updated: new Date()
        }
      };
    });

    rowData.push({
      id: rowId,
      cells,
      metadata: {
        created: new Date(),
        updated: new Date()
      }
    });
  }

  return {
    id: tableId,
    columns: columnData,
    rows: rowData,
    metadata: {
      id: tableId,
      title: 'New Table',
      created: new Date(),
      updated: new Date(),
      version: 1
    },
    settings: {
      showHeaders: true,
      showFooters: false,
      showRowNumbers: true,
      showColumnLetters: false,
      showGridLines: true,
      showHoverEffects: true,
      showSelectionIndicators: true,
      alternateRowColors: true,
      sortable: true,
      filterable: true,
      resizable: true,
      reorderable: true,
      selectable: 'multiple',
      editable: true,
      virtualScrolling: false,
      lazyLoading: false,
      defaultRowHeight: 32,
      defaultColumnWidth: 120,
      minRowHeight: 24,
      minColumnWidth: 50,
      maxRowHeight: 200,
      maxColumnWidth: 500,
      renderBatchSize: 50,
      scrollThrottle: 16,
      updateDebounce: 300
    }
  };
};

// Cell operations
export const updateCellContent = (
  table: AdvancedTableData,
  cellId: string,
  content: string
): AdvancedTableData => {
  const { rowId, columnId } = parseCellId(cellId);
  
  const newRows = table.rows.map(row => {
    if (row.id === rowId) {
      const cell = row.cells[columnId];
      if (cell) {
        return {
          ...row,
          cells: {
            ...row.cells,
            [columnId]: {
              ...cell,
              content,
              metadata: {
                ...cell.metadata,
                updated: new Date()
              }
            }
          }
        };
      }
    }
    return row;
  });

  return {
    ...table,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

export const applyCellStyle = (
  table: AdvancedTableData,
  cellIds: string[],
  style: Partial<CellStyle>
): AdvancedTableData => {
  const cellIdMap = new Set(cellIds);
  
  const newRows = table.rows.map(row => {
    const newCells = { ...row.cells };
    let hasChanges = false;

    Object.keys(newCells).forEach(columnId => {
      const cell = newCells[columnId];
      if (cellIdMap.has(cell.id)) {
        newCells[columnId] = {
          ...cell,
          style: { ...cell.style, ...style },
          metadata: {
            ...cell.metadata,
            updated: new Date()
          }
        };
        hasChanges = true;
      }
    });

    return hasChanges ? { ...row, cells: newCells } : row;
  });

  return {
    ...table,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

// Row operations
export const insertRow = (
  table: AdvancedTableData,
  afterRowId?: string,
  rowData?: Partial<TableRow>
): AdvancedTableData => {
  const newRowId = generateRowId();
  const cells: { [columnId: string]: TableCell } = {};

  // Create cells for all columns
  table.columns.forEach(column => {
    const cellId = generateCellId(newRowId, column.id);
    cells[column.id] = {
      id: cellId,
      content: '',
      type: column.type,
      metadata: {
        id: cellId,
        created: new Date(),
        updated: new Date()
      }
    };
  });

  const newRow: TableRow = {
    id: newRowId,
    cells,
    metadata: {
      created: new Date(),
      updated: new Date()
    },
    ...rowData
  };

  let insertIndex = table.rows.length;
  if (afterRowId) {
    const afterIndex = table.rows.findIndex(row => row.id === afterRowId);
    if (afterIndex >= 0) {
      insertIndex = afterIndex + 1;
    }
  }

  const newRows = [...table.rows];
  newRows.splice(insertIndex, 0, newRow);

  return {
    ...table,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

export const deleteRow = (table: AdvancedTableData, rowId: string): AdvancedTableData => {
  if (table.rows.length <= 1) {
    throw new Error('Cannot delete the last row');
  }

  const newRows = table.rows.filter(row => row.id !== rowId);

  return {
    ...table,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

// Column operations
export const insertColumn = (
  table: AdvancedTableData,
  afterColumnId?: string,
  columnData?: Partial<TableColumn>
): AdvancedTableData => {
  const newColumnId = generateColumnId();
  const newColumn: TableColumn = {
    id: newColumnId,
    name: `Column ${table.columns.length + 1}`,
    type: 'text',
    width: 120,
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    hideable: true,
    pinnable: false,
    ...columnData
  };

  let insertIndex = table.columns.length;
  if (afterColumnId) {
    const afterIndex = table.columns.findIndex(col => col.id === afterColumnId);
    if (afterIndex >= 0) {
      insertIndex = afterIndex + 1;
    }
  }

  const newColumns = [...table.columns];
  newColumns.splice(insertIndex, 0, newColumn);

  // Add cells to all rows for the new column
  const newRows = table.rows.map(row => {
    const cellId = generateCellId(row.id, newColumnId);
    const newCell: TableCell = {
      id: cellId,
      content: '',
      type: newColumn.type,
      metadata: {
        id: cellId,
        created: new Date(),
        updated: new Date()
      }
    };

    return {
      ...row,
      cells: {
        ...row.cells,
        [newColumnId]: newCell
      }
    };
  });

  return {
    ...table,
    columns: newColumns,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

export const deleteColumn = (table: AdvancedTableData, columnId: string): AdvancedTableData => {
  if (table.columns.length <= 1) {
    throw new Error('Cannot delete the last column');
  }

  const newColumns = table.columns.filter(col => col.id !== columnId);

  // Remove cells from all rows for the deleted column
  const newRows = table.rows.map(row => {
    const { [columnId]: deletedCell, ...remainingCells } = row.cells;
    return {
      ...row,
      cells: remainingCells
    };
  });

  return {
    ...table,
    columns: newColumns,
    rows: newRows,
    metadata: {
      ...table.metadata,
      updated: new Date(),
      version: table.metadata.version + 1
    }
  };
};

// Selection utilities
export const getCellsInRange = (
  table: AdvancedTableData,
  startRow: number,
  endRow: number,
  startCol: number,
  endCol: number
): string[] => {
  const cellIds: string[] = [];
  
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);
  const minCol = Math.min(startCol, endCol);
  const maxCol = Math.max(startCol, endCol);

  for (let r = minRow; r <= maxRow; r++) {
    if (r < table.rows.length) {
      for (let c = minCol; c <= maxCol; c++) {
        if (c < table.columns.length) {
          const row = table.rows[r];
          const column = table.columns[c];
          const cellId = generateCellId(row.id, column.id);
          cellIds.push(cellId);
        }
      }
    }
  }

  return cellIds;
};

// Validation utilities
export const validateCell = (cell: TableCell, column: TableColumn): ValidationResult => {
  const errors: any[] = [];
  const warnings: any[] = [];
  const infos: any[] = [];

  if (cell.validation) {
    cell.validation.rules?.forEach(rule => {
      try {
        switch (rule.type) {
          case 'required':
            if (!cell.content || cell.content.trim() === '') {
              errors.push({
                rule: rule.type,
                message: rule.message,
                severity: rule.severity,
                field: column.name,
                value: cell.content
              });
            }
            break;
          
          case 'email':
            if (cell.content) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(cell.content)) {
                errors.push({
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity,
                  field: column.name,
                  value: cell.content
                });
              }
            }
            break;
          
          case 'url':
            if (cell.content) {
              try {
                new URL(cell.content);
              } catch {
                errors.push({
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity,
                  field: column.name,
                  value: cell.content
                });
              }
            }
            break;
          
          case 'range':
            if (cell.content) {
              const numValue = parseFloat(cell.content);
              if (!isNaN(numValue)) {
                if (rule.rule.min !== undefined && numValue < rule.rule.min) {
                  errors.push({
                    rule: rule.type,
                    message: rule.message,
                    severity: rule.severity,
                    field: column.name,
                    value: cell.content
                  });
                }
                if (rule.rule.max !== undefined && numValue > rule.rule.max) {
                  errors.push({
                    rule: rule.type,
                    message: rule.message,
                    severity: rule.severity,
                    field: column.name,
                    value: cell.content
                  });
                }
              }
            }
            break;
          
          case 'length':
            if (cell.content) {
              const length = cell.content.length;
              if (rule.rule.min !== undefined && length < rule.rule.min) {
                errors.push({
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity,
                  field: column.name,
                  value: cell.content
                });
              }
              if (rule.rule.max !== undefined && length > rule.rule.max) {
                errors.push({
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity,
                  field: column.name,
                  value: cell.content
                });
              }
            }
            break;
          
          case 'pattern':
            if (cell.content && rule.rule.pattern) {
              const regex = new RegExp(rule.rule.pattern);
              if (!regex.test(cell.content)) {
                errors.push({
                  rule: rule.type,
                  message: rule.message,
                  severity: rule.severity,
                  field: column.name,
                  value: cell.content
                });
              }
            }
            break;
        }
      } catch (error) {
        errors.push({
          rule: rule.type,
          message: `Validation error: ${error}`,
          severity: 'error',
          field: column.name,
          value: cell.content
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    infos
  };
};

// Formatting utilities
export const formatCellValue = (cell: TableCell, format?: CellFormat): string => {
  if (!cell.content) return '';

  if (format) {
    switch (format.type) {
      case 'number':
        const numValue = parseFloat(cell.content);
        if (!isNaN(numValue) && format.number) {
          return new Intl.NumberFormat(format.locale || 'en-US', format.number).format(numValue);
        }
        break;
      
      case 'currency':
        const currValue = parseFloat(cell.content);
        if (!isNaN(currValue) && format.number) {
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'currency',
            currency: format.number.currency || 'USD',
            ...format.number
          }).format(currValue);
        }
        break;
      
      case 'percentage':
        const pctValue = parseFloat(cell.content);
        if (!isNaN(pctValue) && format.number) {
          return new Intl.NumberFormat(format.locale || 'en-US', {
            style: 'percent',
            ...format.number
          }).format(pctValue / 100);
        }
        break;
      
      case 'date':
        if (cell.content) {
          try {
            const date = new Date(cell.content);
            if (!isNaN(date.getTime()) && format.date) {
              return new Intl.DateTimeFormat(format.locale || 'en-US', format.date).format(date);
            }
          } catch {
            // Fall through to default
          }
        }
        break;
      
      case 'boolean':
        if (format.boolean) {
          const boolValue = cell.content === 'true' || cell.content === '1';
          return boolValue 
            ? (format.boolean.trueText || 'Yes')
            : (format.boolean.falseText || 'No');
        }
        break;
      
      case 'text':
        if (format.text) {
          let result = cell.content;
          
          if (format.text.case) {
            switch (format.text.case) {
              case 'upper':
                result = result.toUpperCase();
                break;
              case 'lower':
                result = result.toLowerCase();
                break;
              case 'title':
                result = result.replace(/\w\S*/g, (txt) => 
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                break;
            }
          }
          
          if (format.text.prefix) {
            result = format.text.prefix + result;
          }
          
          if (format.text.suffix) {
            result = result + format.text.suffix;
          }
          
          if (format.text.truncate) {
            const maxLength = format.text.truncate.length;
            if (result.length > maxLength) {
              const omission = format.text.truncate.omission || '...';
              result = result.substring(0, maxLength - omission.length) + omission;
            }
          }
          
          return result;
        }
        break;
    }
  }

  return cell.content;
};

// Export utilities
export const tableToJSON = (table: AdvancedTableData): string => {
  return JSON.stringify(table, null, 2);
};

export const tableToCSV = (table: AdvancedTableData): string => {
  const lines: string[] = [];
  
  // Headers
  if (table.settings.showHeaders) {
    const headers = table.columns.map(col => `"${col.name.replace(/"/g, '""')}"`);
    lines.push(headers.join(','));
  }
  
  // Data rows
  table.rows.forEach(row => {
    const values = table.columns.map(col => {
      const cell = row.cells[col.id];
      const value = cell ? formatCellValue(cell, col.format) : '';
      return `"${value.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(','));
  });
  
  return lines.join('\n');
};

// Import utilities
export const parseCSV = (csvContent: string): { headers: string[]; rows: string[][] } => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const result: string[][] = [];
  
  lines.forEach(line => {
    const row: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    row.push(current); // Add last field
    result.push(row);
  });
  
  const headers = result.length > 0 ? result[0] : [];
  const rows = result.slice(1);
  
  return { headers, rows };
};