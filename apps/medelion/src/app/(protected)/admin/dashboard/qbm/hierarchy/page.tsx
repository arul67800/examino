'use client';

import React, { useState } from 'react';
import { 
  HierarchyHeader,
  HierarchyItem,
  HierarchyFooter,
  DragAndDropWrapper,
  getTypeByLevel
} from '@/components/admin/qbm/hierarchy';
import { useHierarchyItems, useCreateHierarchyItem, useDeleteHierarchyItem, useUpdateHierarchyItem } from '@/lib/hooks/useHierarchy';
import { useDragAndDrop } from '@/components/admin/qbm/hierarchy/useDragAndDrop';
import { getTypeByLevel as getTypeByLevelUtil } from '@/lib/types/hierarchy.types';
import DeleteConfirmationModal from '@/components/ui/delete-confirmation-modal';
import AdvancedEmptyState from '@/components/admin/qbm/hierarchy/advanced-empty-state';
import HierarchySettings from '@/components/admin/qbm/hierarchy/hierarchy-settings';

export default function HierarchyManagementPage() {
  const { hierarchyItems: fetchedItems, loading, error, refetch } = useHierarchyItems();
  const { createHierarchyItem, loading: creatingItem } = useCreateHierarchyItem();
  const { deleteHierarchyItem, loading: deletingItem } = useDeleteHierarchyItem();
  const { updateHierarchyItem, loading: updatingItem } = useUpdateHierarchyItem();
  const { handleReorder } = useDragAndDrop();
  
  // Local state for hierarchy items to enable immediate UI updates during drag and drop
  const [hierarchyItems, setHierarchyItems] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  
  // Edit state management
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Delete modal state management
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: any | null;
    type: 'simple' | 'cascade' | 'promote' | null;
  }>({
    isOpen: false,
    item: null,
    type: null
  });

  // Settings state management
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    mcqEditView: 'inline' as 'inline' | 'modal' | 'page',
    showDeleteButton: false, // Default to false - user needs to enable it
    levelColors: {
      1: '#8B5CF6', // Violet - Year
      2: '#6366F1', // Indigo - Subject  
      3: '#3B82F6', // Blue - Part
      4: '#047857', // Dark Green - Section
      5: '#10B981', // Light Green - Chapter
    }
  });

  // Update local state when fetched data changes
  React.useEffect(() => {
    const updateItemColors = (items: any[]): any[] => {
      return items.map(item => ({
        ...item,
        color: settings.levelColors[item.level as keyof typeof settings.levelColors] || '#6B7280',
        children: item.children ? updateItemColors(item.children) : item.children
      }));
    };

    if (fetchedItems.length > 0) {
      setHierarchyItems(updateItemColors(fetchedItems));
    } else {
      setHierarchyItems(fetchedItems);
    }
  }, [fetchedItems, settings.levelColors]);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const allIds = new Set<string>();
    const collectIds = (items: any[]) => {
      items.forEach(item => {
        allIds.add(item.id);
        if (item.children) {
          collectIds(item.children);
        }
      });
    };
    collectIds(hierarchyItems);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const handleAddSibling = (parentId: string, itemId: string) => {
    setShowAddForm(`sibling-${itemId}`);
    setNewItemName('');
  };

  const handleAddChild = (parentId: string, itemId: string) => {
    setShowAddForm(`child-${itemId}`);
    setNewItemName('');
  };

  const handleSaveNewItem = async (parentId: string, itemId: string, level: number) => {
    if (newItemName.trim()) {
      try {
        const newItem = await createHierarchyItem({
          name: newItemName.trim(),
          level,
          parentId: parentId === 'root' ? undefined : parentId,
          color: settings.levelColors[level as keyof typeof settings.levelColors] || '#6B7280',
          questionCount: 0
        });
        
        // Manually update local state to include the new item
        if (newItem) {
          setHierarchyItems(prevItems => {
            // Helper function to add item to the correct location in hierarchy
            const addItemToHierarchy = (items: typeof prevItems): typeof prevItems => {
              if (parentId === 'root') {
                // Add to root level
                return [...items, newItem];
              }
              
              // Add to nested location
              return items.map(item => {
                if (item.id === parentId) {
                  // This is the parent - add to its children
                  return {
                    ...item,
                    children: [...(item.children || []), newItem]
                  };
                } else if (item.children && item.children.length > 0) {
                  // Recursively check children
                  return {
                    ...item,
                    children: addItemToHierarchy(item.children)
                  };
                }
                return item;
              });
            };
            
            return addItemToHierarchy(prevItems);
          });
        }
        
        // If we're adding a child (parentId !== 'root'), automatically expand the parent
        if (parentId !== 'root') {
          setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(parentId);
            return newSet;
          });
        }
        
        // Reset form
        setShowAddForm(null);
        setNewItemName('');
        
      } catch (error) {
        console.error('Failed to create hierarchy item:', error);
      }
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(null);
    setNewItemName('');
  };

  const handleEdit = async (item: any) => {
    setEditingItem(item.id);
    setEditingName(item.name);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingName.trim()) return;

    try {
      await updateHierarchyItem(editingItem, { name: editingName.trim() });
      
      // Update local state
      setHierarchyItems(prevItems => {
        const updateItemInHierarchy = (items: typeof prevItems): typeof prevItems => {
          return items.map(item => {
            if (item.id === editingItem) {
              return { ...item, name: editingName.trim() };
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: updateItemInHierarchy(item.children)
              };
            }
            return item;
          });
        };
        return updateItemInHierarchy(prevItems);
      });

      setEditingItem(null);
      setEditingName('');
    } catch (error) {
      console.error('Failed to update hierarchy item:', error);
      alert('Failed to update item. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingName('');
  };

  const handleDelete = async (itemId: string) => {
    // First, find the item and check if it has children
    const findItemWithChildren = (items: typeof hierarchyItems): any => {
      for (const item of items) {
        if (item.id === itemId) {
          return item;
        }
        if (item.children && item.children.length > 0) {
          const found = findItemWithChildren(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    const itemToDelete = findItemWithChildren(hierarchyItems);
    
    if (!itemToDelete) {
      alert('Item not found');
      return;
    }

    const hasChildren = itemToDelete.children && itemToDelete.children.length > 0;
    
    if (hasChildren) {
      // Open modal for cascade/promote choice
      setDeleteModal({
        isOpen: true,
        item: itemToDelete,
        type: 'cascade'
      });
    } else {
      // Open simple delete modal
      setDeleteModal({
        isOpen: true,
        item: itemToDelete,
        type: 'simple'
      });
    }
  };

  const executeSimpleDelete = async (itemId: string) => {
    try {
      await deleteHierarchyItem(itemId);
      // Update local state
      setHierarchyItems(prevItems => {
        const removeItemFromHierarchy = (items: typeof prevItems): typeof prevItems => {
          return items.map(item => {
            if (item.id === itemId) {
              return null; // Mark for removal
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: removeItemFromHierarchy(item.children)
              };
            }
            return item;
          }).filter(item => item !== null) as typeof prevItems;
        };
        return removeItemFromHierarchy(prevItems);
      });
      setDeleteModal({ isOpen: false, item: null, type: null });
    } catch (error) {
      console.error('Failed to delete hierarchy item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const executeCascadeDelete = async (item: any) => {
    try {
      // Get all item IDs to delete (item + all descendants)
      const getDescendantIds = (item: any): string[] => {
        let ids = [item.id];
        if (item.children && item.children.length > 0) {
          for (const child of item.children) {
            ids = ids.concat(getDescendantIds(child));
          }
        }
        return ids;
      };

      const idsToDelete = getDescendantIds(item);

      // Delete from bottom up (children first, then parent)
      for (let i = idsToDelete.length - 1; i >= 0; i--) {
        await deleteHierarchyItem(idsToDelete[i]);
      }

      // Update local state - remove the entire subtree
      setHierarchyItems(prevItems => {
        const removeItemFromHierarchy = (items: typeof prevItems, targetId: string): typeof prevItems => {
          return items.map(item => {
            if (item.id === targetId) {
              return null; // Mark for removal
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: removeItemFromHierarchy(item.children, targetId)
              };
            }
            return item;
          }).filter(item => item !== null) as typeof prevItems;
        };
        return removeItemFromHierarchy(prevItems, item.id);
      });

      setDeleteModal({ isOpen: false, item: null, type: null });
    } catch (error) {
      console.error('Failed to cascade delete hierarchy items:', error);
      alert('Failed to delete items. Some items may have been deleted. Please refresh the page.');
    }
  };

  const executePromoteDelete = async (item: any) => {
    try {
      await deleteHierarchyItem(item.id);

      // Update local state - remove item but promote children
      setHierarchyItems(prevItems => {
        const promoteChildrenAndRemove = (items: typeof prevItems, targetId: string): typeof prevItems => {
          const result: typeof prevItems = [];

          for (const item of items) {
            if (item.id === targetId) {
              // Don't include this item, but add its children at this level
              if (item.children && item.children.length > 0) {
                result.push(...item.children);
              }
            } else if (item.children && item.children.length > 0) {
              // Recursively process children
              result.push({
                ...item,
                children: promoteChildrenAndRemove(item.children, targetId)
              });
            } else {
              result.push(item);
            }
          }

          return result;
        };

        return promoteChildrenAndRemove(prevItems, item.id);
      });

      setDeleteModal({ isOpen: false, item: null, type: null });
    } catch (error) {
      console.error('Failed to delete hierarchy item:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Cannot delete item with children')) {
        alert('Cannot delete this item because it has children. The server does not support moving children automatically.');
      } else {
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleModalConfirm = () => {
    if (!deleteModal.item) return;

    switch (deleteModal.type) {
      case 'simple':
        executeSimpleDelete(deleteModal.item.id);
        break;
      case 'cascade':
        // For cascade, we need another modal to choose cascade or promote
        setDeleteModal({ ...deleteModal, type: 'promote' }); // This will show cascade choice
        break;
      case 'promote':
        executePromoteDelete(deleteModal.item);
        break;
    }
  };

  const handleCascadeChoice = (cascade: boolean) => {
    if (!deleteModal.item) return;

    if (cascade) {
      executeCascadeDelete(deleteModal.item);
    } else {
      executePromoteDelete(deleteModal.item);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  const getDefaultColorForLevel = (level: number) => {
    return settings.levelColors[level as keyof typeof settings.levelColors] || '#6B7280';
  };

  const handleDragEnd = (activeId: string, overId: string) => {
    if (!overId || activeId === overId) return;
    
    // Handle reordering with immediate UI update
    handleReorder(activeId, overId, hierarchyItems, setHierarchyItems);
    
    // Note: We're not automatically refreshing from the server anymore
    // The UI updates immediately and the backend sync will happen when needed
    // If you need to persist the order to the backend, implement the API call
    // in the useDragAndDrop hook's TODO section
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <HierarchyHeader 
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading hierarchy data...</div>
        </div>
        <HierarchyFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <HierarchyHeader 
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">
            Error loading hierarchy data: {error.message}
            <button 
              onClick={() => refetch()} 
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
        <HierarchyFooter />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HierarchyHeader 
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        onSettings={() => setShowSettings(true)}
      />

      {/* Hierarchy Content */}
      <div className="space-y-3">
        {hierarchyItems.length === 0 ? (
          <AdvancedEmptyState
            onCreateFirst={() => {
              setShowAddForm('root-new');
              setNewItemName('');
            }}
            isCreating={creatingItem}
            showAddForm={showAddForm === 'root-new'}
            newItemName={newItemName}
            onNameChange={setNewItemName}
            onSaveNewItem={() => handleSaveNewItem('root', 'new', 1)}
            onCancelAdd={handleCancelAdd}
          />
        ) : (
          <DragAndDropWrapper 
            items={hierarchyItems} 
            onReorder={handleDragEnd}
            renderDragOverlay={(activeId) => {
              // Find the item being dragged and render a preview
              const findItem = (items: any[], id: string): any => {
                for (const item of items) {
                  if (item.id === id) return item;
                  if (item.children) {
                    const found = findItem(item.children, id);
                    if (found) return found;
                  }
                }
                return null;
              };
              
              const draggedItem = findItem(hierarchyItems, activeId);
              return draggedItem ? (
                <div className="opacity-75 transform rotate-2 p-4 bg-white rounded-lg shadow-lg border-l-4" 
                     style={{ borderLeftColor: draggedItem.color }}>
                  <div className="font-semibold">{draggedItem.name}</div>
                  <div className="text-sm text-gray-500">{draggedItem.type}</div>
                </div>
              ) : null;
            }}
          >
            {hierarchyItems.map(item => (
              <HierarchyItem
                key={item.id}
                item={item}
                parentId="root"
                expandedItems={expandedItems}
                showAddForm={showAddForm}
                newItemName={newItemName}
                editingItem={editingItem}
                editingName={editingName}
                showDeleteButton={settings.showDeleteButton}
                onToggleExpanded={toggleExpanded}
                onAddSibling={handleAddSibling}
                onAddChild={handleAddChild}
                onSaveNewItem={handleSaveNewItem}
                onCancelAdd={handleCancelAdd}
                onNameChange={setNewItemName}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditNameChange={setEditingName}
                getTypeByLevel={getTypeByLevelUtil}
              />
            ))}
          </DragAndDropWrapper>
        )}
      </div>

      <HierarchyFooter />

      {/* Delete Confirmation Modal */}
      {deleteModal.type === 'simple' && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          title="Delete Item"
          message={`Are you sure you want to delete "${deleteModal.item?.name}"?\n\nThis action cannot be undone.`}
          confirmText="Delete"
          onConfirm={handleModalConfirm}
          onClose={closeDeleteModal}
          isLoading={deletingItem}
        />
      )}

      {deleteModal.type === 'cascade' && deleteModal.item && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          title="Delete Item with Children"
          message={`"${deleteModal.item.name}" has ${deleteModal.item.children?.length || 0} child item${(deleteModal.item.children?.length || 0) > 1 ? 's' : ''}.\n\nWhat would you like to do?`}
          confirmText="Choose Delete Options"
          cancelText="Cancel"
          onConfirm={() => {
            closeDeleteModal();
            // Open choice modal
            setDeleteModal({ ...deleteModal, type: 'promote' });
          }}
          onClose={closeDeleteModal}
          isDestructive={false}
        />
      )}

      {deleteModal.type === 'promote' && deleteModal.item && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Choose Delete Option</h3>
              <button onClick={closeDeleteModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                "{deleteModal.item.name}" has {deleteModal.item.children?.length || 0} child item{(deleteModal.item.children?.length || 0) > 1 ? 's' : ''}. 
                How would you like to proceed?
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleCascadeChoice(true)}
                  disabled={deletingItem}
                  className="w-full p-4 text-left border rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-red-700">Delete Everything (Cascade)</div>
                      <div className="text-sm text-red-600">Delete this item AND all its children permanently</div>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleCascadeChoice(false)}
                  disabled={deletingItem}
                  className="w-full p-4 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-700">Delete Only This Item</div>
                      <div className="text-sm text-blue-600">Move children up one level and delete this item</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hierarchy Settings Modal */}
      <HierarchySettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  );
}