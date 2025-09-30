import { useCallback, useState, useRef } from 'react';
import { AdvancedTableData, TableColumn, TableRow, TableCell } from '../types/table.types';
import { TableTemplate } from '../types/template.types';
import { generateRowId, generateColumnId, generateCellId, createEmptyTable } from '../utils/table.utils';
import { useTable } from '../context/TableContext';

// Helper functions
const generateTableId = (): string => {
  return `table-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createDefaultTableData = (options: {
  rows: number;
  columns: number;
  title?: string;
  description?: string;
  customColumns?: TableColumn[];
  customRows?: TableRow[];
}): AdvancedTableData => {
  const { rows, columns, title, description, customColumns, customRows } = options;
  
  // Use createEmptyTable as base and modify as needed
  const baseTable = createEmptyTable(rows, columns);
  
  return {
    ...baseTable,
    columns: customColumns || baseTable.columns,
    rows: customRows || baseTable.rows,
    metadata: {
      ...baseTable.metadata,
      title: title || baseTable.metadata.title,
      description: description || baseTable.metadata.description
    }
  };
};

export interface TableIntegrationOptions {
  onTableCreate?: (tableData: AdvancedTableData) => void;
  onTableUpdate?: (tableData: AdvancedTableData) => void;
  onTableDelete?: (tableId: string) => void;
  onTableSelect?: (tableId: string) => void;
  maxTables?: number;
  allowInlineEditing?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface TableEditorState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | null;
  tableId: string | null;
  selectedTemplate: TableTemplate | null;
}

export const useTableIntegration = (options: TableIntegrationOptions = {}) => {
  const {
    onTableCreate,
    onTableUpdate,
    onTableDelete,
    onTableSelect,
    maxTables = 10,
    allowInlineEditing = true,
    autoSave = true,
    autoSaveDelay = 1000
  } = options;

  const [editorState, setEditorState] = useState<TableEditorState>({
    isOpen: false,
    mode: null,
    tableId: null,
    selectedTemplate: null
  });

  const [tables, setTables] = useState<Map<string, AdvancedTableData>>(new Map());
  const autoSaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Create a new table from template
  const createTable = useCallback((template: TableTemplate) => {
    const tableData = createDefaultTableData({
      rows: template.dimensions.rows,
      columns: template.dimensions.columns,
      title: template.name,
      description: template.description
    });

      const tableId = generateTableId();
      tableData.id = tableId;
      tableData.metadata = {
        ...tableData.metadata,
        template: template.name
      };
    
    setTables(prev => new Map(prev.set(tableId, tableData)));
    
    // Open editor for new table
    setEditorState({
      isOpen: true,
      mode: 'create',
      tableId,
      selectedTemplate: template
    });

    onTableCreate?.(tableData);
    return tableId;
  }, [onTableCreate]);

  // Create a quick table with specified dimensions
  const createQuickTable = useCallback((rows: number, cols: number, title?: string) => {
    const tableData = createDefaultTableData({ rows, columns: cols, title });
    const tableId = generateTableId();
    tableData.id = tableId;
    
    setTables(prev => new Map(prev.set(tableId, tableData)));
    
    setEditorState({
      isOpen: true,
      mode: 'create',
      tableId,
      selectedTemplate: null
    });

    onTableCreate?.(tableData);
    return tableId;
  }, [onTableCreate]);

  // Edit an existing table
  const editTable = useCallback((tableId: string) => {
    const tableData = tables.get(tableId);
    if (!tableData) {
      console.warn(`Table with ID ${tableId} not found`);
      return;
    }

    setEditorState({
      isOpen: true,
      mode: 'edit',
      tableId,
      selectedTemplate: null
    });

    onTableSelect?.(tableId);
  }, [tables, onTableSelect]);

  // Update table data
  const updateTable = useCallback((tableId: string, updates: Partial<AdvancedTableData>) => {
    const currentTable = tables.get(tableId);
    if (!currentTable) return;

    const updatedTable = {
      ...currentTable,
      ...updates,
      metadata: {
        ...currentTable.metadata,
        ...updates.metadata,
        updated: new Date()
      }
    };

    setTables(prev => new Map(prev.set(tableId, updatedTable)));

    // Auto-save with debouncing
    if (autoSave) {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      
      autoSaveTimeout.current = setTimeout(() => {
        onTableUpdate?.(updatedTable);
      }, autoSaveDelay);
    } else {
      onTableUpdate?.(updatedTable);
    }
  }, [tables, autoSave, autoSaveDelay, onTableUpdate]);

  // Delete a table
  const deleteTable = useCallback((tableId: string) => {
    const newTables = new Map(tables);
    newTables.delete(tableId);
    setTables(newTables);
    
    onTableDelete?.(tableId);
    
    // Close editor if deleting current table
    if (editorState.tableId === tableId) {
      setEditorState({
        isOpen: false,
        mode: null,
        tableId: null,
        selectedTemplate: null
      });
    }
  }, [tables, editorState.tableId, onTableDelete]);

  // Close the table editor
  const closeEditor = useCallback(() => {
    setEditorState({
      isOpen: false,
      mode: null,
      tableId: null,
      selectedTemplate: null
    });
  }, []);

  // Get table data by ID
  const getTable = useCallback((tableId: string) => {
    return tables.get(tableId);
  }, [tables]);

  // Get all tables
  const getAllTables = useCallback(() => {
    return Array.from(tables.values());
  }, [tables]);

  // Insert table at cursor position (for rich text integration)
  const insertTableAtCursor = useCallback((template: TableTemplate, editorRef?: any) => {
    const tableId = createTable(template);
    
      if (editorRef && editorRef.current) {
        const tableHtml = `<div data-table-id="${tableId}" class="table-placeholder">
          <div class="table-placeholder-content">
            <span class="table-title">${template.name}</span>
            <span class="table-dimensions">${template.dimensions.rows}×${template.dimensions.columns}</span>
          </div>
        </div>`;
      
      // Insert at cursor position (implementation depends on your editor)
      if (typeof editorRef.current.insertHTML === 'function') {
        editorRef.current.insertHTML(tableHtml);
      }
    }
    
    return tableId;
  }, [createTable]);

  // Convert table to different formats
  const exportTable = useCallback((tableId: string, format: 'csv' | 'json' | 'html' | 'markdown') => {
    const table = tables.get(tableId);
    if (!table) return '';

    switch (format) {
      case 'csv':
        return tableToCsv(table);
      case 'json':
        return JSON.stringify(table, null, 2);
      case 'html':
        return tableToHtml(table);
      case 'markdown':
        return tableToMarkdown(table);
      default:
        return '';
    }
  }, [tables]);

  // Import table from different formats
  const importTable = useCallback((data: string, format: 'csv' | 'json') => {
    try {
      let tableData: AdvancedTableData;
      
      switch (format) {
        case 'csv':
          tableData = csvToTable(data);
          break;
        case 'json':
          tableData = JSON.parse(data) as AdvancedTableData;
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      const tableId = generateTableId();
      tableData.id = tableId;
      
      setTables(prev => new Map(prev.set(tableId, tableData)));
      onTableCreate?.(tableData);
      
      return tableId;
    } catch (error) {
      console.error('Failed to import table:', error);
      return null;
    }
  }, [onTableCreate]);

  return {
    // State
    editorState,
    tables: getAllTables(),
    
    // Actions
    createTable,
    createQuickTable,
    editTable,
    updateTable,
    deleteTable,
    closeEditor,
    insertTableAtCursor,
    
    // Data access
    getTable,
    getAllTables,
    
    // Import/Export
    exportTable,
    importTable,
    
    // Utils
    canCreateTable: tables.size < maxTables,
    tableCount: tables.size
  };
};

// Helper functions for export/import
function tableToCsv(table: AdvancedTableData): string {
  const headers = table.columns.map(col => col.name).join(',');
  const rows = table.rows.map(row => 
    table.columns.map(col => {
      const cell = row.cells[col.id];
      return cell ? `"${cell.content.replace(/"/g, '""')}"` : '""';
    }).join(',')
  );
  return [headers, ...rows].join('\n');
}

function tableToHtml(table: AdvancedTableData): string {
  const headers = table.columns.map(col => `<th>${col.name}</th>`).join('');
  const rows = table.rows.map(row => {
    const cells = table.columns.map(col => {
      const cell = row.cells[col.id];
      return `<td>${cell ? cell.content : ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
}

function tableToMarkdown(table: AdvancedTableData): string {
  const headers = table.columns.map(col => col.name).join(' | ');
  const separator = table.columns.map(() => '---').join(' | ');
  const rows = table.rows.map(row => 
    table.columns.map(col => {
      const cell = row.cells[col.id];
      return cell ? cell.content : '';
    }).join(' | ')
  );
  
  return [headers, separator, ...rows].join('\n');
}

function csvToTable(csv: string): AdvancedTableData {
  const lines = csv.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const columns: TableColumn[] = headers.map((name, index) => ({
    id: generateColumnId(),
    name,
    type: 'text',
    width: 120,
    sortable: true,
    filterable: true,
    resizable: true,
    reorderable: true,
    hideable: true,
    pinnable: false
  }));
  
  const rows: TableRow[] = lines.slice(1).map((line, rowIndex) => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const cells: Record<string, TableCell> = {};
    
    columns.forEach((col, colIndex) => {
      cells[col.id] = {
        id: generateCellId(`row-${rowIndex}`, col.id),
        content: values[colIndex] || '',
        type: 'text'
      };
    });
    
    return {
      id: generateRowId(),
      cells,
      height: 32
    };
  });
  
  return createDefaultTableData({
    rows: rows.length,
    columns: columns.length,
    customColumns: columns,
    customRows: rows
  });
}