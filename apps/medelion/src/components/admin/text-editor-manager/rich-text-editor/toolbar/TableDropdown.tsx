'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/theme';
import { ChevronDown, Table } from 'lucide-react';

interface TableDropdownProps {
  onTableInsert: (rows: number, cols: number) => void;
  compact?: boolean;
}

export const TableDropdown: React.FC<TableDropdownProps> = ({
  onTableInsert,
  compact = false
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCells, setSelectedCells] = useState({ rows: 0, cols: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const MAX_ROWS = 8;
  const MAX_COLS = 8;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCellHover = (row: number, col: number) => {
    setSelectedCells({ rows: row + 1, cols: col + 1 });
  };

  const handleTableInsert = () => {
    if (selectedCells.rows > 0 && selectedCells.cols > 0) {
      onTableInsert(selectedCells.rows, selectedCells.cols);
      setIsOpen(false);
      setSelectedCells({ rows: 0, cols: 0 });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          inline-flex items-center justify-between
          ${compact ? 'px-2 py-1.5' : 'px-3 py-1.5'}
          text-sm font-medium rounded-md
          transition-all duration-200 ease-in-out
          hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1
        `}
        style={{
          backgroundColor: theme.colors.semantic.surface.secondary,
          color: theme.colors.semantic.text.primary,
          borderColor: theme.colors.semantic.border.primary,
          border: `1px solid ${theme.colors.semantic.border.primary}`
        }}
        onClick={() => setIsOpen(!isOpen)}
        title="Insert Table"
      >
        <Table className="w-4 h-4" />
        {!compact && (
          <ChevronDown 
            className={`w-3 h-3 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 z-50 rounded-md shadow-lg border p-3"
          style={{
            backgroundColor: theme.colors.semantic.surface.primary,
            borderColor: theme.colors.semantic.border.primary
          }}
        >
          <div className="space-y-3">
            <div className="text-sm font-medium" style={{ color: theme.colors.semantic.text.primary }}>
              {selectedCells.rows > 0 && selectedCells.cols > 0
                ? `${selectedCells.rows} x ${selectedCells.cols} Table`
                : 'Select table size'
              }
            </div>
            
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 1fr)` }}>
              {Array.from({ length: MAX_ROWS }, (_, row) =>
                Array.from({ length: MAX_COLS }, (_, col) => (
                  <button
                    key={`${row}-${col}`}
                    className="w-4 h-4 border rounded-sm hover:opacity-80 transition-colors"
                    style={{
                      backgroundColor: row < selectedCells.rows && col < selectedCells.cols
                        ? theme.colors.semantic.action.primary
                        : theme.colors.semantic.surface.secondary,
                      borderColor: theme.colors.semantic.border.primary
                    }}
                    onMouseEnter={() => handleCellHover(row, col)}
                    onClick={handleTableInsert}
                  />
                ))
              )}
            </div>

            <div className="pt-2 border-t" style={{ borderColor: theme.colors.semantic.border.secondary }}>
              <button
                onClick={() => {
                  const rows = prompt('Number of rows:', '3');
                  const cols = prompt('Number of columns:', '3');
                  if (rows && cols) {
                    onTableInsert(parseInt(rows), parseInt(cols));
                    setIsOpen(false);
                  }
                }}
                className="w-full px-3 py-1 text-sm rounded transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.semantic.text.secondary,
                  border: `1px solid ${theme.colors.semantic.border.primary}`
                }}
              >
                Custom size...
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};