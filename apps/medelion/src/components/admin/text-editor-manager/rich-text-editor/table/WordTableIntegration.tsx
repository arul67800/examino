import React, { useState, useRef } from 'react';
import { TableProvider } from '../context/TableContext';
import { InsertMenu } from '../components/InsertMenu';
import { AdvancedTableEditor } from '../components/AdvancedTableEditor';
import { useTableIntegration } from '../hooks/useTableIntegration';
import { TableTemplate } from '../types/template.types';
import { AdvancedTableData } from '../types/table.types';
import { basicTableTemplate } from '../templates/predefined-basic.templates';

export interface WordTableIntegrationProps {
  onTableInsert?: (tableData: AdvancedTableData) => void;
  onTableUpdate?: (tableData: AdvancedTableData) => void;
  onTableDelete?: (tableId: string) => void;
  className?: string;
}

/**
 * Complete table integration component for your word-like editor.
 * This provides Google Docs-like table functionality with advanced features.
 * 
 * Features included:
 * - Google Docs-style insert menu with templates
 * - Advanced table editor with formatting, formulas, and data validation
 * - Sophisticated table grid with Excel-like functionality
 * - Keyboard navigation and shortcuts
 * - Copy/paste support
 * - Column resizing and row manipulation
 * - Context menus and advanced selection
 * - Export/import capabilities
 * 
 * Usage in your rich text editor:
 * ```tsx
 * <WordTableIntegration
 *   onTableInsert={(table) => insertIntoEditor(table)}
 *   onTableUpdate={(table) => updateInEditor(table)}
 *   onTableDelete={(id) => removeFromEditor(id)}
 * />
 * ```
 */
export const WordTableIntegration: React.FC<WordTableIntegrationProps> = ({
  onTableInsert,
  onTableUpdate,
  onTableDelete,
  className = ''
}) => {
  const editorRef = useRef<any>(null);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [currentTableId, setCurrentTableId] = useState<string | null>(null);
  
  const {
    editorState,
    createTable,
    createQuickTable,
    editTable,
    updateTable,
    deleteTable,
    closeEditor,
    insertTableAtCursor,
    getTable,
    exportTable
  } = useTableIntegration({
    onTableCreate: (tableData) => {
      console.log('Table created:', tableData);
      onTableInsert?.(tableData);
    },
    onTableUpdate: (tableData) => {
      console.log('Table updated:', tableData);
      onTableUpdate?.(tableData);
    },
    onTableDelete: (tableId) => {
      console.log('Table deleted:', tableId);
      onTableDelete?.(tableId);
    },
    maxTables: 20,
    autoSave: true,
    autoSaveDelay: 500
  });

  const handleTemplateSelect = (template: TableTemplate) => {
    const tableId = createTable(template);
    setCurrentTableId(tableId);
    setShowInsertMenu(false);
  };

  const handleQuickTableCreate = (rows: number, cols: number) => {
    const tableId = createQuickTable(rows, cols, 'New Table');
    setCurrentTableId(tableId);
    setShowInsertMenu(false);
  };

  const handleTableEdit = (tableId: string) => {
    editTable(tableId);
    setCurrentTableId(tableId);
  };

  const handleTableClose = () => {
    closeEditor();
    setCurrentTableId(null);
  };

  const handleTableExport = (format: 'csv' | 'json' | 'html' | 'markdown') => {
    if (currentTableId) {
      const exportedData = exportTable(currentTableId, format);
      
      // Create download
      const blob = new Blob([exportedData], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `table.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`word-table-integration ${className}`}>
      {/* Insert Menu Button */}
      <div className="table-controls mb-4">
        <button
          onClick={() => setShowInsertMenu(!showInsertMenu)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Insert Table
        </button>
        
        {currentTableId && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleTableExport('csv')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleTableExport('json')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Export JSON
            </button>
            <button
              onClick={() => handleTableExport('html')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              Export HTML
            </button>
          </div>
        )}
      </div>

      {/* Insert Menu */}
      {showInsertMenu && (
        <div className="mb-6 border border-gray-200 rounded-lg bg-white shadow-lg">
          <InsertMenu
            onTemplateSelect={handleTemplateSelect}
            onQuickCreate={handleQuickTableCreate}
            onClose={() => setShowInsertMenu(false)}
          />
        </div>
      )}

      {/* Table Editor */}
      {editorState.isOpen && currentTableId && (
        <TableProvider>
          <div className="table-editor-container border border-gray-200 rounded-lg bg-white shadow-lg">
            <div className="table-editor-header p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editorState.mode === 'create' ? 'Create New Table' : 'Edit Table'}
              </h3>
              <button
                onClick={handleTableClose}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="table-editor-content">
              <AdvancedTableEditor
                initialData={getTable(currentTableId)}
                onDataChange={(data) => updateTable(currentTableId, data)}
                onClose={handleTableClose}
                className="p-4"
              />
            </div>
          </div>
        </TableProvider>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <h4 className="font-semibold mb-2">Table Features Available:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Advanced Selection:</strong> Click, Ctrl+Click, Shift+Click for multi-selection</li>
          <li><strong>Keyboard Navigation:</strong> Arrow keys, Tab, Enter, F2 to edit</li>
          <li><strong>Copy/Paste:</strong> Ctrl+C, Ctrl+V, Ctrl+X for cell operations</li>
          <li><strong>Quick Actions:</strong> Delete/Backspace to clear, Escape to cancel</li>
          <li><strong>Column Operations:</strong> Click headers to select columns, drag to resize</li>
          <li><strong>Row Operations:</strong> Click row numbers to select rows</li>
          <li><strong>Context Menus:</strong> Right-click for advanced options</li>
          <li><strong>Formatting:</strong> Bold, italic, colors, borders, alignment</li>
          <li><strong>Data Types:</strong> Text, numbers, dates, formulas, dropdowns</li>
          <li><strong>Export/Import:</strong> CSV, JSON, HTML, Markdown formats</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Simplified integration hook for basic table operations
 * Use this if you just need basic table functionality
 */
export const useSimpleTableIntegration = () => {
  const [tables, setTables] = useState<Map<string, AdvancedTableData>>(new Map());

  const createSimpleTable = (rows: number = 3, cols: number = 3) => {
    const template = {
      ...basicTableTemplate,
      dimensions: { rows, columns: cols }
    };
    
    // Create basic table data
    const tableData: Partial<AdvancedTableData> = {
      id: `simple-table-${Date.now()}`,
      // Add basic structure here
    };
    
    return tableData;
  };

  return {
    tables: Array.from(tables.values()),
    createSimpleTable,
    deleteTable: (id: string) => {
      const newTables = new Map(tables);
      newTables.delete(id);
      setTables(newTables);
    }
  };
};

export default WordTableIntegration;