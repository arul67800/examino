// Hierarchy Management Components
export { default as HierarchyHeader } from './core/hierarchy-header';
export { default as HierarchyItem } from './core/hierarchy-item';
export { default as HierarchyItemActions } from './core/hierarchy-item-actions';
export { default as HierarchyItemCount } from './core/hierarchy-item-count';
export { default as AddItemForm } from './core/add-item-form';
export { default as HierarchyFooter } from './core/hierarchy-footer';
export { default as DragAndDropWrapper } from './core/drag-and-drop-wrapper';

// MCQ Integration Components
export { default as HierarchySettings } from './core/hierarchy-settings';

// Modal Components
export { default as DeleteConfirmationModal } from './core/delete-confirmation-modal';
export { default as CascadeDeleteModal } from './core/cascade-delete-modal';

// SVG Icons
export { MCQViewIcons } from './core/mcq-view-icons';
export * from './core/mcq-view-icons';

// Utilities & Hooks
export { useDragAndDrop } from './core/useDragAndDrop';
export { default as AdvancedEmptyState } from './core/advanced-empty-state';

// Hierarchy Hooks
export {
  useHierarchy,
  useHierarchyItem,
  useCreateHierarchyItem,
  useUpdateHierarchyItem,
  useDeleteHierarchyItem,
  useUpdateQuestionCount,
  usePublishHierarchyItem,
  useReorderHierarchyItems,
  useHierarchyStats,
  // Convenience hooks for specific hierarchy types
  useQuestionBankHierarchy,
  useQuestionBankHierarchyItem,
  useCreateQuestionBankHierarchyItem,
  useUpdateQuestionBankHierarchyItem,
  useDeleteQuestionBankHierarchyItem,
  useUpdateQuestionBankQuestionCount,
  usePublishQuestionBankHierarchyItem,
  useReorderQuestionBankHierarchyItems,
  useQuestionBankHierarchyStats,
  usePreviousPapersHierarchy,
  usePreviousPapersHierarchyItem,
  useCreatePreviousPapersHierarchyItem,
  useUpdatePreviousPapersHierarchyItem,
  useDeletePreviousPapersHierarchyItem,
  useUpdatePreviousPapersQuestionCount,
  usePublishPreviousPapersHierarchyItem,
  useReorderPreviousPapersHierarchyItems,
  usePreviousPapersHierarchyStats,
  type HierarchyType
} from './hooks/useHierarchy';

// Configuration
export * from './config/hierarchy-config';

// Types
export * from './types/question-bank-hierarchy.types';
export * from './types/previous-papers-hierarchy.types';

// Data and utilities - now moved to lib/types
export { getTypeByLevel } from './hierarchy-data';

// Type exports
export interface HierarchySettingsType {
  mcqEditView: 'inline' | 'modal' | 'page';
  showDeleteButton: boolean;
}