import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TableProvider, useTable } from './context/TableContext';
import { TableGrid } from './components/TableGrid';
import { TableToolbar } from './components/TableToolbar';
import { FormattingPanel } from './components/FormattingPanel';
import { TableSettingsPanel } from './components/TableSettingsPanel';
import { AdvancedTableData } from './types/table.types';
import { createEmptyTable } from './utils/table.utils';

export interface AdvancedTableEditorProps {
  initialData?: AdvancedTableData;
  onChange?: (data: AdvancedTableData) => void;
  onDelete?: () => void;
  className?: string;
  readOnly?: boolean;
}

// Internal table editor component that uses the context
const TableEditorContent: React.FC<{
  onDelete?: () => void;
  className?: string;
  readOnly?: boolean;
}> = ({ onDelete, className = '', readOnly = false }) => {
  const { state, togglePanel } = useTable();
  const [isSelected, setIsSelected] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (readOnly) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (isSelected && !state.editingCell && onDelete) {
        event.preventDefault();
        onDelete();
      }
    }
  }, [isSelected, state.editingCell, onDelete, readOnly]);

  return (
    <div 
      ref={tableRef}
      className={`
        relative w-full bg-white border rounded-lg shadow-sm
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}
        ${className}
      `}
      onClick={() => setIsSelected(true)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Table Toolbar */}
      {!readOnly && (
        <div className="border-b border-gray-200 p-2">
          <TableToolbar />
        </div>
      )}

      {/* Main Table Area */}
      <div className="relative">
        <TableGrid readOnly={readOnly} />
        
        {/* Selection overlay when table is selected but no cell is being edited */}
        {isSelected && !state.editingCell && !readOnly && (
          <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded" />
        )}
      </div>

      {/* Side Panels */}
      {!readOnly && (
        <>
          {/* Formatting Panel */}
          {state.ui.showFormatPanel && (
            <div className="absolute top-0 right-0 translate-x-full ml-4 z-10">
              <FormattingPanel />
            </div>
          )}

          {/* Settings Panel */}
          {state.ui.showSettingsPanel && (
            <div className="absolute top-0 left-0 -translate-x-full mr-4 z-10">
              <TableSettingsPanel />
            </div>
          )}
        </>
      )}

      {/* Delete button when selected */}
      {isSelected && !readOnly && onDelete && !state.editingCell && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 z-20"
          title="Delete table"
        >
          ×
        </button>
      )}

      {/* Error Display */}
      {state.ui.error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 p-2">
          <div className="text-sm text-red-600">{state.ui.error}</div>
        </div>
      )}

      {/* Loading Overlay */}
      {state.ui.loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

// Main component that provides the context
export const AdvancedTableEditor: React.FC<AdvancedTableEditorProps> = ({
  initialData,
  onChange,
  onDelete,
  className = '',
  readOnly = false
}) => {
  // Create default table if no initial data provided
  const defaultData = initialData || createEmptyTable(3, 4);

  return (
    <TableProvider initialData={defaultData} onChange={onChange}>
      <TableEditorContent 
        onDelete={onDelete}
        className={className}
        readOnly={readOnly}
      />
    </TableProvider>
  );
};