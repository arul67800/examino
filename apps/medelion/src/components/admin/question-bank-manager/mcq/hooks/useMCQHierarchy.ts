import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MCQHierarchyContext, parseMCQHierarchyParams, rebuildHierarchyChain } from '../utils/hierarchy-navigation';

/**
 * Custom hook for managing MCQ hierarchy state
 * Can be used across all MCQ editor components (page, modal, inline)
 */
export const useMCQHierarchy = () => {
  const searchParams = useSearchParams();
  const [hierarchyContext, setHierarchyContext] = useState<MCQHierarchyContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRebuildingChain, setIsRebuildingChain] = useState(false);

  // Process URL parameters or props on component mount
  useEffect(() => {
    const processHierarchyContext = async () => {
      setIsLoading(true);
      
      try {
        // Try to parse from URL parameters first (for page view)
        const urlParams = new URLSearchParams(searchParams.toString());
        console.log('Raw search params:', searchParams.toString());
        console.log('URL params object:', Object.fromEntries(urlParams));
        
        const parsedContext = parseMCQHierarchyParams(urlParams);
        
        if (parsedContext) {
          console.log('MCQ Hierarchy loaded from URL:', parsedContext);
          
          // If hierarchy type is still the fallback individual type (not 'question-bank' or 'previous-papers')
          // we need to detect the correct hierarchy type
          if (parsedContext.hierarchyType !== 'question-bank' && parsedContext.hierarchyType !== 'previous-papers') {
            console.log('Detecting hierarchy type for item:', parsedContext.hierarchyItemId);
            try {
              const { detectHierarchyTypeByItemLookup } = await import('../utils/hierarchy-navigation');
              const detectedType = await detectHierarchyTypeByItemLookup(parsedContext.hierarchyItemId);
              console.log('Detected hierarchy type:', detectedType);
              parsedContext.hierarchyType = detectedType;
            } catch (error) {
              console.error('Failed to detect hierarchy type:', error);
              parsedContext.hierarchyType = 'question-bank'; // fallback
            }
          }
          
          // If hierarchy chain is empty (due to URL parameter length fix), rebuild it
          if (parsedContext.hierarchyChain.length === 0 && parsedContext.hierarchyItemId) {
            console.log('Rebuilding hierarchy chain from item ID:', parsedContext.hierarchyItemId, 'with hierarchy type:', parsedContext.hierarchyType);
            
            setIsRebuildingChain(true);
            try {
              const { rebuildHierarchyChain } = await import('../utils/hierarchy-navigation');
              const rebuiltChain = await rebuildHierarchyChain(parsedContext.hierarchyItemId, parsedContext.hierarchyType);
              parsedContext.hierarchyChain = rebuiltChain;
              console.log('Successfully rebuilt hierarchy chain:', rebuiltChain);
            } catch (error) {
              console.error('Failed to rebuild hierarchy chain:', error);
            } finally {
              setIsRebuildingChain(false);
            }
          }
          
          setHierarchyContext(parsedContext);
        } else {
          console.log('No valid hierarchy context found in URL');
        }
      } catch (error) {
        console.error('Error parsing hierarchy context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processHierarchyContext();
  }, [searchParams]);

  // Set hierarchy context manually (for modal/inline views)
  const setHierarchy = (context: MCQHierarchyContext) => {
    console.log('Setting MCQ hierarchy context:', context);
    setHierarchyContext(context);
  };

  // Update hierarchy context
  const updateHierarchy = (updates: Partial<MCQHierarchyContext>) => {
    if (hierarchyContext) {
      const updatedContext = { ...hierarchyContext, ...updates };
      console.log('Updating MCQ hierarchy context:', updatedContext);
      setHierarchyContext(updatedContext);
    }
  };

  // Clear hierarchy context
  const clearHierarchy = () => {
    console.log('Clearing MCQ hierarchy context');
    setHierarchyContext(null);
  };

  return {
    hierarchyContext,
    isLoading: isLoading || isRebuildingChain, // Include rebuild state in loading
    isRebuildingChain,
    setHierarchy,
    updateHierarchy,
    clearHierarchy,
    hasValidHierarchy: !!hierarchyContext?.hierarchyItemId && !isRebuildingChain
  };
};