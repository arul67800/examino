/**
 * Common utilities for MCQ hierarchy integration
 * Used across all MCQ editor modes (inline, modal, page)
 */

import apolloClient from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { GET_QUESTION_BANK_HIERARCHY_ITEMS } from '@/lib/graphql/question-bank-hierarchy';
import { GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS } from '@/lib/graphql/previous-papers-hierarchy';
import { HierarchyItem as LibHierarchyItem } from '@/lib/types/hierarchy.types';
import { mcqService, CreateQuestionData, UpdateQuestionData } from '@/lib/mcq-service';
import { getHierarchyConfig, canHaveMCQs, type HierarchyMode } from '@/components/admin/hierarchy/config/hierarchy-config';

export interface HierarchyItem {
  id: string;
  name: string;
  level: number;
  type: string;
  parentId?: string;
  color?: string;
  order?: number;
  questionCount?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: HierarchyItem[];
}

export interface MCQHierarchyParams {
  mode: 'new' | 'edit';
  hierarchyItemId: string;
  hierarchyLevel: number;
  hierarchyName: string;
  hierarchyType: string;
  hierarchyChain?: HierarchyItem[];
  mcqId?: string;
  parentId?: string;
}

export interface MCQHierarchyContext {
  hierarchyItemId: string;
  hierarchyLevel: number;
  hierarchyName: string;
  hierarchyType: HierarchyMode;
  hierarchyChain: HierarchyItem[];
  mode: 'new' | 'edit';
  mcqId?: string;
}

/**
 * Build complete hierarchy chain for MCQ editor navigation
 * This helper should be called from hierarchy item actions
 */
export const buildHierarchyChain = (currentItem: any, allItems?: any[]): HierarchyItem[] => {
  const chain: HierarchyItem[] = [];
  
  // Add current item with all its properties including color
  const currentHierarchyItem: HierarchyItem = {
    id: currentItem.id,
    name: currentItem.name,
    level: currentItem.level,
    type: currentItem.type,
    parentId: currentItem.parentId,
    color: currentItem.color, // Include color from hierarchy item
    order: currentItem.order,
    questionCount: currentItem.questionCount,
    createdAt: currentItem.createdAt,
    updatedAt: currentItem.updatedAt,
    children: currentItem.children || []
  };
  
  chain.unshift(currentHierarchyItem);
  
  // If we have access to all items, build the complete chain by traversing up
  if (allItems && currentItem.parentId) {
    let currentParentId = currentItem.parentId;
    
    // Recursive function to find item by ID in nested hierarchy
    const findItemById = (items: any[], id: string): any => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItemById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    // Build chain by traversing up through parents
    while (currentParentId) {
      const parentItem = findItemById(allItems, currentParentId);
      if (parentItem) {
        const parentHierarchyItem: HierarchyItem = {
          id: parentItem.id,
          name: parentItem.name,
          level: parentItem.level,
          type: parentItem.type,
          parentId: parentItem.parentId,
          color: parentItem.color, // Include color from parent hierarchy item
          order: parentItem.order,
          questionCount: parentItem.questionCount,
          createdAt: parentItem.createdAt,
          updatedAt: parentItem.updatedAt,
          children: parentItem.children || []
        };
        chain.unshift(parentHierarchyItem);
        currentParentId = parentItem.parentId;
      } else {
        break; // Parent not found, stop traversing
      }
    }
  }
  
  console.log('Built hierarchy chain with colors:', chain);
  return chain;
};

/**
 * Detect hierarchy type by checking which hierarchy tree contains the item
 * This queries both hierarchies to find which one contains the given item ID
 */
export const detectHierarchyTypeByItemLookup = async (hierarchyItemId: string): Promise<'question-bank' | 'previous-papers'> => {
  try {
    console.log('[HIERARCHY DETECTION] Looking up item ID:', hierarchyItemId);
    
    // Try Question Bank first
    const QB_CHECK_QUERY = gql`
      query CheckQuestionBankHierarchy($id: ID!) {
        questionBankHierarchyItem(id: $id) {
          id
          name
          level
        }
      }
    `;
    
    try {
      const qbResult = await apolloClient.query<{ questionBankHierarchyItem?: { id: string; name: string; level: number } }>({
        query: QB_CHECK_QUERY,
        variables: { id: hierarchyItemId },
        errorPolicy: 'ignore'
      });
      
      if (qbResult.data && qbResult.data.questionBankHierarchyItem) {
        console.log('[HIERARCHY DETECTION] Found in Question Bank:', qbResult.data.questionBankHierarchyItem);
        return 'question-bank';
      }
    } catch (error) {
      console.log('[HIERARCHY DETECTION] Not found in Question Bank');
    }
    
    // Try Previous Papers
    const PP_CHECK_QUERY = gql`
      query CheckPreviousPapersHierarchy($id: ID!) {
        previousPapersHierarchyItem(id: $id) {
          id
          name
          level
        }
      }
    `;
    
    try {
      const ppResult = await apolloClient.query<{ previousPapersHierarchyItem?: { id: string; name: string; level: number } }>({
        query: PP_CHECK_QUERY,
        variables: { id: hierarchyItemId },
        errorPolicy: 'ignore'
      });
      
      if (ppResult.data && ppResult.data.previousPapersHierarchyItem) {
        console.log('[HIERARCHY DETECTION] Found in Previous Papers:', ppResult.data.previousPapersHierarchyItem);
        return 'previous-papers';
      }
    } catch (error) {
      console.log('[HIERARCHY DETECTION] Not found in Previous Papers');
    }
    
    // Default fallback
    console.log('[HIERARCHY DETECTION] Item not found in either hierarchy, defaulting to question-bank');
    return 'question-bank';
    
  } catch (error) {
    console.error('[HIERARCHY DETECTION] Error during lookup:', error);
    return 'question-bank';
  }
};

/**
 * Directly determine hierarchy type based on the calling component context
 * This is the most reliable method as the calling component knows which hierarchy it belongs to
 */
export const detectHierarchyTypeFromSource = (sourceHierarchyMode?: 'question-bank' | 'previous-papers'): 'question-bank' | 'previous-papers' => {
  // Always use the explicitly provided hierarchy mode - this is the most reliable
  return sourceHierarchyMode || 'question-bank';
};

/**
 * Create URL parameters for MCQ navigation with hierarchy data
 * Use this when clicking MCQ button in hierarchy actions (always new mode)
 */
export const createMCQNavigationParams = (item: any, hierarchyChain?: HierarchyItem[], sourceHierarchyMode?: 'question-bank' | 'previous-papers'): URLSearchParams => {
  // Build complete hierarchy chain if not provided
  const chain = hierarchyChain || buildHierarchyChain(item);
  
  // When clicking MCQ button from hierarchy actions, it's always for creating a NEW MCQ
  const mode = 'new';
  
  // Use direct hierarchy type detection - most reliable method
  const hierarchyMode = detectHierarchyTypeFromSource(sourceHierarchyMode);
  
  console.log('[HIERARCHY NAVIGATION] MCQ Navigation Params:', {
    itemId: item.id,
    itemName: item.name,
    itemType: item.type,
    detectedHierarchyMode: hierarchyMode,
    sourceHierarchyMode,
    chainLength: chain.length
  });
  
  // Build hierarchy params
  const hierarchyParams = new URLSearchParams({
    mode: mode,
    hierarchyItemId: item.id,
    hierarchyLevel: item.level.toString(),
    hierarchyName: item.name,
    hierarchyType: item.type,
    hierarchyMode: hierarchyMode // Add detected hierarchy mode
  });

  // Add parent hierarchy information if available
  if (item.parentId) {
    hierarchyParams.set('parentId', item.parentId);
  }

  // Instead of serializing the entire hierarchy chain, we'll reconstruct it on the client side
  // This prevents URLs from becoming too long (431 Request Header Fields Too Large error)
  
  return hierarchyParams;
};

/**
 * Create URL parameters for editing an existing MCQ
 * Use this when clicking directly on an MCQ item (edit mode)
 */
export const createMCQEditParams = (mcqItem: any, hierarchyChain?: HierarchyItem[]): URLSearchParams => {
  // Build complete hierarchy chain if not provided
  const chain = hierarchyChain || buildHierarchyChain(mcqItem);
  
  // When clicking directly on an MCQ item, it's for editing
  const mode = 'edit';
  
  // Build hierarchy params
  const hierarchyParams = new URLSearchParams({
    mode: mode,
    hierarchyItemId: mcqItem.id,
    hierarchyLevel: mcqItem.level.toString(),
    hierarchyName: mcqItem.name,
    hierarchyType: mcqItem.type,
    mcqId: mcqItem.id // Include MCQ ID for editing
  });

  // Add parent hierarchy information if available
  if (mcqItem.parentId) {
    hierarchyParams.set('parentId', mcqItem.parentId);
  }

  // Instead of serializing the entire hierarchy chain, we'll reconstruct it on the client side
  // This prevents URLs from becoming too long (431 Request Header Fields Too Large error)
  
  return hierarchyParams;
};

/**
 * Parse URL search parameters into MCQ hierarchy context
 * Used by all MCQ editor components
 */
export const parseMCQHierarchyParams = (searchParams: URLSearchParams): MCQHierarchyContext | null => {
  const mode = searchParams.get('mode') as 'new' | 'edit' || 'new';
  const hierarchyItemId = searchParams.get('hierarchyItemId');
  const hierarchyLevel = searchParams.get('hierarchyLevel');
  const hierarchyName = searchParams.get('hierarchyName');
  const hierarchyType = searchParams.get('hierarchyType');
  const hierarchyMode = searchParams.get('hierarchyMode') as 'question-bank' | 'previous-papers';
  const mcqId = searchParams.get('mcqId');

  console.log('Parsing hierarchy params:', {
    mode,
    hierarchyItemId,
    hierarchyLevel,
    hierarchyName,
    hierarchyType,
    hierarchyMode,
    mcqId
  });

  if (!hierarchyItemId || !hierarchyLevel || !hierarchyName || !hierarchyType) {
    console.log('Missing required hierarchy parameters');
    return null;
  }

  // Ensure we have a valid hierarchy mode
  const validHierarchyType = (hierarchyMode || hierarchyType) as HierarchyMode;
  const finalHierarchyType = (validHierarchyType === 'question-bank' || validHierarchyType === 'previous-papers') 
    ? validHierarchyType 
    : 'question-bank'; // fallback

  const result = {
    hierarchyItemId,
    hierarchyLevel: parseInt(hierarchyLevel),
    hierarchyName,
    hierarchyType: finalHierarchyType,
    hierarchyChain: [], // Empty array - will be populated by the MCQ component using GraphQL query
    mode,
    mcqId: mode === 'edit' && mcqId ? mcqId : undefined
  };

  console.log('Parsed hierarchy context:', result);
  return result;
};

/**
 * Rebuild hierarchy chain from hierarchyItemId using GraphQL query
 * This is used when the MCQ page loads with URL parameters that don't include the full hierarchy chain
 * @param hierarchyItemId - The ID of the hierarchy item to build chain for
 * @returns Promise<HierarchyItem[]> - Complete hierarchy chain from root to target item
 */
export const rebuildHierarchyChain = async (
  hierarchyItemId: string,
  hierarchyMode?: 'question-bank' | 'previous-papers'
): Promise<HierarchyItem[]> => {
  try {
    console.log('Rebuilding hierarchy chain for item:', hierarchyItemId, 'mode:', hierarchyMode);
    
    // Determine hierarchy mode if not provided
    const mode = hierarchyMode || await detectHierarchyTypeByItemLookup(hierarchyItemId);
    console.log('Using hierarchy mode:', mode);
    
    // Query the appropriate hierarchy based on mode
    let allItems: LibHierarchyItem[] = [];
    
    if (mode === 'previous-papers') {
      const result = await apolloClient.query<{ previousPapersHierarchyItems: LibHierarchyItem[] }>({
        query: GET_PREVIOUS_PAPERS_HIERARCHY_ITEMS,
        fetchPolicy: 'network-only' // Ensure fresh data
      });
      allItems = result.data?.previousPapersHierarchyItems || [];
    } else {
      // Default to question bank
      const result = await apolloClient.query<{ questionBankHierarchyItems: LibHierarchyItem[] }>({
        query: GET_QUESTION_BANK_HIERARCHY_ITEMS,
        fetchPolicy: 'network-only' // Ensure fresh data
      });
      allItems = result.data?.questionBankHierarchyItems || [];
    }
    
    // Find the target item by ID in the nested hierarchy
    const findItemById = (items: any[], id: string): any => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
          const found = findItemById(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const targetItem = findItemById(allItems, hierarchyItemId);
    if (!targetItem) {
      console.error(`Could not find hierarchy item with ID: ${hierarchyItemId}`);
      return [];
    }

    console.log('Found target item:', targetItem);
    
    // Build the hierarchy chain using existing function
    const chain = buildHierarchyChain(targetItem, allItems);
    console.log('Rebuilt hierarchy chain:', chain);
    
    return chain;
    
  } catch (error) {
    console.error('Error rebuilding hierarchy chain:', error);
    return [];
  }
};

/**
 * Navigate to MCQ editor with hierarchy data
 * Determines whether to use new or edit mode based on context
 */
export const navigateToMCQEditor = (router: any, item: any, allHierarchyItems?: any[], isEditMode: boolean = false, sourceHierarchyMode?: 'question-bank' | 'previous-papers'): void => {
  // Build complete hierarchy chain
  const hierarchyChain = buildHierarchyChain(item, allHierarchyItems);
  
  // Create URL parameters based on mode
  const params = isEditMode && item.level === 6 
    ? createMCQEditParams(item, hierarchyChain)  // Edit existing MCQ
    : createMCQNavigationParams(item, hierarchyChain, sourceHierarchyMode);  // Create new MCQ
  
  // Navigate to MCQ editor
  const url = `/admin/dashboard/question-bank-manager/mcq?${params.toString()}`;
  console.log(`Navigating to MCQ editor in ${isEditMode && item.level === 6 ? 'edit' : 'new'} mode:`, url);
  router.push(url);
};

/**
 * Navigate to MCQ editor for creating new MCQ (from hierarchy MCQ button)
 */
export const navigateToNewMCQ = (router: any, item: any, allHierarchyItems?: any[], sourceHierarchyMode?: 'question-bank' | 'previous-papers'): void => {
  navigateToMCQEditor(router, item, allHierarchyItems, false, sourceHierarchyMode);
};

/**
 * Navigate to MCQ editor for editing existing MCQ (from clicking MCQ item)
 */
export const navigateToEditMCQ = (router: any, mcqItem: any, allHierarchyItems?: any[]): void => {
  navigateToMCQEditor(router, mcqItem, allHierarchyItems, true);
};

/**
 * Validate hierarchy data before saving MCQ
 * Returns an object with validation state and message for better UX
 */
export const validateHierarchyData = (
  hierarchyContext: any, 
  isLoading: boolean = false,
  hierarchyType: HierarchyMode = 'question-bank'
): { isValid: boolean; isLoading: boolean; message?: string } => {
  console.log('[VALIDATION DEBUG] Starting validation with:', {
    hierarchyType,
    isLoading,
    hasContext: !!hierarchyContext,
    hierarchyItemId: hierarchyContext?.hierarchyItemId,
    chainLength: hierarchyContext?.hierarchyChain?.length || 0
  });

  // If we're still loading hierarchy data, don't validate yet
  if (isLoading) {
    return {
      isValid: false,
      isLoading: true,
      message: 'Loading hierarchy data...'
    };
  }

  // Check if hierarchy context exists
  if (!hierarchyContext?.hierarchyItemId) {
    return {
      isValid: false,
      isLoading: false,
      message: 'No hierarchy data found. Please select a hierarchy location before saving.'
    };
  }
  
  const hierarchyChain = hierarchyContext.hierarchyChain || [];
  
  if (!hierarchyChain || hierarchyChain.length === 0) {
    return {
      isValid: false,
      isLoading: false,
      message: 'Invalid hierarchy chain. Please select a complete hierarchy path.'
    };
  }
  
  // Get dynamic hierarchy configuration
  const config = getHierarchyConfig(hierarchyType);
  
  console.log('[VALIDATION DEBUG] Hierarchy configuration:', {
    mode: config.mode,
    maxLevels: config.maxLevels,
    levelNames: config.levelNames,
    hierarchyChainItems: hierarchyChain.map((item: any) => ({
      level: item.level,
      name: item.name,
      type: item.type
    }))
  });
  
  // Build required levels based on hierarchy configuration
  // All levels except the last one are required, last level (Chapter) is optional
  const requiredLevels: string[] = [];
  for (let level = 1; level < config.maxLevels; level++) {
    const levelName = config.levelNames[level];
    if (levelName) {
      requiredLevels.push(levelName);
    }
  }
  
  console.log('[VALIDATION DEBUG] Required levels:', requiredLevels);
  
  // Check if all required levels are present
  const presentLevels = hierarchyChain.map((item: any) => item.type);
  const hasRequiredLevels = requiredLevels.every(requiredType => 
    hierarchyChain.some((item: any) => item.type === requiredType)
  );
  
  console.log('[VALIDATION DEBUG] Level check:', {
    requiredLevels,
    presentLevels,
    hasRequiredLevels
  });
  
  if (!hasRequiredLevels) {
    const missingLevels = requiredLevels.filter(requiredType => 
      !hierarchyChain.some((item: any) => item.type === requiredType)
    );
    const lastLevelName = config.levelNames[config.maxLevels];
    
    console.log('[VALIDATION DEBUG] Validation failed:', {
      missingLevels,
      lastLevelName
    });
    
    return {
      isValid: false,
      isLoading: false,
      message: `Complete hierarchy path required. Missing: ${missingLevels.join(', ')}. (${lastLevelName} is optional)`
    };
  }
  
  console.log('[VALIDATION DEBUG] Validation passed');
  return {
    isValid: true,
    isLoading: false
  };
};

/**
 * Handle MCQ save with hierarchy context
 */
export const handleMCQSave = async (
  mcqData: any, 
  hierarchyContext: MCQHierarchyContext | null,
  isLoading: boolean = false,
  onSuccess?: () => void,
  onError?: (error: any) => void
) => {
  // Convert hierarchyType string to proper HierarchyMode
  let hierarchyType: HierarchyMode = 'question-bank'; // default
  
  if (hierarchyContext?.hierarchyType) {
    // Handle both the hierarchy mode strings and individual type names
    if (hierarchyContext.hierarchyType === 'previous-papers' || hierarchyContext.hierarchyType === 'question-bank') {
      hierarchyType = hierarchyContext.hierarchyType as HierarchyMode;
    } else {
      // If it's an individual type like 'Exam', 'Year', etc., map it to hierarchy mode
      const typeToModeMapping: Record<string, HierarchyMode> = {
        'Year': 'question-bank',
        'Subject': 'question-bank',
        'Part': 'question-bank',
        'Section': 'question-bank',
        'Chapter': 'question-bank',
        'Exam': 'previous-papers',
        // Previous papers uses 'Year' for level 2 but stored as 'Subject' type in some contexts
      };
      
      hierarchyType = typeToModeMapping[hierarchyContext.hierarchyType] || 'question-bank';
    }
  }
  
  console.log('[MCQ DEBUG] Hierarchy type resolution:', {
    contextHierarchyType: hierarchyContext?.hierarchyType,
    resolvedHierarchyType: hierarchyType,
    hierarchyChainLength: hierarchyContext?.hierarchyChain?.length || 0,
    hierarchyChain: hierarchyContext?.hierarchyChain?.map(item => ({
      level: item.level,
      name: item.name,
      type: item.type
    }))
  });
  
  const validation = validateHierarchyData(hierarchyContext, isLoading, hierarchyType);
  
  if (!validation.isValid) {
    if (validation.message && !validation.isLoading) {
      alert(`Error: ${validation.message}`);
    }
    return false;
  }

  try {
    console.log('[MCQ DEBUG] Starting MCQ save process:', {
      mcqData: {
        id: mcqData.id,
        type: mcqData.type,
        question: mcqData.question?.substring(0, 100) + '...',
        explanation: mcqData.explanation?.substring(0, 100) + '...',
        difficulty: mcqData.difficulty,
        points: mcqData.points,
        timeLimit: mcqData.timeLimit,
        tags: mcqData.tags,
        optionsCount: mcqData.options?.length
      },
      hierarchyContext
    });
    
    // Helper function to convert camelCase to UPPER_SNAKE_CASE
    const convertTypeToDbFormat = (type: string): string => {
      const mapping = {
        'singleChoice': 'SINGLE_CHOICE',
        'multipleChoice': 'MULTIPLE_CHOICE',
        'trueFalse': 'TRUE_FALSE',
        'assertionReasoning': 'ASSERTION_REASONING'
      };
      
      console.log('[MCQ DEBUG] Converting question type:', {
        input: type,
        output: mapping[type as keyof typeof mapping] || 'SINGLE_CHOICE'
      });
      
      return mapping[type as keyof typeof mapping] || 'SINGLE_CHOICE';
    };
    
    // Convert MCQ data to the format expected by the service
    const questionData: CreateQuestionData = {
      type: convertTypeToDbFormat(mcqData.type || 'singleChoice') as any,
      question: mcqData.question || '',
      explanation: mcqData.explanation,
      references: mcqData.references,
      difficulty: mcqData.difficulty?.toUpperCase() as any || 'MEDIUM',
      points: mcqData.points || 1,
      timeLimit: mcqData.timeLimit || 60,
      tags: mcqData.tags || [],
      sourceTags: mcqData.sourceTags || [],
      examTags: mcqData.examTags || [],
      hierarchyItemId: hierarchyContext?.hierarchyItemId || '',
      hierarchyType: hierarchyType,
      options: mcqData.options?.map((opt: any) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        order: parseInt(opt.id) - 1, // Convert string id to numeric order
        explanation: opt.explanation,
        references: opt.references
      })),
      assertion: mcqData.assertion,
      reasoning: mcqData.reasoning,
      createdBy: 'admin' // TODO: Get from user context
    };

    console.log('[MCQ DEBUG] Final question data for API:', {
      ...questionData,
      options: questionData.options?.map((opt, idx) => ({
        index: idx,
        text: opt.text.substring(0, 50) + '...',
        isCorrect: opt.isCorrect,
        order: opt.order
      }))
    });
    
    console.log('[MCQ DEBUG] Making API call to create question...');
    
    // Make actual API call to save MCQ
    const savedQuestion = await mcqService.createQuestion(questionData);
    
    console.log('[MCQ DEBUG] MCQ saved successfully:', {
      id: savedQuestion.id,
      humanId: savedQuestion.humanId,
      type: savedQuestion.type,
      difficulty: savedQuestion.difficulty,
      points: savedQuestion.points,
      timeLimit: savedQuestion.timeLimit,
      optionsCount: savedQuestion.options?.length,
      tags: savedQuestion.tags
    });
    
    const message = hierarchyContext?.mode === 'edit' 
      ? 'MCQ updated successfully! Changes will be reviewed before being published.'
      : `MCQ saved successfully! Question ID: ${savedQuestion.humanId}. It will be reviewed before being published.`;
    
    console.log('[MCQ DEBUG] Success message:', message);
    // Note: Success is handled by MCQSuccessModal in the calling component
    
    onSuccess?.();
    return true;
  } catch (error) {
    console.error('[MCQ DEBUG] Error saving MCQ:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      mcqType: mcqData.type,
      questionLength: mcqData.question?.length,
      optionsCount: mcqData.options?.length,
      hierarchyId: hierarchyContext?.hierarchyItemId
    });
    
    let errorMessage = 'Unknown error occurred';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for common GraphQL/validation errors
      if (error.message.includes('GraphQL error') || error.message.includes('400')) {
        errorDetails = 'This appears to be a validation error. Please check your data format.';
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorDetails = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        errorDetails = 'Authorization error. Please refresh and try again.';
      }
    }
    
    const debugInfo = `
MCQ Save Error Details:
- Question Type: ${mcqData.type}
- Question Length: ${mcqData.question?.length} chars
- Options Count: ${mcqData.options?.length}
- Source Tags: ${mcqData.sourceTags?.length || 0}
- Exam Tags: ${mcqData.examTags?.length || 0}
- Has Explanation: ${!!mcqData.explanation}
- Has References: ${!!mcqData.references}
- Hierarchy ID: ${hierarchyContext?.hierarchyItemId}
- Error: ${errorMessage}
${errorDetails ? '- Details: ' + errorDetails : ''}
    `;
    
    console.log('[MCQ DEBUG] Full error details:', debugInfo);
    
    // Provide user-friendly error message
    const userMessage = `Failed to save MCQ: ${errorMessage}${errorDetails ? '\\n' + errorDetails : ''}`;
    onError?.(userMessage);
    return false;
  }
};