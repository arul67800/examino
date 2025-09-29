'use client';

import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Table, Plus, Minus, MoreHorizontal } from 'lucide-react';
import { useTheme } from '../../../../../../theme/context';
import { FormatButton } from './format-button';

interface TableControlsProps {
  editor: Editor;
}

export const TableControls: React.FC<TableControlsProps> = ({ editor }) => {
  const { theme } = useTheme();
  const [showTableMenu, setShowTableMenu] = useState(false);

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    setShowTableMenu(false);
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
    setShowTableMenu(false);
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
    setShowTableMenu(false);
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
    setShowTableMenu(false);
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
    setShowTableMenu(false);
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
    setShowTableMenu(false);
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
    setShowTableMenu(false);
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
    setShowTableMenu(false);
  };

  const isInTable = editor.isActive('table');

  return (
    <div className="relative">
      <FormatButton
        onClick={() => setShowTableMenu(!showTableMenu)}
        isActive={isInTable}
        title="Table"
      >
        <Table size={16} />
      </FormatButton>

      {showTableMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setShowTableMenu(false)}
          />
          
          {/* Table Menu */}
          <div 
            className="absolute top-full left-0 mt-1 min-w-[180px] rounded-md shadow-lg border z-20"
            style={{
              backgroundColor: theme.colors.semantic.surface.elevated,
              borderColor: theme.colors.semantic.border.secondary,
            }}
          >
            {!isInTable ? (
              <button
                onClick={insertTable}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50 rounded-md"
                style={{ color: theme.colors.semantic.text.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Table size={14} />
                <span>Insert Table</span>
              </button>
            ) : (
              <div className="py-1">
                <div className="px-3 py-1 text-xs font-medium border-b" style={{ 
                  color: theme.colors.semantic.text.secondary,
                  borderColor: theme.colors.semantic.border.secondary 
                }}>
                  Table Actions
                </div>
                
                <button
                  onClick={addColumnBefore}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.text.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Plus size={14} />
                  <span>Add Column Before</span>
                </button>
                
                <button
                  onClick={addColumnAfter}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.text.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Plus size={14} />
                  <span>Add Column After</span>
                </button>
                
                <button
                  onClick={deleteColumn}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.status.error }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Minus size={14} />
                  <span>Delete Column</span>
                </button>
                
                <div className="border-t my-1" style={{ borderColor: theme.colors.semantic.border.secondary }} />
                
                <button
                  onClick={addRowBefore}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.text.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Plus size={14} />
                  <span>Add Row Before</span>
                </button>
                
                <button
                  onClick={addRowAfter}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.text.primary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Plus size={14} />
                  <span>Add Row After</span>
                </button>
                
                <button
                  onClick={deleteRow}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.status.error }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Minus size={14} />
                  <span>Delete Row</span>
                </button>
                
                <div className="border-t my-1" style={{ borderColor: theme.colors.semantic.border.secondary }} />
                
                <button
                  onClick={deleteTable}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-opacity-50"
                  style={{ color: theme.colors.semantic.status.error }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.semantic.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Minus size={14} />
                  <span>Delete Table</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};