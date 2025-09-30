import React, { useState, useCallback } from 'react';
import { Plus, Table, Grid, FileText, Image, Link, Calendar } from 'lucide-react';
import { predefinedTemplates } from './table/templates/predefined-basic.templates';
import { createEmptyTable } from './table/utils/table.utils';
import { AdvancedTableData } from './table/types/table.types';

export interface InsertMenuProps {
  onInsertTable: (tableData: AdvancedTableData) => void;
  onInsertImage?: () => void;
  onInsertLink?: () => void;
  className?: string;
}

interface TableSizeSelector {
  rows: number;
  cols: number;
  hoveredRows: number;
  hoveredCols: number;
}

export const InsertMenu: React.FC<InsertMenuProps> = ({
  onInsertTable,
  onInsertImage,
  onInsertLink,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [tableSize, setTableSize] = useState<TableSizeSelector>({
    rows: 0,
    cols: 0,
    hoveredRows: 0,
    hoveredCols: 0
  });

  const handleTableSizeSelect = useCallback((rows: number, cols: number) => {
    const tableData = createEmptyTable(rows, cols);
    onInsertTable(tableData);
    setIsOpen(false);
    setShowTableSelector(false);
  }, [onInsertTable]);

  const handleTemplateSelect = useCallback((templateKey: string) => {
    const template = (predefinedTemplates as any)[templateKey];
    if (template && typeof template.generate === 'function') {
      const tableData = template.generate();
      onInsertTable(tableData);
      setIsOpen(false);
      setShowTemplates(false);
    }
  }, [onInsertTable]);

  const renderTableSizeGrid = () => {
    const maxRows = 8;
    const maxCols = 10;
    const cells = [];

    for (let row = 0; row < maxRows; row++) {
      for (let col = 0; col < maxCols; col++) {
        const isSelected = row < tableSize.hoveredRows && col < tableSize.hoveredCols;
        cells.push(
          <div
            key={`${row}-${col}`}
            className={`
              w-4 h-4 border border-gray-300 cursor-pointer transition-colors
              ${isSelected ? 'bg-blue-500' : 'bg-white hover:bg-blue-100'}
            `}
            onMouseEnter={() => setTableSize(prev => ({ 
              ...prev, 
              hoveredRows: row + 1, 
              hoveredCols: col + 1 
            }))}
            onClick={() => handleTableSizeSelect(row + 1, col + 1)}
          />
        );
      }
    }

    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="mb-2 text-sm text-gray-600">
          Select table size: {tableSize.hoveredRows} × {tableSize.hoveredCols}
        </div>
        <div 
          className="grid gap-1 mb-4"
          style={{ 
            gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
            gridTemplateRows: `repeat(${maxRows}, 1fr)`
          }}
        >
          {cells}
        </div>
        <div className="border-t pt-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="w-full text-left px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
          >
            Choose from templates...
          </button>
        </div>
      </div>
    );
  };

  const renderTemplateSelector = () => {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg w-80">
        <div className="mb-3">
          <button
            onClick={() => {
              setShowTemplates(false);
              setShowTableSelector(true);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to size selector
          </button>
        </div>
        <div className="mb-2 font-medium text-gray-800">Table Templates</div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {Object.entries(predefinedTemplates).map(([key, template]) => {
            const tmpl = template as any;
            return (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="w-full text-left p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="font-medium text-sm">{tmpl?.name || 'Table Template'}</div>
                <div className="text-xs text-gray-500 mt-1">{tmpl?.description || 'Custom table layout'}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {Array.isArray(tmpl?.rows) ? tmpl.rows.length : '3'} rows × {Array.isArray(tmpl?.columns) ? tmpl.columns.length : '4'} columns
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Plus size={16} />
        <span>Insert</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => {
              setIsOpen(false);
              setShowTableSelector(false);
              setShowTemplates(false);
            }}
          />
          
          {/* Menu */}
          <div className="absolute top-full mt-1 left-0 z-20">
            {showTemplates ? (
              renderTemplateSelector()
            ) : showTableSelector ? (
              renderTableSizeGrid()
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48">
                <button
                  onClick={() => setShowTableSelector(true)}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Table size={16} />
                  <span>Table</span>
                </button>
                
                {onInsertImage && (
                  <button
                    onClick={() => {
                      onInsertImage();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Image size={16} />
                    <span>Image</span>
                  </button>
                )}

                {onInsertLink && (
                  <button
                    onClick={() => {
                      onInsertLink();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Link size={16} />
                    <span>Link</span>
                  </button>
                )}

                <div className="border-t my-2" />
                
                <div className="px-4 py-1 text-xs text-gray-500 uppercase tracking-wide">
                  More options
                </div>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Grid size={16} />
                  <span>Chart</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Calendar size={16} />
                  <span>Date</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <FileText size={16} />
                  <span>Page break</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InsertMenu;