// Hierarchy Management Components
export { default as HierarchyHeader } from './hierarchy-header';
export { default as HierarchyItem } from './hierarchy-item';
export { default as HierarchyItemActions } from './hierarchy-item-actions';
export { default as HierarchyItemCount } from './hierarchy-item-count';
export { default as AddItemForm } from './add-item-form';
export { default as HierarchyFooter } from './hierarchy-footer';
export { default as DragAndDropWrapper } from './drag-and-drop-wrapper';

// MCQ Integration Components
export { default as HierarchySettings } from './hierarchy-settings';

// SVG Icons
export { MCQViewIcons } from './mcq-view-icons';
export * from './mcq-view-icons';

// Data and utilities - now moved to lib/types
export { getTypeByLevel } from './hierarchy-data';

// Type exports
export interface HierarchySettingsType {
  mcqEditView: 'inline' | 'modal' | 'page';
  showDeleteButton: boolean;
}