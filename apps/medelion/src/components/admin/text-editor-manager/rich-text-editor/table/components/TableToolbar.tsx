import React, { memo, useCallback, useState } from 'react';
import { useTheme } from '@/theme';
import {
  Plus, Minus, Trash2, Copy, Clipboard, Scissors, Undo, Redo,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  AlignJustify, Type, Palette, Merge, Split, Grid,
  Download, Upload, Settings, Filter, ArrowUpDown, Search,
  Table, Columns, Rows, ChevronDown, MoreHorizontal,
  Calculator, Lock, Eye, EyeOff, Star, Tag
} from 'lucide-react';

export interface TableToolbarProps {
  onInsertRow?: () => void;
  onInsertColumn?: () => void;
  onDeleteRow?: () => void;
  onDeleteColumn?: () => void;
  onMergeCells?: () => void;
  onSplitCells?: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onCut?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignJustify?: () => void;
  onShowFormatPanel?: () => void;
  onShowSettings?: () => void;
  onShowFilters?: () => void;
  onShowSort?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onResizeToFit?: () => void;
  onAutoHeight?: () => void;
  onFreezeColumns?: () => void;
  onFreezeRows?: () => void;
  onInsertFormula?: () => void;
  onInsertFunction?: () => void;
  onValidateData?: () => void;
  onFormatNumbers?: () => void;
  onAddConditionalFormat?: () => void;
  onProtectCells?: () => void;
  onHideColumns?: () => void;
  onHideRows?: () => void;
  selectedCellsCount?: number;
  selectedColumnsCount?: number;
  selectedRowsCount?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  canMerge?: boolean;
  canSplit?: boolean;
  canDelete?: boolean;
  canFreeze?: boolean;
  hasHiddenElements?: boolean;
  tableStats?: {
    rows: number;
    columns: number;
    cells: number;
    nonEmptyCells: number;
  };
  className?: string;
}

export const TableToolbar = memo<TableToolbarProps>(({
  onInsertRow,
  onInsertColumn,
  onDeleteRow,
  onDeleteColumn,
  onMergeCells,
  onSplitCells,
  onCopy,
  onPaste,
  onCut,
  onUndo,
  onRedo,
  onBold,
  onItalic,
  onUnderline,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignJustify,
  onShowFormatPanel,
  onShowSettings,
  onShowFilters,
  onShowSort,
  onExport,
  onImport,
  onResizeToFit,
  onAutoHeight,
  onFreezeColumns,
  onFreezeRows,
  onInsertFormula,
  onInsertFunction,
  onValidateData,
  onFormatNumbers,
  onAddConditionalFormat,
  onProtectCells,
  onHideColumns,
  onHideRows,
  selectedCellsCount = 0,
  selectedColumnsCount = 0,
  selectedRowsCount = 0,
  canUndo = false,
  canRedo = false,
  canMerge = false,
  canSplit = false,
  canDelete = false,
  canFreeze = false,
  hasHiddenElements = false,
  tableStats,
  className = ''
}) => {
  const { theme } = useTheme();
  const [showMoreActions, setShowMoreActions] = useState(false);

  const ToolbarButton = useCallback(({ 
    icon: Icon, 
    onClick, 
    disabled = false, 
    title, 
    variant = 'default',
    size = 'default'
  }: {
    icon: React.ElementType;
    onClick?: () => void;
    disabled?: boolean;
    title: string;
    variant?: 'default' | 'primary' | 'danger';
    size?: 'default' | 'small';
  }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
    const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-9 h-9';
    const variantClasses = {
      default: disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-opacity-10 hover:bg-gray-500',
      primary: disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-opacity-20 hover:bg-blue-500',
      danger: disabled 
        ? 'opacity-50 cursor-not-allowed' 
        : 'hover:bg-opacity-20 hover:bg-red-500'
    };

    return (
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        title={title}
        className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]}`}
        style={{
          color: variant === 'danger' && !disabled 
            ? theme.colors.semantic.status.error 
            : theme.colors.semantic.text.primary
        }}
      >
        <Icon className={size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} />
      </button>
    );
  }, [theme]);

  const ToolbarSeparator = useCallback(() => (
    <div 
      className="w-px h-6 mx-1"
      style={{ backgroundColor: theme.colors.semantic.border.primary }}
    />
  ), [theme]);

  const ToolbarGroup = useCallback(({ children, label }: { children: React.ReactNode; label?: string }) => (
    <div className="flex items-center space-x-1" title={label}>
      {children}
    </div>
  ), []);

  return (
    <div 
      className={`flex items-center justify-between p-3 border-b space-x-2 ${className}`}
      style={{ 
        backgroundColor: theme.colors.semantic.surface.secondary,
        borderColor: theme.colors.semantic.border.primary 
      }}
    >
      {/* Primary Actions */}
      <div className="flex items-center space-x-3">
        {/* Insert/Delete Group */}
        <ToolbarGroup label="Insert & Delete">
          <ToolbarButton
            icon={Plus}
            onClick={onInsertRow}
            title="Insert Row"
            variant="primary"
          />
          <ToolbarButton
            icon={Columns}
            onClick={onInsertColumn}
            title="Insert Column"
            variant="primary"
          />
          <ToolbarButton
            icon={Trash2}
            onClick={onDeleteRow}
            disabled={!canDelete}
            title="Delete Row"
            variant="danger"
          />
          <ToolbarButton
            icon={Minus}
            onClick={onDeleteColumn}
            disabled={!canDelete}
            title="Delete Column"
            variant="danger"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Edit Group */}
        <ToolbarGroup label="Edit">
          <ToolbarButton
            icon={Copy}
            onClick={onCopy}
            disabled={selectedCellsCount === 0}
            title="Copy"
          />
          <ToolbarButton
            icon={Scissors}
            onClick={onCut}
            disabled={selectedCellsCount === 0}
            title="Cut"
          />
          <ToolbarButton
            icon={Clipboard}
            onClick={onPaste}
            title="Paste"
          />
          <ToolbarButton
            icon={Undo}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          />
          <ToolbarButton
            icon={Redo}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Format Group */}
        <ToolbarGroup label="Format">
          <ToolbarButton
            icon={Bold}
            onClick={onBold}
            disabled={selectedCellsCount === 0}
            title="Bold"
          />
          <ToolbarButton
            icon={Italic}
            onClick={onItalic}
            disabled={selectedCellsCount === 0}
            title="Italic"
          />
          <ToolbarButton
            icon={Underline}
            onClick={onUnderline}
            disabled={selectedCellsCount === 0}
            title="Underline"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Alignment Group */}
        <ToolbarGroup label="Alignment">
          <ToolbarButton
            icon={AlignLeft}
            onClick={onAlignLeft}
            disabled={selectedCellsCount === 0}
            title="Align Left"
          />
          <ToolbarButton
            icon={AlignCenter}
            onClick={onAlignCenter}
            disabled={selectedCellsCount === 0}
            title="Align Center"
          />
          <ToolbarButton
            icon={AlignRight}
            onClick={onAlignRight}
            disabled={selectedCellsCount === 0}
            title="Align Right"
          />
          <ToolbarButton
            icon={AlignJustify}
            onClick={onAlignJustify}
            disabled={selectedCellsCount === 0}
            title="Justify"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Advanced Operations */}
        <ToolbarGroup label="Advanced">
          <ToolbarButton
            icon={Merge}
            onClick={onMergeCells}
            disabled={!canMerge}
            title="Merge Cells"
          />
          <ToolbarButton
            icon={Split}
            onClick={onSplitCells}
            disabled={!canSplit}
            title="Split Cells"
          />
          <ToolbarButton
            icon={Calculator}
            onClick={onInsertFormula}
            disabled={selectedCellsCount === 0}
            title="Insert Formula"
          />
          
          {/* More Actions Dropdown */}
          <div className="relative">
            <ToolbarButton
              icon={MoreHorizontal}
              onClick={() => setShowMoreActions(!showMoreActions)}
              title="More Actions"
            />
            {showMoreActions && (
              <div 
                className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[180px]"
                style={{ backgroundColor: theme.colors.semantic.surface.primary }}
              >
                <div className="py-1">
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onResizeToFit?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Grid className="w-4 h-4" />
                    Resize to Fit
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onAutoHeight?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Rows className="w-4 h-4" />
                    Auto Height
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onFreezeColumns?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Columns className="w-4 h-4" />
                    Freeze Columns
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onFreezeRows?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Rows className="w-4 h-4" />
                    Freeze Rows
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onHideColumns?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide Columns
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onHideRows?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide Rows
                  </button>
                  <hr className="my-1" />
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onProtectCells?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Lock className="w-4 h-4" />
                    Protect Cells
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    onClick={() => {
                      onAddConditionalFormat?.();
                      setShowMoreActions(false);
                    }}
                  >
                    <Tag className="w-4 h-4" />
                    Conditional Format
                  </button>
                </div>
              </div>
            )}
          </div>
        </ToolbarGroup>
      </div>

      {/* Right Side - Information and Advanced Controls */}
      <div className="flex items-center space-x-4">
        {/* Table Statistics */}
        {tableStats && (
          <div className="flex items-center space-x-3 text-xs" style={{ color: theme.colors.semantic.text.secondary }}>
            <span>{tableStats.rows}×{tableStats.columns}</span>
            <span>•</span>
            <span>{tableStats.nonEmptyCells}/{tableStats.cells} filled</span>
            {selectedCellsCount > 0 && (
              <>
                <span>•</span>
                <span className="font-medium" style={{ color: theme.colors.semantic.action.primary }}>
                  {selectedCellsCount} selected
                </span>
              </>
            )}
          </div>
        )}

        <ToolbarSeparator />

        {/* Data Operations */}
        <ToolbarGroup label="Data & Analysis">
          <ToolbarButton
            icon={ArrowUpDown}
            onClick={onShowSort}
            title="Sort Data"
          />
          <ToolbarButton
            icon={Filter}
            onClick={onShowFilters}
            title="Filter Data"
          />
          <ToolbarButton
            icon={Calculator}
            onClick={onInsertFunction}
            title="Functions"
          />
          {hasHiddenElements && (
            <ToolbarButton
              icon={Eye}
              onClick={() => {}}
              title="Show Hidden Elements"
            />
          )}
        </ToolbarGroup>

        <ToolbarSeparator />

        {/* Settings and Export */}
        <ToolbarGroup label="Settings">
          <ToolbarButton
            icon={Palette}
            onClick={onShowFormatPanel}
            title="Format Panel"
          />
          <ToolbarButton
            icon={Settings}
            onClick={onShowSettings}
            title="Table Settings"
          />
          <ToolbarButton
            icon={Download}
            onClick={onExport}
            title="Export Table"
          />
        </ToolbarGroup>
      </div>
    </div>
  );
});

TableToolbar.displayName = 'TableToolbar';

export default TableToolbar;