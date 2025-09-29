'use client';

import { useState, useEffect } from 'react';
import apolloClient from '@/lib/apollo-client';
// Legacy imports
import {
  GET_HIERARCHY_ITEMS,
  GET_HIERARCHY_ITEM,
  CREATE_HIERARCHY_ITEM,
  UPDATE_HIERARCHY_ITEM,
  DELETE_HIERARCHY_ITEM,
  UPDATE_QUESTION_COUNT,
  PUBLISH_HIERARCHY_ITEM,
  UNPUBLISH_HIERARCHY_ITEM,
  REORDER_HIERARCHY_ITEMS,
  GET_HIERARCHY_STATS,
} from '@/lib/graphql/hierarchy.graphql';

// Question Bank specific imports
import {
  GET_QUESTION_BANK_HIERARCHY_ITEMS,
  GET_QUESTION_BANK_HIERARCHY_ITEM,
  CREATE_QUESTION_BANK_HIERARCHY_ITEM,
  UPDATE_QUESTION_BANK_HIERARCHY_ITEM,
  DELETE_QUESTION_BANK_HIERARCHY_ITEM,
  UPDATE_QUESTION_BANK_QUESTION_COUNT,
  PUBLISH_QUESTION_BANK_HIERARCHY_ITEM,
  UNPUBLISH_QUESTION_BANK_HIERARCHY_ITEM,
  REORDER_QUESTION_BANK_HIERARCHY_ITEMS,
  GET_QUESTION_BANK_HIERARCHY_STATS,
} from '@/lib/graphql/question-bank-hierarchy';

// Previous Papers specific imports  
import {
  GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS,
  GET_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  CREATE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  UPDATE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  DELETE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  UPDATE_PREVIOUS_PAPERS_QUESTION_COUNT,
  PUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  UNPUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM,
  REORDER_PREVIOUS_PAPERS_HIERARCHY_ITEMS,
  GET_PREVIOUS_PAPERS_HIERARCHY_STATS,
} from '@/lib/graphql/previous-papers-hierarchy';
import { HierarchyItem, CreateHierarchyItemInput, UpdateHierarchyItemInput } from '@/lib/types/hierarchy.types';

export type HierarchyType = 'question-bank' | 'previous-papers';

// Helper function to clean hierarchy item names recursively
const cleanHierarchyItemNames = (item: HierarchyItem, hierarchyType: HierarchyType): HierarchyItem => {
  return {
    ...item,
    name: item.name.replace(/^\[QUESTION-BANK\]\s*|\[PREVIOUS-PAPERS\]\s*/i, '').trim(),
    children: (item.children || []).map(child => cleanHierarchyItemNames(child, hierarchyType))
  };
};

// Extended input types that include hierarchyType
export interface CreateHierarchyItemWithTypeInput extends Omit<CreateHierarchyItemInput, 'type'> {
  hierarchyType: HierarchyType;
}

export interface UpdateHierarchyItemWithTypeInput extends UpdateHierarchyItemInput {
  hierarchyType?: HierarchyType;
}

// Helper function to get GraphQL operations based on hierarchy type
const getOperations = (hierarchyType: HierarchyType) => {
  if (hierarchyType === 'question-bank') {
    return {
      GET_ITEMS: GET_QUESTION_BANK_HIERARCHY_ITEMS,
      GET_ITEM: GET_QUESTION_BANK_HIERARCHY_ITEM,
      CREATE_ITEM: CREATE_QUESTION_BANK_HIERARCHY_ITEM,
      UPDATE_ITEM: UPDATE_QUESTION_BANK_HIERARCHY_ITEM,
      DELETE_ITEM: DELETE_QUESTION_BANK_HIERARCHY_ITEM,
      UPDATE_COUNT: UPDATE_QUESTION_BANK_QUESTION_COUNT,
      PUBLISH_ITEM: PUBLISH_QUESTION_BANK_HIERARCHY_ITEM,
      UNPUBLISH_ITEM: UNPUBLISH_QUESTION_BANK_HIERARCHY_ITEM,
      REORDER_ITEMS: REORDER_QUESTION_BANK_HIERARCHY_ITEMS,
      GET_STATS: GET_QUESTION_BANK_HIERARCHY_STATS,
    };
  } else {
    return {
      GET_ITEMS: GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS,
      GET_ITEM: GET_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      CREATE_ITEM: CREATE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      UPDATE_ITEM: UPDATE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      DELETE_ITEM: DELETE_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      UPDATE_COUNT: UPDATE_PREVIOUS_PAPERS_QUESTION_COUNT,
      PUBLISH_ITEM: PUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      UNPUBLISH_ITEM: UNPUBLISH_PREVIOUS_PAPERS_HIERARCHY_ITEM,
      REORDER_ITEMS: REORDER_PREVIOUS_PAPERS_HIERARCHY_ITEMS,
      GET_STATS: GET_PREVIOUS_PAPERS_HIERARCHY_STATS,
    };
  }
};

// Main hierarchy hook
export const useHierarchy = (hierarchyType: HierarchyType) => {
  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apolloClient.query({
        query: operations.GET_ITEMS,
        fetchPolicy: 'network-only' // Always fetch fresh data
      });

      let hierarchyItems: HierarchyItem[] = [];
      
      if (result.data) {
        // Extract the correct field based on hierarchy type
        if (hierarchyType === 'question-bank' && (result.data as any).questionBankHierarchyItems) {
          hierarchyItems = (result.data as any).questionBankHierarchyItems;
        } else if (hierarchyType === 'previous-papers' && (result.data as any).previousPapersHierarchyItems) {
          hierarchyItems = (result.data as any).previousPapersHierarchyItems;
        }
      }

      if (hierarchyItems) {
        // Since we're now using specific endpoints, no additional filtering needed
        // Just clean any legacy prefixes that might exist
        const cleanedItems = hierarchyItems.map(item => 
          cleanHierarchyItemNames(item, hierarchyType)
        );
        
        setHierarchyItems(cleanedItems);
      } else {
        // Set empty array instead of throwing error - this is normal when no items exist
        setHierarchyItems([]);
      }
    } catch (err) {
      console.error(`Error loading ${hierarchyType} hierarchy:`, err);
      setError(err as Error);
      setHierarchyItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [hierarchyType]);

  return {
    hierarchyItems,
    loading,
    error,
    refetch
  };
};

// Hook for getting a specific hierarchy item
export const useHierarchyItem = (id: string, hierarchyType: HierarchyType) => {
  const [hierarchyItem, setHierarchyItem] = useState<HierarchyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const result = await apolloClient.query({
        query: operations.GET_ITEM,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      
      let item: HierarchyItem | null = null;
      
      if (result.data) {
        // Extract the correct field based on hierarchy type
        if (hierarchyType === 'question-bank' && (result.data as any).questionBankHierarchyItem) {
          item = (result.data as any).questionBankHierarchyItem;
        } else if (hierarchyType === 'previous-papers' && (result.data as any).previousPapersHierarchyItem) {
          item = (result.data as any).previousPapersHierarchyItem;
        }
      }

      if (item) {
        // Since we're using specific endpoints, no need to verify hierarchy ownership
        // Just clean any legacy prefixes that might exist
        setHierarchyItem(cleanHierarchyItemNames(item, hierarchyType));
        setError(null);
      } else {
        throw new Error(`No ${hierarchyType} hierarchy item data received from server`);
      }
    } catch (err) {
      console.error(`Error loading ${hierarchyType} hierarchy item:`, err);
      setError(err as Error);
      setHierarchyItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, hierarchyType]);

  return {
    hierarchyItem,
    loading,
    error,
    refetch
  };
};

// Hook for creating hierarchy items
export const useCreateHierarchyItem = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const createHierarchyItem = async (input: CreateHierarchyItemInput): Promise<HierarchyItem | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Determine the correct type based on hierarchy type and level
      let itemType: string;
      if (hierarchyType === 'question-bank') {
        switch (input.level) {
          case 1: itemType = 'Year'; break;
          case 2: itemType = 'Subject'; break;
          case 3: itemType = 'Part'; break;
          case 4: itemType = 'Section'; break;
          case 5: itemType = 'Chapter'; break;
          default: itemType = 'Chapter'; break;
        }
      } else {
        switch (input.level) {
          case 1: itemType = 'Exam'; break;
          case 2: itemType = 'Year'; break;
          case 3: itemType = 'Subject'; break;
          case 4: itemType = 'Section'; break;
          case 5: itemType = 'Chapter'; break;
          default: itemType = 'Chapter'; break;
        }
      }

      const result = await apolloClient.mutate({
        mutation: operations.CREATE_ITEM,
        variables: { 
          input: {
            name: input.name, // No need for prefix since we're using separate endpoints
            level: input.level,
            parentId: input.parentId,
            color: input.color,
            questionCount: input.questionCount || 0
          }
        },
        refetchQueries: [{ query: operations.GET_ITEMS }]
      });

      let createdItem: HierarchyItem | null = null;
      
      if (result.data) {
        // Extract the correct field based on hierarchy type
        if (hierarchyType === 'question-bank' && (result.data as any).createQuestionBankHierarchyItem) {
          createdItem = (result.data as any).createQuestionBankHierarchyItem;
        } else if (hierarchyType === 'previous-papers' && (result.data as any).createPreviousPapersHierarchyItem) {
          createdItem = (result.data as any).createPreviousPapersHierarchyItem;
        }
      }

      if (createdItem) {
        return createdItem;
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error(`Error creating ${hierarchyType} hierarchy item:`, err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createHierarchyItem,
    loading,
    error
  };
};

// Hook for updating hierarchy items
export const useUpdateHierarchyItem = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const updateHierarchyItem = async (
    id: string,
    input: UpdateHierarchyItemWithTypeInput
  ): Promise<HierarchyItem | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // If updating the name, preserve the hierarchy prefix
      let updatedInput = { ...input };
      if (input.name) {
        updatedInput.name = `[${hierarchyType.toUpperCase()}] ${input.name}`;
      }

      const result = await apolloClient.mutate<{ 
        updateHierarchyItem: HierarchyItem 
      }>({
        mutation: operations.UPDATE_ITEM,
        variables: { id, input: updatedInput },
        refetchQueries: [{ query: operations.GET_ITEMS }]
      });      if (result.data && result.data.updateHierarchyItem) {
        return cleanHierarchyItemNames(result.data.updateHierarchyItem, hierarchyType);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error(`Error updating ${hierarchyType} hierarchy item:`, err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateHierarchyItem,
    loading,
    error
  };
};

// Hook for deleting hierarchy items
export const useDeleteHierarchyItem = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const deleteHierarchyItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apolloClient.mutate({
          mutation: operations.DELETE_ITEM,
          variables: { id },
          refetchQueries: [{ query: operations.GET_ITEMS }]
        });

      let deleteResult: boolean = false;
      
      if (result.data) {
        // Extract the correct field based on hierarchy type
        if (hierarchyType === 'question-bank' && typeof (result.data as any).deleteQuestionBankHierarchyItem === 'boolean') {
          deleteResult = (result.data as any).deleteQuestionBankHierarchyItem;
        } else if (hierarchyType === 'previous-papers' && typeof (result.data as any).deletePreviousPapersHierarchyItem === 'boolean') {
          deleteResult = (result.data as any).deletePreviousPapersHierarchyItem;
        }
      }

      if (deleteResult) {
        return true;
      } else {
        throw new Error('Failed to delete item');
      }
    } catch (err) {
      console.error(`Error deleting ${hierarchyType} hierarchy item:`, err);
      setError(err as Error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteHierarchyItem,
    loading,
    error
  };
};

// Hook for updating question count
export const useUpdateQuestionCount = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const updateQuestionCount = async (id: string, count: number): Promise<HierarchyItem | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apolloClient.mutate<{ 
        updateQuestionCount: HierarchyItem 
      }>({
          mutation: operations.UPDATE_COUNT,
          variables: { id, count },
          refetchQueries: [{ query: operations.GET_ITEMS }]
        });

      if (result.data && result.data.updateQuestionCount) {
        return cleanHierarchyItemNames(result.data.updateQuestionCount, hierarchyType);
      } else {
        throw new Error('Failed to update question count');
      }
    } catch (err) {
      console.error(`Error updating ${hierarchyType} question count:`, err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateQuestionCount,
    loading,
    error
  };
};

// Hook for publishing/unpublishing hierarchy items
export const usePublishHierarchyItem = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const publishHierarchyItem = async (id: string, isPublished: boolean): Promise<HierarchyItem | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const mutation = isPublished ? operations.PUBLISH_ITEM : operations.UNPUBLISH_ITEM;
      
      const result = await apolloClient.mutate<{ 
        publishHierarchyItem?: HierarchyItem;
        unpublishHierarchyItem?: HierarchyItem;
      }>({
          mutation,
          variables: { id },
          refetchQueries: [{ query: operations.GET_ITEMS }]
        });

      const item = result.data?.publishHierarchyItem || result.data?.unpublishHierarchyItem;
      if (item) {
        return cleanHierarchyItemNames(item, hierarchyType);
      } else {
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error(`Error ${isPublished ? 'publishing' : 'unpublishing'} ${hierarchyType} hierarchy item:`, err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    publishHierarchyItem,
    loading,
    error
  };
};

// Hook for reordering hierarchy items
export const useReorderHierarchyItems = (hierarchyType: HierarchyType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const reorderHierarchyItems = async (items: { id: string; order: number }[]): Promise<HierarchyItem[] | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apolloClient.mutate({
          mutation: operations.REORDER_ITEMS,
          variables: { items },
          refetchQueries: [{ query: operations.GET_ITEMS }]
        });

      // Handle different response field names based on hierarchy type
      let reorderedItems: HierarchyItem[] | undefined;
      if (result.data) {
        if (hierarchyType === 'question-bank' && (result.data as any).reorderQuestionBankHierarchyItems) {
          reorderedItems = (result.data as any).reorderQuestionBankHierarchyItems;
        } else if (hierarchyType === 'previous-papers' && (result.data as any).reorderPreviousPapersHierarchyItems) {
          reorderedItems = (result.data as any).reorderPreviousPapersHierarchyItems;
        }
      }

      if (reorderedItems) {
        return reorderedItems.map(item => cleanHierarchyItemNames(item, hierarchyType));
      } else {
        console.error('Reorder response data:', result.data);
        throw new Error('No data received from server');
      }
    } catch (err) {
      console.error(`Error reordering ${hierarchyType} hierarchy items:`, err);
      setError(err as Error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    reorderHierarchyItems,
    loading,
    error
  };
};

// Hook for hierarchy statistics
export const useHierarchyStats = (hierarchyType: HierarchyType) => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const operations = getOperations(hierarchyType);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await apolloClient.query({
        query: operations.GET_STATS,
        fetchPolicy: 'network-only'
      });
      
      let hierarchyStats: any[] = [];
      
      if (result.data) {
        // Extract the correct field based on hierarchy type
        if (hierarchyType === 'question-bank' && (result.data as any).questionBankHierarchyStats) {
          hierarchyStats = (result.data as any).questionBankHierarchyStats;
        } else if (hierarchyType === 'previous-papers' && (result.data as any).previousPapersHierarchyStats) {
          hierarchyStats = (result.data as any).previousPapersHierarchyStats;
        }
      }

      if (hierarchyStats) {
        setStats(hierarchyStats);
        setError(null);
      } else {
        throw new Error(`No ${hierarchyType} hierarchy stats received from server`);
      }
    } catch (err) {
      console.error(`Error loading ${hierarchyType} hierarchy stats:`, err);
      setError(err as Error);
      setStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [hierarchyType]);

  return {
    stats,
    loading,
    error,
    refetch
  };
};

// Convenience hooks for specific hierarchy types
export const useQuestionBankHierarchy = () => useHierarchy('question-bank');
export const usePreviousPapersHierarchy = () => useHierarchy('previous-papers');

export const useQuestionBankHierarchyItem = (id: string) => useHierarchyItem(id, 'question-bank');
export const usePreviousPapersHierarchyItem = (id: string) => useHierarchyItem(id, 'previous-papers');

export const useCreateQuestionBankHierarchyItem = () => useCreateHierarchyItem('question-bank');
export const useCreatePreviousPapersHierarchyItem = () => useCreateHierarchyItem('previous-papers');

export const useUpdateQuestionBankHierarchyItem = () => useUpdateHierarchyItem('question-bank');
export const useUpdatePreviousPapersHierarchyItem = () => useUpdateHierarchyItem('previous-papers');

export const useDeleteQuestionBankHierarchyItem = () => useDeleteHierarchyItem('question-bank');
export const useDeletePreviousPapersHierarchyItem = () => useDeleteHierarchyItem('previous-papers');

export const useUpdateQuestionBankQuestionCount = () => useUpdateQuestionCount('question-bank');
export const useUpdatePreviousPapersQuestionCount = () => useUpdateQuestionCount('previous-papers');

export const useQuestionBankHierarchyStats = () => useHierarchyStats('question-bank');
export const usePreviousPapersHierarchyStats = () => useHierarchyStats('previous-papers');

export const usePublishQuestionBankHierarchyItem = () => usePublishHierarchyItem('question-bank');
export const usePublishPreviousPapersHierarchyItem = () => usePublishHierarchyItem('previous-papers');

export const useReorderQuestionBankHierarchyItems = () => useReorderHierarchyItems('question-bank');
export const useReorderPreviousPapersHierarchyItems = () => useReorderHierarchyItems('previous-papers');