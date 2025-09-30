// Advanced Context Menu System - Main Entry Point
export { AdvancedContextMenu } from './components/AdvancedContextMenu';
export type { ContextMenuItem } from './components/AdvancedContextMenu';

export { 
  createEditorContextMenu, 
  createTableContextMenu,
  type EditorOperationsAdvanced,
  type TableOperationsAdvanced 
} from './utils/contextMenuConfigs';

export { 
  createAdvancedEditorOperations, 
  createAdvancedTableOperations 
} from './utils/advancedOperations';

export { 
  useAdvancedContextMenu,
  type ContextMenuState 
} from './hooks/useAdvancedContextMenu';

// Legacy exports for backward compatibility
export { TableContextMenu } from './components/TableContextMenu';
export { EditorContextMenu } from './components/EditorContextMenu';
export { useContextMenu, useRightClickHandler } from './hooks/useContextMenu';
export type { EditorContextMenuState } from './hooks/useContextMenu';

export type {
  Position,
  ContextMenuState as LegacyContextMenuState,
  TableContextMenuProps,
  ContextMenuItem as LegacyContextMenuItem,
  TableBorderStyle,
  TableStyle,
  CellRange,
  TableOperations,
  TableTheme,
  BorderSide
} from './types';

export { createAdvancedTableOperations as legacyCreateAdvancedTableOperations } from './utils/advancedTableOperations';
export { createAdvancedContextMenuItems } from './utils/advancedMenuItems';
export { createEditorOperations } from './utils/editorOperations';
export { createEditorContextMenuItems } from './utils/editorMenuItems';
export type { EditorOperations } from './utils/editorOperations';