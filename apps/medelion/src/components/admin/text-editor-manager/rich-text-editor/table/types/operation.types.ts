import { TableCell, TableColumn, TableRow, CellStyle } from './table.types';

export type OperationType = 'insert' | 'delete' | 'update' | 'move' | 'copy' | 'paste' | 'merge' | 'split' | 'format' | 'sort' | 'filter' | 'resize' | 'reorder';
export type OperationScope = 'cell' | 'row' | 'column' | 'range' | 'table';
export type OperationStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface OperationTarget {
  type: OperationScope;
  ids: string[];
  range?: {
    startRow: number;
    endRow: number;
    startColumn: number;
    endColumn: number;
  };
  coordinates?: {
    row: number;
    column: number;
  };
}

export interface OperationPayload {
  [key: string]: any;
}

export interface TableOperation {
  id: string;
  type: OperationType;
  scope: OperationScope;
  target: OperationTarget;
  payload: OperationPayload;
  timestamp: Date;
  user?: string;
  description?: string;
  reversible: boolean;
  status: OperationStatus;
  error?: string;
  metadata?: {
    duration?: number;
    affectedCells?: number;
    dataSize?: number;
    dependencies?: string[];
  };
}

export interface UndoRedoState {
  undoStack: TableOperation[];
  redoStack: TableOperation[];
  maxStackSize: number;
  currentIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  lastOperation?: TableOperation;
}

export interface BatchOperation {
  id: string;
  operations: TableOperation[];
  description: string;
  timestamp: Date;
  status: OperationStatus;
  progress: number;
  total: number;
  results: Array<{
    operationId: string;
    success: boolean;
    error?: string;
    result?: any;
  }>;
}

// Specific operation interfaces
export interface InsertRowOperation {
  type: 'insert';
  scope: 'row';
  target: {
    type: 'row';
    insertAfter?: string;
    insertBefore?: string;
    position?: number;
  };
  payload: {
    rows: Partial<TableRow>[];
    copyFrom?: string;
    template?: string;
  };
}

export interface InsertColumnOperation {
  type: 'insert';
  scope: 'column';
  target: {
    type: 'column';
    insertAfter?: string;
    insertBefore?: string;
    position?: number;
  };
  payload: {
    columns: Partial<TableColumn>[];
    copyFrom?: string;
    template?: string;
  };
}

export interface DeleteRowOperation {
  type: 'delete';
  scope: 'row';
  target: {
    type: 'row';
    ids: string[];
  };
  payload: {
    backup?: TableRow[];
    cascade?: boolean;
  };
}

export interface DeleteColumnOperation {
  type: 'delete';
  scope: 'column';
  target: {
    type: 'column';
    ids: string[];
  };
  payload: {
    backup?: TableColumn[];
    cascade?: boolean;
  };
}

export interface UpdateCellOperation {
  type: 'update';
  scope: 'cell';
  target: {
    type: 'cell';
    ids: string[];
  };
  payload: {
    changes: { [cellId: string]: Partial<TableCell> };
    backup?: { [cellId: string]: TableCell };
    validateOnUpdate?: boolean;
  };
}

export interface FormatOperation {
  type: 'format';
  scope: OperationScope;
  target: OperationTarget;
  payload: {
    style: Partial<CellStyle>;
    backup?: { [id: string]: CellStyle };
    replace?: boolean;
    merge?: boolean;
  };
}

export interface MergeCellsOperation {
  type: 'merge';
  scope: 'range';
  target: {
    type: 'range';
    range: {
      startRow: number;
      endRow: number;
      startColumn: number;
      endColumn: number;
    };
  };
  payload: {
    primaryCell: string;
    mergedCells: string[];
    backup?: { [cellId: string]: TableCell };
    content?: string;
    style?: CellStyle;
  };
}

export interface SplitCellsOperation {
  type: 'split';
  scope: 'cell';
  target: {
    type: 'cell';
    ids: string[];
  };
  payload: {
    splitConfig: {
      rows?: number;
      columns?: number;
      distributeContent?: boolean;
      distributeStyle?: boolean;
    };
    backup?: { [cellId: string]: TableCell };
  };
}

export interface MoveOperation {
  type: 'move';
  scope: OperationScope;
  target: OperationTarget;
  payload: {
    destination: {
      row?: number;
      column?: number;
      position?: number;
    };
    backup?: {
      originalPositions: { [id: string]: number };
      originalData?: any;
    };
  };
}

export interface CopyPasteOperation {
  type: 'copy' | 'paste';
  scope: OperationScope;
  target: OperationTarget;
  payload: {
    data?: any;
    format?: 'values' | 'formulas' | 'formats' | 'all';
    clipboard?: {
      data: any;
      format: string;
      timestamp: Date;
    };
    destination?: OperationTarget;
    backup?: any;
  };
}

export interface SortOperation {
  type: 'sort';
  scope: 'table' | 'column';
  target: OperationTarget;
  payload: {
    columns: Array<{
      columnId: string;
      direction: 'asc' | 'desc';
      priority: number;
      customSort?: (a: any, b: any) => number;
    }>;
    backup?: {
      originalOrder: string[];
      originalData?: any;
    };
    stableSort?: boolean;
  };
}

export interface FilterOperation {
  type: 'filter';
  scope: 'table';
  target: {
    type: 'table';
  };
  payload: {
    filters: { [columnId: string]: any };
    backup?: {
      visibleRows: string[];
      hiddenRows: string[];
    };
    operator?: 'AND' | 'OR';
    caseSensitive?: boolean;
  };
}

export interface ResizeOperation {
  type: 'resize';
  scope: 'row' | 'column';
  target: OperationTarget;
  payload: {
    dimensions: { [id: string]: number };
    backup?: { [id: string]: number };
    autoFit?: boolean;
    maintainRatio?: boolean;
  };
}

export interface ReorderOperation {
  type: 'reorder';
  scope: 'row' | 'column';
  target: OperationTarget;
  payload: {
    newOrder: string[];
    backup?: {
      originalOrder: string[];
      originalPositions: { [id: string]: number };
    };
  };
}

// Operation factory interface
export interface OperationFactory {
  createInsertRowOperation(target: any, payload: any): InsertRowOperation;
  createInsertColumnOperation(target: any, payload: any): InsertColumnOperation;
  createDeleteRowOperation(target: any, payload: any): DeleteRowOperation;
  createDeleteColumnOperation(target: any, payload: any): DeleteColumnOperation;
  createUpdateCellOperation(target: any, payload: any): UpdateCellOperation;
  createFormatOperation(target: any, payload: any): FormatOperation;
  createMergeCellsOperation(target: any, payload: any): MergeCellsOperation;
  createSplitCellsOperation(target: any, payload: any): SplitCellsOperation;
  createMoveOperation(target: any, payload: any): MoveOperation;
  createCopyPasteOperation(target: any, payload: any): CopyPasteOperation;
  createSortOperation(target: any, payload: any): SortOperation;
  createFilterOperation(target: any, payload: any): FilterOperation;
  createResizeOperation(target: any, payload: any): ResizeOperation;
  createReorderOperation(target: any, payload: any): ReorderOperation;
}

// Operation executor interface
export interface OperationExecutor {
  execute(operation: TableOperation): Promise<any>;
  undo(operation: TableOperation): Promise<any>;
  redo(operation: TableOperation): Promise<any>;
  batch(operations: TableOperation[]): Promise<BatchOperation>;
  validate(operation: TableOperation): boolean;
  canExecute(operation: TableOperation): boolean;
  canUndo(operation: TableOperation): boolean;
  canRedo(operation: TableOperation): boolean;
}

// Operation history interface
export interface OperationHistory {
  operations: TableOperation[];
  undoRedoState: UndoRedoState;
  batchOperations: BatchOperation[];
  
  add(operation: TableOperation): void;
  remove(operationId: string): void;
  clear(): void;
  undo(): Promise<TableOperation | null>;
  redo(): Promise<TableOperation | null>;
  canUndo(): boolean;
  canRedo(): boolean;
  getUndoOperation(): TableOperation | null;
  getRedoOperation(): TableOperation | null;
  compress(): void;
  export(): any;
  import(data: any): void;
}