import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { 
  AdvancedTableData, 
  TableCell, 
  TableColumn, 
  TableRow, 
  TableSelection, 
  TableSettings,
  CellStyle
} from '../types/table.types';
import { TableOperation } from '../types/operation.types';

// Table State Interface
export interface TableState {
  data: AdvancedTableData;
  selection: TableSelection;
  editingCell: string | null;
  dragState: {
    isDragging: boolean;
    dragType: 'column' | 'row' | 'cell' | null;
    dragSource: string | null;
    dragTarget: string | null;
  };
  resizeState: {
    isResizing: boolean;
    resizeType: 'column' | 'row' | null;
    resizeTarget: string | null;
    startPosition: { x: number; y: number } | null;
    startSize: number | null;
  };
  contextMenu: {
    isOpen: boolean;
    position: { x: number; y: number } | null;
    target: string | null;
    type: 'cell' | 'row' | 'column' | 'table' | null;
  };
  clipboard: {
    data: any;
    type: 'cut' | 'copy' | null;
    source: string[] | null;
  };
  undoRedo: {
    undoStack: TableOperation[];
    redoStack: TableOperation[];
    maxStackSize: number;
    currentIndex: number;
    canUndo: boolean;
    canRedo: boolean;
  };
  ui: {
    showFormatPanel: boolean;
    showValidationPanel: boolean;
    showTemplatePanel: boolean;
    showSettingsPanel: boolean;
    activeTab: string;
    loading: boolean;
    error: string | null;
  };
  filters: { [columnId: string]: any };
  sorting: Array<{ columnId: string; direction: 'asc' | 'desc'; priority: number }>;
  grouping: { [columnId: string]: any };
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalRows: number;
  };
}

// Action Types
export type TableAction =
  | { type: 'SET_DATA'; payload: AdvancedTableData }
  | { type: 'UPDATE_CELL'; payload: { cellId: string; updates: Partial<TableCell> } }
  | { type: 'UPDATE_CELLS'; payload: { cellIds: string[]; updates: Partial<TableCell> } }
  | { type: 'INSERT_ROW'; payload: { afterRowId?: string; row: Partial<TableRow> } }
  | { type: 'INSERT_COLUMN'; payload: { afterColumnId?: string; column: Partial<TableColumn> } }
  | { type: 'DELETE_ROW'; payload: { rowId: string } }
  | { type: 'DELETE_COLUMN'; payload: { columnId: string } }
  | { type: 'UPDATE_COLUMN'; payload: { columnId: string; updates: Partial<TableColumn> } }
  | { type: 'UPDATE_ROW'; payload: { rowId: string; updates: Partial<TableRow> } }
  | { type: 'SET_SELECTION'; payload: TableSelection }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_EDITING_CELL'; payload: string | null }
  | { type: 'START_DRAG'; payload: { type: 'column' | 'row' | 'cell'; source: string } }
  | { type: 'UPDATE_DRAG'; payload: { target: string } }
  | { type: 'END_DRAG' }
  | { type: 'START_RESIZE'; payload: { type: 'column' | 'row'; target: string; position: { x: number; y: number }; size: number } }
  | { type: 'UPDATE_RESIZE'; payload: { position: { x: number; y: number } } }
  | { type: 'END_RESIZE'; payload: { newSize: number } }
  | { type: 'SHOW_CONTEXT_MENU'; payload: { position: { x: number; y: number }; target: string; type: 'cell' | 'row' | 'column' | 'table' } }
  | { type: 'HIDE_CONTEXT_MENU' }
  | { type: 'SET_CLIPBOARD'; payload: { data: any; type: 'cut' | 'copy'; source: string[] } }
  | { type: 'CLEAR_CLIPBOARD' }
  | { type: 'UNDO'; payload: TableOperation }
  | { type: 'REDO'; payload: TableOperation }
  | { type: 'ADD_OPERATION'; payload: TableOperation }
  | { type: 'TOGGLE_PANEL'; payload: { panel: 'format' | 'validation' | 'template' | 'settings' } }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: { [columnId: string]: any } }
  | { type: 'SET_SORTING'; payload: Array<{ columnId: string; direction: 'asc' | 'desc'; priority: number }> }
  | { type: 'SET_GROUPING'; payload: { [columnId: string]: any } }
  | { type: 'SET_PAGINATION'; payload: Partial<TableState['pagination']> }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TableSettings> }
  | { type: 'APPLY_FORMATTING'; payload: { cellIds: string[]; style: Partial<CellStyle> } }
  | { type: 'MERGE_CELLS'; payload: { cellIds: string[]; primaryCellId: string } }
  | { type: 'SPLIT_CELLS'; payload: { cellId: string; rows: number; columns: number } }
  | { type: 'RESET_TABLE' };

// Initial State
export const createInitialTableState = (initialData?: Partial<AdvancedTableData>): TableState => ({
  data: {
    id: 'table-' + Date.now(),
    columns: [],
    rows: [],
    metadata: {
      id: 'table-' + Date.now(),
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
    },
    ...initialData
  },
  selection: {
    type: 'cell',
    cells: [],
    rows: [],
    columns: [],
    ranges: []
  },
  editingCell: null,
  dragState: {
    isDragging: false,
    dragType: null,
    dragSource: null,
    dragTarget: null
  },
  resizeState: {
    isResizing: false,
    resizeType: null,
    resizeTarget: null,
    startPosition: null,
    startSize: null
  },
  contextMenu: {
    isOpen: false,
    position: null,
    target: null,
    type: null
  },
  clipboard: {
    data: null,
    type: null,
    source: null
  },
  undoRedo: {
    undoStack: [],
    redoStack: [],
    maxStackSize: 50,
    currentIndex: -1,
    canUndo: false,
    canRedo: false
  },
  ui: {
    showFormatPanel: false,
    showValidationPanel: false,
    showTemplatePanel: false,
    showSettingsPanel: false,
    activeTab: 'data',
    loading: false,
    error: null
  },
  filters: {},
  sorting: [],
  grouping: {},
  pagination: {
    currentPage: 1,
    pageSize: 50,
    totalPages: 1,
    totalRows: 0
  }
});

// Table Reducer
export const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case 'SET_DATA':
      return {
        ...state,
        data: action.payload,
        pagination: {
          ...state.pagination,
          totalRows: action.payload.rows.length,
          totalPages: Math.ceil(action.payload.rows.length / state.pagination.pageSize)
        }
      };

    case 'UPDATE_CELL': {
      const { cellId, updates } = action.payload;
      const newRows = state.data.rows.map(row => {
        const newCells = { ...row.cells };
        if (newCells[cellId.split('-')[2]]) {
          newCells[cellId.split('-')[2]] = { ...newCells[cellId.split('-')[2]], ...updates };
        }
        return { ...row, cells: newCells };
      });
      
      return {
        ...state,
        data: {
          ...state.data,
          rows: newRows,
          metadata: {
            ...state.data.metadata,
            updated: new Date(),
            version: state.data.metadata.version + 1
          }
        }
      };
    }

    case 'SET_SELECTION':
      return { ...state, selection: action.payload };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: {
          type: 'cell',
          cells: [],
          rows: [],
          columns: [],
          ranges: []
        }
      };

    case 'SET_EDITING_CELL':
      return { ...state, editingCell: action.payload };

    case 'TOGGLE_PANEL':
      const panelKey = `show${action.payload.panel.charAt(0).toUpperCase() + action.payload.panel.slice(1)}Panel` as keyof TableState['ui'];
      return {
        ...state,
        ui: {
          ...state.ui,
          [panelKey]: !state.ui[panelKey]
        }
      };

    case 'SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, loading: action.payload }
      };

    case 'SET_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: action.payload }
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        data: {
          ...state.data,
          settings: { ...state.data.settings, ...action.payload }
        }
      };

    case 'UPDATE_COLUMN': {
      const { columnId, updates } = action.payload;
      const newColumns = state.data.columns.map(column =>
        column.id === columnId ? { ...column, ...updates } : column
      );
      
      return {
        ...state,
        data: {
          ...state.data,
          columns: newColumns,
          metadata: {
            ...state.data.metadata,
            updated: new Date(),
            version: state.data.metadata.version + 1
          }
        }
      };
    }

    case 'UPDATE_ROW': {
      const { rowId, updates } = action.payload;
      const newRows = state.data.rows.map(row =>
        row.id === rowId ? { ...row, ...updates } : row
      );
      
      return {
        ...state,
        data: {
          ...state.data,
          rows: newRows,
          metadata: {
            ...state.data.metadata,
            updated: new Date(),
            version: state.data.metadata.version + 1
          }
        }
      };
    }

    default:
      return state;
  }
};

// Context
export interface TableContextValue {
  state: TableState;
  dispatch: React.Dispatch<TableAction>;
  
  // Convenience methods
  updateCell: (cellId: string, updates: Partial<TableCell>) => void;
  updateCells: (cellIds: string[], updates: Partial<TableCell>) => void;
  setSelection: (selection: TableSelection) => void;
  clearSelection: () => void;
  startEditing: (cellId: string) => void;
  stopEditing: () => void;
  showContextMenu: (position: { x: number; y: number }, target: string, type: 'cell' | 'row' | 'column' | 'table') => void;
  hideContextMenu: () => void;
  togglePanel: (panel: 'format' | 'validation' | 'template' | 'settings') => void;
  applyFormatting: (cellIds: string[], style: Partial<CellStyle>) => void;
  insertRow: (afterRowId?: string, row?: Partial<TableRow>) => void;
  insertColumn: (afterColumnId?: string, column?: Partial<TableColumn>) => void;
  deleteRow: (rowId: string) => void;
  deleteColumn: (columnId: string) => void;
  updateColumn: (columnId: string, updates: Partial<TableColumn>) => void;
  updateRow: (rowId: string, updates: Partial<TableRow>) => void;
  mergeCells: (cellIds: string[], primaryCellId: string) => void;
  splitCells: (cellId: string, rows: number, columns: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const TableContext = createContext<TableContextValue | null>(null);

// Provider Component
export interface TableProviderProps {
  children: React.ReactNode;
  initialData?: Partial<AdvancedTableData>;
  onChange?: (data: AdvancedTableData) => void;
}

export const TableProvider: React.FC<TableProviderProps> = ({
  children,
  initialData,
  onChange
}) => {
  const [state, dispatch] = useReducer(tableReducer, createInitialTableState(initialData));

  // Effect to call onChange when data changes
  React.useEffect(() => {
    if (onChange) {
      onChange(state.data);
    }
  }, [state.data, onChange]);

  // Convenience methods
  const updateCell = useCallback((cellId: string, updates: Partial<TableCell>) => {
    dispatch({ type: 'UPDATE_CELL', payload: { cellId, updates } });
  }, []);

  const updateCells = useCallback((cellIds: string[], updates: Partial<TableCell>) => {
    dispatch({ type: 'UPDATE_CELLS', payload: { cellIds, updates } });
  }, []);

  const setSelection = useCallback((selection: TableSelection) => {
    dispatch({ type: 'SET_SELECTION', payload: selection });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const startEditing = useCallback((cellId: string) => {
    dispatch({ type: 'SET_EDITING_CELL', payload: cellId });
  }, []);

  const stopEditing = useCallback(() => {
    dispatch({ type: 'SET_EDITING_CELL', payload: null });
  }, []);

  const showContextMenu = useCallback((position: { x: number; y: number }, target: string, type: 'cell' | 'row' | 'column' | 'table') => {
    dispatch({ type: 'SHOW_CONTEXT_MENU', payload: { position, target, type } });
  }, []);

  const hideContextMenu = useCallback(() => {
    dispatch({ type: 'HIDE_CONTEXT_MENU' });
  }, []);

  const togglePanel = useCallback((panel: 'format' | 'validation' | 'template' | 'settings') => {
    dispatch({ type: 'TOGGLE_PANEL', payload: { panel } });
  }, []);

  const applyFormatting = useCallback((cellIds: string[], style: Partial<CellStyle>) => {
    dispatch({ type: 'APPLY_FORMATTING', payload: { cellIds, style } });
  }, []);

  const insertRow = useCallback((afterRowId?: string, row?: Partial<TableRow>) => {
    dispatch({ type: 'INSERT_ROW', payload: { afterRowId, row: row || {} } });
  }, []);

  const insertColumn = useCallback((afterColumnId?: string, column?: Partial<TableColumn>) => {
    dispatch({ type: 'INSERT_COLUMN', payload: { afterColumnId, column: column || {} } });
  }, []);

  const deleteRow = useCallback((rowId: string) => {
    dispatch({ type: 'DELETE_ROW', payload: { rowId } });
  }, []);

  const deleteColumn = useCallback((columnId: string) => {
    dispatch({ type: 'DELETE_COLUMN', payload: { columnId } });
  }, []);

  const updateColumn = useCallback((columnId: string, updates: Partial<TableColumn>) => {
    dispatch({ type: 'UPDATE_COLUMN', payload: { columnId, updates } });
  }, []);

  const updateRow = useCallback((rowId: string, updates: Partial<TableRow>) => {
    dispatch({ type: 'UPDATE_ROW', payload: { rowId, updates } });
  }, []);

  const mergeCells = useCallback((cellIds: string[], primaryCellId: string) => {
    dispatch({ type: 'MERGE_CELLS', payload: { cellIds, primaryCellId } });
  }, []);

  const splitCells = useCallback((cellId: string, rows: number, columns: number) => {
    dispatch({ type: 'SPLIT_CELLS', payload: { cellId, rows, columns } });
  }, []);

  const undo = useCallback(() => {
    if (state.undoRedo.canUndo && state.undoRedo.undoStack.length > 0) {
      const operation = state.undoRedo.undoStack[state.undoRedo.undoStack.length - 1];
      dispatch({ type: 'UNDO', payload: operation });
    }
  }, [state.undoRedo]);

  const redo = useCallback(() => {
    if (state.undoRedo.canRedo && state.undoRedo.redoStack.length > 0) {
      const operation = state.undoRedo.redoStack[state.undoRedo.redoStack.length - 1];
      dispatch({ type: 'REDO', payload: operation });
    }
  }, [state.undoRedo]);

  const canUndo = useCallback(() => {
    return state.undoRedo.canUndo;
  }, [state.undoRedo.canUndo]);

  const canRedo = useCallback(() => {
    return state.undoRedo.canRedo;
  }, [state.undoRedo.canRedo]);

  const contextValue = useMemo<TableContextValue>(() => ({
    state,
    dispatch,
    updateCell,
    updateCells,
    setSelection,
    clearSelection,
    startEditing,
    stopEditing,
    showContextMenu,
    hideContextMenu,
    togglePanel,
    applyFormatting,
    insertRow,
    insertColumn,
    deleteRow,
    deleteColumn,
    updateColumn,
    updateRow,
    mergeCells,
    splitCells,
    undo,
    redo,
    canUndo,
    canRedo
  }), [
    state,
    updateCell,
    updateCells,
    setSelection,
    clearSelection,
    startEditing,
    stopEditing,
    showContextMenu,
    hideContextMenu,
    togglePanel,
    applyFormatting,
    insertRow,
    insertColumn,
    deleteRow,
    deleteColumn,
    updateColumn,
    updateRow,
    mergeCells,
    splitCells,
    undo,
    redo,
    canUndo,
    canRedo
  ]);

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
};

// Hook to use table context
export const useTable = (): TableContextValue => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTable must be used within a TableProvider');
  }
  return context;
};