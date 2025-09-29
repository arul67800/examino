'use client';

import React, { useState } from 'react';
import { useTheme } from '@/theme';
import { 
  HierarchyHeader,
  HierarchyItem,
  HierarchyFooter,
  DragAndDropWrapper,
  getTypeByLevel
} from '@/components/admin/hierarchy';
import { 
  useQuestionBankHierarchy,
  useCreateQuestionBankHierarchyItem,
  useUpdateQuestionBankHierarchyItem,
  useDeleteQuestionBankHierarchyItem,
  usePublishQuestionBankHierarchyItem,
  useReorderQuestionBankHierarchyItems
} from '@/components/admin/hierarchy';
import { useDragAndDrop, AdvancedEmptyState, HierarchySettings, DeleteConfirmationModal, CascadeDeleteModal } from '@/components/admin/hierarchy';
import { QUESTION_BANK_CONFIG, getLevelColor } from '@/components/admin/hierarchy/config/hierarchy-config';

export default function QuestionBankHierarchyPage() {
  const { theme } = useTheme();
  const { hierarchyItems: fetchedItems, loading, error, refetch } = useQuestionBankHierarchy();
  const { createHierarchyItem, loading: creatingItem } = useCreateQuestionBankHierarchyItem();
  const { deleteHierarchyItem, loading: deletingItem } = useDeleteQuestionBankHierarchyItem();
  const { updateHierarchyItem, loading: updatingItem } = useUpdateQuestionBankHierarchyItem();
  const { publishHierarchyItem, loading: isPublishing } = usePublishQuestionBankHierarchyItem();
  const { reorderHierarchyItems, loading: isReordering } = useReorderQuestionBankHierarchyItems();
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
    showDeleteButton: true,
    levelColors: {
      1: QUESTION_BANK_CONFIG.levelColors[1],
      2: QUESTION_BANK_CONFIG.levelColors[2], 
      3: QUESTION_BANK_CONFIG.levelColors[3],
      4: QUESTION_BANK_CONFIG.levelColors[4],
      5: QUESTION_BANK_CONFIG.levelColors[5]
    }
  });

  // Update local state when fetched data changes
  React.useEffect(() => {
    const updateItemColors = (items: any[]): any[] => {
      return items.map(item => ({
        ...item,
        color: getLevelColor(item.level, 'question-bank'),
        type: QUESTION_BANK_CONFIG.getTypeByLevel(item.level),
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
          color: getLevelColor(level, 'question-bank'),
          questionCount: 0
        });
        
        if (newItem) {
          // Ensure the new item has the proper color and type from config
          const enhancedNewItem = {
            ...newItem,
            color: getLevelColor(newItem.level, 'question-bank'),
            type: QUESTION_BANK_CONFIG.getTypeByLevel(newItem.level)
          };
          
          setHierarchyItems(prevItems => {
            const addItemToHierarchy = (items: typeof prevItems): typeof prevItems => {
              if (parentId === 'root') {
                return [...items, enhancedNewItem];
              }
              
              return items.map(item => {
                if (item.id === parentId) {
                  return {
                    ...item,
                    children: [...(item.children || []), enhancedNewItem]
                  };
                } else if (item.children && item.children.length > 0) {
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
        
        if (parentId !== 'root') {
          setExpandedItems(prev => {
            const newSet = new Set(prev);
            newSet.add(parentId);
            return newSet;
          });
        }
        
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

  const handlePublishToggle = async (itemId: string, isPublished: boolean) => {
    try {
      setHierarchyItems(prevItems => {
        const updateItemInHierarchy = (items: typeof prevItems): typeof prevItems => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, isPublished };
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

      console.log(`Item ${itemId} ${isPublished ? 'published' : 'unpublished'}`);
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      setHierarchyItems(prevItems => {
        const revertItemInHierarchy = (items: typeof prevItems): typeof prevItems => {
          return items.map(item => {
            if (item.id === itemId) {
              return { ...item, isPublished: !isPublished };
            }
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: revertItemInHierarchy(item.children)
              };
            }
            return item;
          });
        };
        return revertItemInHierarchy(prevItems);
      });
      alert('Failed to update publish status. Please try again.');
    }
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

  const handleDragEnd = (activeId: string, overId: string) => {
    if (!overId || activeId === overId) return;
    handleReorder(activeId, overId, hierarchyItems, setHierarchyItems);
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, item: null, type: null });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <HierarchyHeader 
          config={QUESTION_BANK_CONFIG}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading main bank hierarchy...</div>
        </div>
        <HierarchyFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <HierarchyHeader 
          config={QUESTION_BANK_CONFIG}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />
        <div className="flex items-center justify-center py-12">
          <div className="text-red-500">
            Error loading main bank hierarchy: {error.message}
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
          config={QUESTION_BANK_CONFIG}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
          onSettings={() => setShowSettings(true)}
        />      {/* Hierarchy Content */}
      <div className="space-y-3">
        {hierarchyItems.length === 0 ? (
          <AdvancedEmptyState
            hierarchyType="question-bank"
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
                hierarchyMode="question-bank"
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
                getTypeByLevel={QUESTION_BANK_CONFIG.getTypeByLevel}
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
          isLoading={deletingItem}
        />
      )}

      <CascadeDeleteModal
        isOpen={deleteModal.type === 'cascade' || deleteModal.type === 'promote'}
        item={deleteModal.item}
        type={deleteModal.type as 'cascade' | 'promote'}
        isLoading={deletingItem}
        onClose={closeDeleteModal}
        onCascadeDelete={executeCascadeDelete}
        onPromoteDelete={(item) => executeSimpleDelete(item.id)}
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