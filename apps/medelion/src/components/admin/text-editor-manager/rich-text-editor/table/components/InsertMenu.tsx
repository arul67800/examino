import React, { useState, useCallback } from 'react';
import { useTheme } from '@/theme';
import { 
  Table, Grid3X3, Plus, X, ChevronRight, 
  FileSpreadsheet, Calculator, Users, 
  Calendar, Package, BookOpen
} from 'lucide-react';

interface TableTemplate {
  id: string;
  name: string;
  description: string;
  dimensions: {
    rows: number;
    columns: number;
  };
  category: string;
  icon: React.ReactNode;
  preview?: string;
}

const PREDEFINED_TEMPLATES: TableTemplate[] = [
  {
    id: 'basic-table',
    name: 'Basic Table',
    description: 'Simple table for general data',
    dimensions: { rows: 3, columns: 3 },
    category: 'basic',
    icon: <Table className="w-4 h-4" />,
    preview: '3×3 Basic'
  },
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Structured data with headers',
    dimensions: { rows: 5, columns: 4 },
    category: 'data',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    preview: '5×4 Data'
  },
  {
    id: 'budget-table',
    name: 'Budget Planner',
    description: 'Financial tracking table',
    dimensions: { rows: 8, columns: 5 },
    category: 'financial',
    icon: <Calculator className="w-4 h-4" />,
    preview: '8×5 Budget'
  },
  {
    id: 'team-table',
    name: 'Team Roster',
    description: 'Team member information',
    dimensions: { rows: 6, columns: 4 },
    category: 'team',
    icon: <Users className="w-4 h-4" />,
    preview: '6×4 Team'
  },
  {
    id: 'schedule-table',
    name: 'Schedule',
    description: 'Time-based scheduling',
    dimensions: { rows: 7, columns: 5 },
    category: 'schedule',
    icon: <Calendar className="w-4 h-4" />,
    preview: '7×5 Schedule'
  },
  {
    id: 'inventory-table',
    name: 'Inventory',
    description: 'Product inventory tracking',
    dimensions: { rows: 10, columns: 6 },
    category: 'inventory',
    icon: <Package className="w-4 h-4" />,
    preview: '10×6 Inventory'
  }
];

interface TableSizePickerProps {
  onSizeSelect: (rows: number, cols: number) => void;
  maxRows?: number;
  maxCols?: number;
}

const TableSizePicker: React.FC<TableSizePickerProps> = ({ 
  onSizeSelect, 
  maxRows = 10, 
  maxCols = 10 
}) => {
  const { theme } = useTheme();
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  const handleCellHover = (row: number, col: number) => {
    setHoveredCell({ row, col });
  };

  const handleCellClick = (row: number, col: number) => {
    onSizeSelect(row + 1, col + 1);
  };

  return (
    <div className="p-4">
      <h4 
        className="text-sm font-medium mb-2"
        style={{ color: theme.colors.semantic.text.primary }}
      >
        Select Table Size
      </h4>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }, (_, index) => {
          const row = Math.floor(index / maxCols);
          const col = index % maxCols;
          const isSelected = hoveredCell && row <= hoveredCell.row && col <= hoveredCell.col;
          
          return (
            <div
              key={index}
              className="w-4 h-4 border cursor-pointer transition-colors"
              style={{
                backgroundColor: isSelected ? theme.colors.semantic.action.primary : theme.colors.semantic.surface.primary,
                borderColor: theme.colors.semantic.border.primary
              }}
              onMouseEnter={() => handleCellHover(row, col)}
              onClick={() => handleCellClick(row, col)}
            />
          );
        })}
      </div>
      {hoveredCell && (
        <p 
          className="text-xs mt-2"
          style={{ color: theme.colors.semantic.text.secondary }}
        >
          {hoveredCell.row + 1} × {hoveredCell.col + 1} Table
        </p>
      )}
    </div>
  );
};

interface InsertMenuProps {
  onTemplateSelect: (template: TableTemplate) => void;
  onQuickCreate: (rows: number, cols: number) => void;
  onClose: () => void;
}

export const InsertMenu: React.FC<InsertMenuProps> = ({
  onTemplateSelect,
  onQuickCreate,
  onClose
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'quick' | 'templates'>('quick');

  const handleTemplateClick = useCallback((template: TableTemplate) => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  const handleQuickCreate = useCallback((rows: number, cols: number) => {
    onQuickCreate(rows, cols);
  }, [onQuickCreate]);

  return (
    <div 
      className="rounded-lg shadow-lg"
      style={{ 
        minWidth: '420px',
        maxWidth: '500px',
        backgroundColor: theme.colors.semantic.surface.primary,
        border: `1px solid ${theme.colors.semantic.border.primary}`,
        color: theme.colors.semantic.text.primary
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderBottomColor: theme.colors.semantic.border.primary
        }}
      >
        <h3 
          className="text-lg font-semibold"
          style={{ color: theme.colors.semantic.text.primary }}
        >
          Insert Table
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X className="w-4 h-4" style={{ color: theme.colors.semantic.text.secondary }} />
        </button>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ borderBottomColor: theme.colors.semantic.border.primary }}
      >
        <button
          onClick={() => setActiveTab('quick')}
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{
            color: activeTab === 'quick' ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary,
            backgroundColor: activeTab === 'quick' ? theme.colors.semantic.surface.secondary : 'transparent',
            borderBottom: activeTab === 'quick' ? `2px solid ${theme.colors.semantic.action.primary}` : 'none'
          }}
        >
          Quick Insert
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className="px-4 py-2 text-sm font-medium transition-colors"
          style={{
            color: activeTab === 'templates' ? theme.colors.semantic.action.primary : theme.colors.semantic.text.secondary,
            backgroundColor: activeTab === 'templates' ? theme.colors.semantic.surface.secondary : 'transparent',
            borderBottom: activeTab === 'templates' ? `2px solid ${theme.colors.semantic.action.primary}` : 'none'
          }}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      <div className="p-0">
        {activeTab === 'quick' && (
          <TableSizePicker onSizeSelect={handleQuickCreate} />
        )}

        {activeTab === 'templates' && (
          <div className="p-4">
            <h4 
              className="text-sm font-medium mb-3"
              style={{ color: theme.colors.semantic.text.primary }}
            >
              Choose a Template
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {PREDEFINED_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className="flex items-center gap-3 p-3 text-left rounded-lg border transition-colors"
                  style={{
                    backgroundColor: theme.colors.semantic.surface.primary,
                    borderColor: theme.colors.semantic.border.primary
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.primary;
                  }}
                >
                  <div 
                    className="flex-shrink-0 w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: theme.colors.semantic.surface.secondary }}
                  >
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 
                      className="text-sm font-medium truncate"
                      style={{ color: theme.colors.semantic.text.primary }}
                    >
                      {template.name}
                    </h5>
                    <p 
                      className="text-xs truncate"
                      style={{ color: theme.colors.semantic.text.secondary }}
                    >
                      {template.description}
                    </p>
                  </div>
                  <div 
                    className="flex-shrink-0 text-xs"
                    style={{ color: theme.colors.semantic.text.secondary }}
                  >
                    {template.preview}
                  </div>
                  <ChevronRight 
                    className="w-4 h-4" 
                    style={{ color: theme.colors.semantic.text.secondary }} 
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="p-4 border-t"
        style={{
          borderTopColor: theme.colors.semantic.border.primary,
          backgroundColor: theme.colors.semantic.surface.secondary
        }}
      >
        <div className="flex items-center justify-between">
          <p 
            className="text-xs"
            style={{ color: theme.colors.semantic.text.secondary }}
          >
            {activeTab === 'quick' 
              ? 'Hover over grid to select table size, then click to insert'
              : 'Select a template to get started with pre-configured tables'
            }
          </p>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs rounded transition-colors"
            style={{
              backgroundColor: theme.colors.semantic.surface.primary,
              borderColor: theme.colors.semantic.border.primary,
              color: theme.colors.semantic.text.secondary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.semantic.surface.primary;
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsertMenu;