'use client';

import { useState, useEffect } from 'react';
import apolloClient from '../apollo-client';
import {
  GET_HIERARCHY_ITEMS,
  GET_HIERARCHY_ITEM,
  CREATE_HIERARCHY_ITEM,
  UPDATE_HIERARCHY_ITEM,
  DELETE_HIERARCHY_ITEM,
  UPDATE_QUESTION_COUNT,
  GET_HIERARCHY_STATS
} from '../graphql/hierarchy.graphql';
import { HierarchyItem, CreateHierarchyItemInput, UpdateHierarchyItemInput, HierarchyStats } from '../types/hierarchy.types';

export const useHierarchyItems = () => {
  const [hierarchyItems, setHierarchyItems] = useState<HierarchyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await apolloClient.query<{ hierarchyItems: HierarchyItem[] }>({
        query: GET_HIERARCHY_ITEMS,
        fetchPolicy: 'network-only'
      });
      
      if (result.data && result.data.hierarchyItems) {
        setHierarchyItems(result.data.hierarchyItems);
        setError(null);
      } else {
        throw new Error('No hierarchy items data received from server');
      }
    } catch (err) {
      console.error('Error loading hierarchy data:', err);
      setError(err as Error);
      setHierarchyItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    hierarchyItems,
    loading,
    error,
    refetch
  };
};

export const useHierarchyItem = (id: string) => {
  const [hierarchyItem, setHierarchyItem] = useState<HierarchyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const result = await apolloClient.query<{ hierarchyItem: HierarchyItem }>({
        query: GET_HIERARCHY_ITEM,
        variables: { id },
        fetchPolicy: 'network-only'
      });
      
      if (result.data && result.data.hierarchyItem) {
        setHierarchyItem(result.data.hierarchyItem);
        setError(null);
      } else {
        throw new Error('No hierarchy item data received from server');
      }
    } catch (err) {
      console.error('Error loading hierarchy item:', err);
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
  }, [id]);

  return {
    hierarchyItem,
    loading,
    error,
    refetch
  };
};

export const useCreateHierarchyItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createHierarchyItem = async (input: CreateHierarchyItemInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apolloClient.mutate<{ createHierarchyItem: HierarchyItem }>({
        mutation: CREATE_HIERARCHY_ITEM,
        variables: { input },
        // Don't automatically refetch - let the calling component handle updates
        // refetchQueries: [GET_HIERARCHY_ITEMS, GET_HIERARCHY_STATS]
      });
      
      if (result.data && result.data.createHierarchyItem) {
        return result.data.createHierarchyItem;
      } else {
        throw new Error('Failed to create hierarchy item');
      }
    } catch (err) {
      console.error('Error creating hierarchy item:', err);
      setError(err as Error);
      throw err;
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

export const useUpdateHierarchyItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateHierarchyItem = async (id: string, input: UpdateHierarchyItemInput) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apolloClient.mutate<{ updateHierarchyItem: HierarchyItem }>({
        mutation: UPDATE_HIERARCHY_ITEM,
        variables: { id, input },
        refetchQueries: [GET_HIERARCHY_ITEMS]
      });
      
      if (result.data && result.data.updateHierarchyItem) {
        return result.data.updateHierarchyItem;
      } else {
        throw new Error('Failed to update hierarchy item');
      }
    } catch (err) {
      console.error('Error updating hierarchy item:', err);
      setError(err as Error);
      throw err;
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

export const useDeleteHierarchyItem = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteHierarchyItem = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apolloClient.mutate<{ deleteHierarchyItem: boolean }>({
        mutation: DELETE_HIERARCHY_ITEM,
        variables: { id },
        refetchQueries: [GET_HIERARCHY_ITEMS, GET_HIERARCHY_STATS]
      });
      
      if (result.data && typeof result.data.deleteHierarchyItem === 'boolean') {
        return result.data.deleteHierarchyItem;
      } else {
        throw new Error('Failed to delete hierarchy item');
      }
    } catch (err) {
      console.error('Error deleting hierarchy item:', err);
      setError(err as Error);
      throw err;
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

export const useUpdateQuestionCount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateQuestionCount = async (id: string, count: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apolloClient.mutate<{ updateQuestionCount: HierarchyItem }>({
        mutation: UPDATE_QUESTION_COUNT,
        variables: { id, count },
        refetchQueries: [GET_HIERARCHY_ITEMS, GET_HIERARCHY_STATS]
      });
      
      if (result.data && result.data.updateQuestionCount) {
        return result.data.updateQuestionCount;
      } else {
        throw new Error('Failed to update question count');
      }
    } catch (err) {
      console.error('Error updating question count:', err);
      setError(err as Error);
      throw err;
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

export const useHierarchyStats = () => {
  const [hierarchyStats, setHierarchyStats] = useState<HierarchyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await apolloClient.query<{ hierarchyStats: HierarchyStats[] }>({
        query: GET_HIERARCHY_STATS,
        fetchPolicy: 'network-only'
      });
      
      if (result.data && result.data.hierarchyStats) {
        setHierarchyStats(result.data.hierarchyStats);
        setError(null);
      } else {
        throw new Error('No hierarchy stats data received from server');
      }
    } catch (err) {
      console.error('Error loading hierarchy stats:', err);
      setError(err as Error);
      setHierarchyStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    hierarchyStats,
    loading,
    error,
    refetch
  };
};

// Utility hook to invalidate cache
export const useInvalidateHierarchyCache = () => {
  const invalidateCache = () => {
    apolloClient.cache.evict({ fieldName: 'hierarchyItems' });
    apolloClient.cache.evict({ fieldName: 'hierarchyStats' });
    apolloClient.cache.gc();
  };

  return { invalidateCache };
};