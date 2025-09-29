'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { 
  HierarchyHeader,
  HierarchyItem,
  HierarchyFooter,
  DragAndDropWrapper
} from '@/components/admin/hierarchy';
import { useDragAndDrop, AdvancedEmptyState, HierarchySettings } from '@/components/admin/hierarchy';
import { PREVIOUS_PAPERS_CONFIG, getLevelColor } from '@/components/admin/hierarchy/config/hierarchy-config';
import { 
  usePreviousPapersHierarchy,
  useCreatePreviousPapersHierarchyItem,
  useUpdatePreviousPapersHierarchyItem,
  useDeletePreviousPapersHierarchyItem,
  useUpdatePreviousPapersQuestionCount,
  usePublishPreviousPapersHierarchyItem,
  useReorderPreviousPapersHierarchyItems
} from '@/components/admin/hierarchy';
import { getPreviousPapersTypeByLevel } from '@/components/admin/hierarchy/types/previous-papers-hierarchy.types';
import { DeleteConfirmationModal, CascadeDeleteModal } from '@/components/admin/hierarchy';

export default function PreviousPapersHierarchyPage() {
  const { theme } = useTheme();
  const { handleReorder } = useDragAndDrop();
  
  // Use actual Previous Papers hierarchy hooks
  const { hierarchyItems: fetchedItems, loading, error, refetch } = usePreviousPapersHierarchy();
  const { createHierarchyItem, loading: isCreating } = useCreatePreviousPapersHierarchyItem();
  const { updateHierarchyItem, loading: isUpdating } = useUpdatePreviousPapersHierarchyItem();
  const { deleteHierarchyItem, loading: isDeleting } = useDeletePreviousPapersHierarchyItem();
  const { publishHierarchyItem, loading: isPublishing } = usePublishPreviousPapersHierarchyItem();
  const { reorderHierarchyItems, loading: isReordering } = useReorderPreviousPapersHierarchyItems();
  
  // Local state for hierarchy items to enable proper color management
  const [hierarchyItems, setHierarchyItems] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1', '2', '3', '8']));
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
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
  
  // Settings state management for previous papers
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    mcqEditView: 'inline' as 'inline' | 'modal' | 'page',
    showDeleteButton: true,
    levelColors: {
      1: PREVIOUS_PAPERS_CONFIG.levelColors[1],
      2: PREVIOUS_PAPERS_CONFIG.levelColors[2],
      3: PREVIOUS_PAPERS_CONFIG.levelColors[3], 
      4: PREVIOUS_PAPERS_CONFIG.levelColors[4],
      5: PREVIOUS_PAPERS_CONFIG.levelColors[5]
    }
  });

  // Update local state when fetched data changes
  React.useEffect(() => {
    const updateItemColors = (items: any[]): any[] => {
      return items.map(item => ({
        ...item,
        color: getLevelColor(item.level, 'previous-papers'),
        type: PREVIOUS_PAPERS_CONFIG.getTypeByLevel(item.level),
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
        // Use the actual parentId if it's not 'root' or 'new'
        const actualParentId = (parentId === 'root' || parentId === 'new') ? undefined : parentId;
        
        await createHierarchyItem({
          name: newItemName.trim(),
          parentId: actualParentId,
          level: level,
          color: getLevelColor(level, 'previous-papers'),
          questionCount: 0
        });
        
        setShowAddForm(null);
        setNewItemName('');
        refetch(); // Refresh the hierarchy data
      } catch (error) {
        console.error('Error creating previous papers item:', error);
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
    // TODO: Implement API call for previous papers
    console.log('Updating previous papers item:', editingItem, editingName);
    setEditingItem(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditingName('');
  };

  const handlePublishToggle = async (itemId: string, isPublished: boolean) => {
    // TODO: Implement API call for previous papers
    console.log(`Previous papers item ${itemId} ${isPublished ? 'published' : 'unpublished'}`);
  };

  const handleDelete = async (itemId: string) => {
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
      setDeleteModal({
        isOpen: true,
        item: itemToDelete,
        type: 'cascade'
      });
    } else {
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
      setHierarchyItems(prevItems => {
        const removeItemFromHierarchy = (items: typeof prevItems): typeof prevItems => {
          return items.map(item => {
            if (item.id === itemId) {
              return null;
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

  const handleCascadeChoice = (cascade: boolean) => {
    if (!deleteModal.item) return;

    if (cascade) {
      executeCascadeDelete(deleteModal.item);
    } else {
      executeSimpleDelete(deleteModal.item.id);
    }
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  const handleDragEnd = async (activeId: string, overId: string) => {
    if (!overId || activeId === overId) return;
    
    // Find the items being reordered
    const activeItem = hierarchyItems.find(item => item.id === activeId);
    const overItem = hierarchyItems.find(item => item.id === overId);
    
    if (!activeItem || !overItem) return;
    
    // Create reorder items with new order
    const reorderItems = [
      { id: activeId, order: overItem.order },
      { id: overId, order: activeItem.order }
    ];
    
    try {
      await reorderHierarchyItems(reorderItems);
      refetch(); // Refresh the data
    } catch (error) {
      console.error('Error reordering items:', error);
    }
  };



  if (loading) {
    return (
      <div className="space-y-6">
        <HierarchyHeader 
          config={PREVIOUS_PAPERS_CONFIG}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading previous papers hierarchy...</div>
        </div>
        <HierarchyFooter />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Custom Header for Previous Papers */}
      <div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white"
      >
        <h1 className="text-2xl font-bold mb-2">Previous Papers Hierarchy Management</h1>
        <p className="text-purple-100">
          Organize and manage your previous papers collection by boards, grades, years, and subjects.
        </p>
      </div>

        <HierarchyHeader
          config={PREVIOUS_PAPERS_CONFIG}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />      {/* Hierarchy Content */}
      <div className="space-y-3">
        {hierarchyItems.length === 0 ? (
          <AdvancedEmptyState
            hierarchyType="previous-papers"
            onCreateFirst={() => {
              setShowAddForm('root-new');
              setNewItemName('');
            }}
            isCreating={false}
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
                hierarchyMode="previous-papers"
                onToggleExpanded={toggleExpanded}
                onAddSibling={handleAddSibling}
                onAddChild={handleAddChild}
                onSaveNewItem={handleSaveNewItem}
                onCancelAdd={handleCancelAdd}
                onNameChange={setNewItemName}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublishToggle={handlePublishToggle}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditNameChange={setEditingName}
                getTypeByLevel={PREVIOUS_PAPERS_CONFIG.getTypeByLevel}
                allHierarchyItems={hierarchyItems}
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
          onConfirm={() => executeSimpleDelete(deleteModal.item?.id)}
          onClose={closeDeleteModal}
          isLoading={isDeleting}
        />
      )}

      {/* Cascade Delete Modal */}
      <CascadeDeleteModal
        isOpen={deleteModal.type === 'cascade' || deleteModal.type === 'promote'}
        item={deleteModal.item}
        type={deleteModal.type as 'cascade' | 'promote'}
        isLoading={isDeleting}
        onClose={closeDeleteModal}
        onCascadeDelete={executeCascadeDelete}
        onPromoteDelete={(item: any) => executeSimpleDelete(item.id)}
        onShowChoices={() => {
          closeDeleteModal();
          setDeleteModal({ ...deleteModal, type: 'promote' });
        }}
      />

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