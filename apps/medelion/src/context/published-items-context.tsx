'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';
import apolloClient from '@/lib/apollo-client';
import { GET_HIERARCHY_ITEMS } from '@/lib/graphql/hierarchy.graphql';
import { CalendarIcon, AcademicCapIcon } from '@/components/dashboard/sidebar/sidebar-icons';

// GraphQL queries and mutations
const GET_PUBLISHED_HIERARCHY_ITEMS = gql`
  query GetPublishedHierarchyItems {
    publishedHierarchyItems {
      id
      name
      level
      type
      parentId
      isPublished
      parent {
        id
        name
        level
      }
      children {
        id
        name
        level
        isPublished
      }
    }
  }
`;

const PUBLISH_HIERARCHY_ITEM = gql`
  mutation PublishHierarchyItem($id: ID!) {
    publishHierarchyItem(id: $id) {
      id
      name
      level
      type
      isPublished
      parent {
        id
        name
        isPublished
      }
    }
  }
`;

const UNPUBLISH_HIERARCHY_ITEM = gql`
  mutation UnpublishHierarchyItem($id: ID!) {
    unpublishHierarchyItem(id: $id) {
      id
      name
      level
      type
      isPublished
    }
  }
`;

// Types
interface PublishedHierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  parentId?: string;
  isPublished: boolean;
  parent?: {
    id: string;
    name: string;
    level: number;
  };
  children?: PublishedHierarchyItem[];
}

interface SidebarMenuItem {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  href?: string;
  level: 1 | 2 | 3;
  children?: SidebarMenuItem[];
  parentId?: string;
  subParentId?: string;
  isPublished?: boolean;
}

interface PublishedItemsContextType {
  publishedItems: PublishedHierarchyItem[];
  sidebarMenuItems: SidebarMenuItem[];
  publishItem: (id: string) => Promise<void>;
  unpublishItem: (id: string) => Promise<void>;
  loading: boolean;
  error: any;
}

const PublishedItemsContext = createContext<PublishedItemsContextType | undefined>(undefined);

export function usePublishedItems() {
  const context = useContext(PublishedItemsContext);
  if (!context) {
    throw new Error('usePublishedItems must be used within a PublishedItemsProvider');
  }
  return context;
}

interface PublishedItemsProviderProps {
  children: ReactNode;
}

export function PublishedItemsProvider({ children }: PublishedItemsProviderProps) {
  const [sidebarMenuItems, setSidebarMenuItems] = useState<SidebarMenuItem[]>([]);
  const [localPublishedItems, setLocalPublishedItems] = useState<PublishedHierarchyItem[]>([]);

  // GraphQL hooks
  const { data, loading, error, refetch } = useQuery(GET_PUBLISHED_HIERARCHY_ITEMS);
  const [publishMutation] = useMutation(PUBLISH_HIERARCHY_ITEM);
  const [unpublishMutation] = useMutation(UNPUBLISH_HIERARCHY_ITEM);

  const serverPublishedItems: PublishedHierarchyItem[] = (data as any)?.publishedHierarchyItems || [];
  
  // Use local state if available, otherwise use server data
  const publishedItems = localPublishedItems.length > 0 ? localPublishedItems : serverPublishedItems;

  // Sync local state with server data when it changes
  useEffect(() => {
    if (serverPublishedItems.length > 0) {
      setLocalPublishedItems(serverPublishedItems);
    }
  }, [serverPublishedItems]);

  // Convert hierarchy items to sidebar menu items
  const convertToSidebarItems = (items: PublishedHierarchyItem[]): SidebarMenuItem[] => {
    const menuItems: SidebarMenuItem[] = [];

    // Group items by level
    const yearItems = items.filter(item => item.level === 1);
    const subjectItems = items.filter(item => item.level === 2);

    // Process Years (level 1) - these become sub-menu items under Question Bank
    yearItems.forEach(year => {
      const yearMenuItem: SidebarMenuItem = {
        id: `qb-year-${year.id}`,
        name: year.name,
        icon: <CalendarIcon />,
        level: 2,
        parentId: 'question-bank',
        href: `/dashboard/question-bank/${year.id}`,
        isPublished: year.isPublished,
        children: []
      };

      // Find subjects that belong to this year
      const yearSubjects = subjectItems.filter(subject => subject.parentId === year.id);
      
      if (yearSubjects.length > 0) {
        yearMenuItem.children = yearSubjects.map(subject => ({
          id: `qb-subject-${subject.id}`,
          name: subject.name,
          icon: <AcademicCapIcon />,
          level: 3,
          parentId: 'question-bank',
          subParentId: `qb-year-${year.id}`,
          href: `/dashboard/question-bank/${year.id}/${subject.id}`,
          isPublished: subject.isPublished
        }));
      }

      menuItems.push(yearMenuItem);
    });

    return menuItems;
  };

  // Update sidebar menu items when published items change
  useEffect(() => {
    if (publishedItems.length > 0) {
      const newMenuItems = convertToSidebarItems(publishedItems);
      setSidebarMenuItems(newMenuItems);
    } else {
      setSidebarMenuItems([]);
    }
  }, [publishedItems]);

  const publishItem = async (id: string) => {
    try {
      // Immediately update local state for better UX
      setLocalPublishedItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isPublished: true } : item
        )
      );

      // Call the mutation
      await publishMutation({ variables: { id } });
      
      // Invalidate and refetch both published items and main hierarchy cache
      await refetch();
      
      // Also invalidate the main hierarchy items cache to get updated isPublished status
      apolloClient.cache.evict({ fieldName: 'hierarchyItems' });
      apolloClient.refetchQueries({ 
        include: [GET_HIERARCHY_ITEMS]
      });
      
    } catch (err) {
      console.error('Error publishing item:', err);
      // Revert optimistic update on error
      setLocalPublishedItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isPublished: false } : item
        )
      );
      throw err;
    }
  };

  const unpublishItem = async (id: string) => {
    try {
      // Immediately update local state for better UX
      setLocalPublishedItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isPublished: false } : item
        )
      );

      // Call the mutation
      await unpublishMutation({ variables: { id } });
      
      // Invalidate and refetch both published items and main hierarchy cache
      await refetch();
      
      // Also invalidate the main hierarchy items cache to get updated isPublished status
      apolloClient.cache.evict({ fieldName: 'hierarchyItems' });
      apolloClient.refetchQueries({ 
        include: [GET_HIERARCHY_ITEMS]
      });
      
    } catch (err) {
      console.error('Error unpublishing item:', err);
      // Revert optimistic update on error
      setLocalPublishedItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isPublished: true } : item
        )
      );
      throw err;
    }
  };

  const value: PublishedItemsContextType = {
    publishedItems,
    sidebarMenuItems,
    publishItem,
    unpublishItem,
    loading,
    error
  };

  return (
    <PublishedItemsContext.Provider value={value}>
      {children}
    </PublishedItemsContext.Provider>
  );
}