import { useState, useCallback, useRef, useEffect } from 'react';
import { EditorOperationsAdvanced, TableOperationsAdvanced } from '../utils/contextMenuConfigs';
import { createAdvancedEditorOperations, createAdvancedTableOperations } from '../utils/advancedOperations';

export interface ContextMenuState {
  isVisible: boolean;
  position: { x: number; y: number };
  contextType: 'editor' | 'table';
}

export const useAdvancedContextMenu = (editorRef: React.RefObject<HTMLDivElement | null>) => {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    contextType: 'editor'
  });

  const selectedCellRef = useRef<HTMLTableCellElement | null>(null);
  const [operations, setOperations] = useState<{
    editor: EditorOperationsAdvanced | null;
    table: TableOperationsAdvanced | null;
  }>({
    editor: null,
    table: null
  });

  // Initialize operations
  useEffect(() => {
    const editorOps = createAdvancedEditorOperations(editorRef);
    setOperations(prev => ({
      ...prev,
      editor: editorOps
    }));
  }, [editorRef]);

  const detectContextType = useCallback((target: EventTarget | null): 'editor' | 'table' => {
    if (!target || !(target instanceof HTMLElement)) {
      return 'editor';
    }

    // Check if clicked element is inside a table
    const tableCell = target.closest('td, th') as HTMLTableCellElement;
    if (tableCell) {
      selectedCellRef.current = tableCell;
      return 'table';
    }

    selectedCellRef.current = null;
    return 'editor';
  }, []);

  const showContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const contextType = detectContextType(event.target);
    
    // Update table operations if context is table
    if (contextType === 'table') {
      const tableOps = createAdvancedTableOperations(selectedCellRef.current);
      setOperations(prev => ({
        ...prev,
        table: tableOps
      }));
    }

    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      contextType
    });
  }, [detectContextType]);

  const hideContextMenu = useCallback(() => {
    setContextMenu(prev => ({
      ...prev,
      isVisible: false
    }));
    // Clear selected cell reference when hiding menu
    setTimeout(() => {
      selectedCellRef.current = null;
    }, 100);
  }, []);

  const getCurrentOperations = useCallback(() => {
    return contextMenu.contextType === 'table' ? operations.table : operations.editor;
  }, [contextMenu.contextType, operations]);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    getCurrentOperations,
    selectedCell: selectedCellRef.current
  };
};