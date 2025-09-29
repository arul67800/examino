"use client";

export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order?: number;
  explanation?: string; // Frontend-only field for now
  references?: string; // Frontend-only field for now
}

export interface CreateQuestionData {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question: string;
  explanation?: string;
  references?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  sourceTags?: string[];
  examTags?: string[];
  hierarchyItemId: string;
  hierarchyType?: 'question-bank' | 'previous-papers'; // TODO: Backend schema needs to be updated to support this field
  options?: QuestionOption[];
  assertion?: string;
  reasoning?: string;
  createdBy?: string;
}

export interface UpdateQuestionData {
  type?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question?: string;
  explanation?: string;
  references?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  sourceTags?: string[];
  examTags?: string[];
  hierarchyType?: 'question-bank' | 'previous-papers'; // TODO: Backend schema needs to be updated to support this field
  options?: QuestionOption[];
  assertion?: string;
  reasoning?: string;
}

export interface Question {
  id: string;
  humanId: string;
  type: string;
  question: string;
  explanation?: string;
  references?: string;
  difficulty: string;
  points: number;
  timeLimit?: number;
  tags: string[];
  sourceTags?: string[];
  examTags?: string[];
  options: QuestionOption[];
  assertion?: string;
  reasoning?: string;
  isActive: boolean;
  hierarchyItemId: string;
  hierarchyType?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedQuestions {
  questions: Question[];
  total: number;
  page: number;
  pages: number;
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/graphql';

// Validate endpoint configuration
if (typeof window !== 'undefined') {
  console.log('[MCQ SERVICE DEBUG] GraphQL endpoint configured:', GRAPHQL_ENDPOINT);
}

class McqService {
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'query { __typename }', // Simple introspection query
        }),
      });
      
      if (response.ok) {
        return { connected: true };
      } else {
        return { 
          connected: false, 
          error: `HTTP ${response.status}: ${response.statusText}` 
        };
      }
    } catch (error) {
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown connection error' 
      };
    }
  }

  private async graphqlRequest(query: string, variables?: any): Promise<any> {
    console.log('[MCQ SERVICE DEBUG] Sending GraphQL request:', {
      endpoint: GRAPHQL_ENDPOINT,
      queryType: query.trim().startsWith('mutation') ? 'mutation' : 'query',
      query: query.replace(/\s+/g, ' ').trim(),
      variables: variables ? JSON.stringify(variables, null, 2) : 'none'
    });

    let response;
    try {
      response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });
    } catch (fetchError) {
      console.error('[MCQ SERVICE DEBUG] Network/Fetch error:', {
        error: fetchError,
        message: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        endpoint: GRAPHQL_ENDPOINT,
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      });
      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Failed to connect to GraphQL endpoint'}`);
    }

    console.log('[MCQ SERVICE DEBUG] HTTP response status:', response.status, response.statusText);

    if (!response.ok) {
      let responseText = '';
      let responseHeaders = {};
      
      try {
        responseText = await response.text();
      } catch (e) {
        responseText = `Could not read response text: ${e instanceof Error ? e.message : 'Unknown error'}`;
      }
      
      try {
        responseHeaders = Object.fromEntries(response.headers.entries());
      } catch (e) {
        responseHeaders = { error: 'Could not read response headers' };
      }
      
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: GRAPHQL_ENDPOINT,
        responseText: responseText.substring(0, 500), // Limit length for logging
        headers: responseHeaders,
        requestBody: JSON.stringify({ query, variables }, null, 2).substring(0, 1000) // Include request for debugging
      };
      
      console.error('[MCQ SERVICE DEBUG] HTTP error details:', errorDetails);
      console.error('[MCQ SERVICE DEBUG] Full HTTP error object:', response);
      
      // Provide more specific error messages
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      if (response.status === 404) {
        errorMessage += ` - GraphQL endpoint not found. Check if API server is running at ${GRAPHQL_ENDPOINT}`;
      } else if (response.status >= 500) {
        errorMessage += ` - Server error. Check API server logs.`;
      } else if (response.status === 400) {
        errorMessage += ` - Bad request. Check GraphQL query syntax.`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    console.log('[MCQ SERVICE DEBUG] GraphQL response:', {
      hasData: !!result.data,
      hasErrors: !!result.errors,
      errorCount: result.errors?.length || 0,
      dataKeys: result.data ? Object.keys(result.data) : []
    });

    if (result.errors) {
      console.error('[MCQ SERVICE DEBUG] GraphQL errors:', result.errors);
      console.error('[MCQ SERVICE DEBUG] Detailed error analysis:', {
        errorCount: result.errors.length,
        errors: result.errors.map((error: any, index: number) => ({
          index,
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: error.extensions
        }))
      });
      throw new Error(`GraphQL error: ${result.errors[0]?.message || 'Unknown GraphQL error occurred'}`);
    }

    return result.data;
  }

    // Helper method to map new hierarchy IDs to legacy hierarchy IDs for backend compatibility
  private async mapToLegacyHierarchyId(hierarchyItemId: string, hierarchyType: 'question-bank' | 'previous-papers' = 'question-bank'): Promise<string> {
    console.log('[MCQ SERVICE DEBUG] Simple hierarchy ID mapping:', { 
      hierarchyItemId, 
      hierarchyType
    });
    
    try {
      // Simplified approach: Just get any legacy hierarchy item and use it for mapping
      // This is a temporary workaround to get MCQs working while the backend is updated
      
      const legacyItemsQuery = `
        query GetLegacyItems {
          hierarchyItems {
            id
            name
            level
            type
          }
        }
      `;
      
      const legacyItemsResult = await this.graphqlRequest(legacyItemsQuery);
      const legacyItems = legacyItemsResult.hierarchyItems || [];
      
      if (legacyItems.length === 0) {
        throw new Error('No legacy hierarchy items available for mapping');
      }
      
      // For now, use the first available legacy item
      // In the future, this should be more intelligent mapping based on hierarchy structure
      const mappedLegacyId = legacyItems[0].id;
      
      console.log('[MCQ SERVICE DEBUG] Simple mapping completed:', {
        originalId: hierarchyItemId,
        originalHierarchyType: hierarchyType,
        mappedLegacyId: mappedLegacyId,
        mappedToItem: legacyItems[0],
        note: 'Using simple mapping to first available legacy item (temporary solution)'
      });
      
      return mappedLegacyId;
      
    } catch (error: any) {
      console.error('[MCQ SERVICE DEBUG] Simple mapping failed:', error);
      throw new Error(`Failed to map hierarchy ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    try {
      // First, try to find if this ID already exists in legacy hierarchy (for backward compatibility)
      const legacyCheckQuery = `
        query CheckLegacyHierarchy($id: ID!) {
          hierarchyItem(id: $id) {
            id
            name
            level
            type
          }
        }
      `;
      
      const legacyResult = await this.graphqlRequest(legacyCheckQuery, { id: hierarchyItemId });
      
      console.log('[MCQ SERVICE DEBUG] Legacy hierarchy check result:', {
        hasHierarchyItem: !!legacyResult.hierarchyItem,
        hierarchyItem: legacyResult.hierarchyItem
      });
      
      if (legacyResult.hierarchyItem) {
        console.log('[MCQ SERVICE DEBUG] Found existing legacy hierarchy item:', legacyResult.hierarchyItem);
        return hierarchyItemId; // Already a legacy ID, use as-is
      }
      
      // If not found in legacy, try to find it in the new hierarchy system
      let hierarchyQuery;
      if (hierarchyType === 'question-bank') {
        hierarchyQuery = `
          query GetQuestionBankItem($id: ID!) {
            questionBankHierarchyItem(id: $id) {
              id
              name
              level
              type
              parentId
            }
          }
        `;
      } else {
        hierarchyQuery = `
          query GetPreviousPapersItem($id: ID!) {
            previousPapersHierarchyItem(id: $id) {
              id
              name
              level
              type
              parentId
            }
          }
        `;
      }
      
      const hierarchyResult = await this.graphqlRequest(hierarchyQuery, { id: hierarchyItemId });
      const hierarchyItem = hierarchyResult.questionBankHierarchyItem || hierarchyResult.previousPapersHierarchyItem;
      
      console.log('[MCQ SERVICE DEBUG] New hierarchy system check result:', {
        hierarchyType,
        queryResult: hierarchyResult,
        hasQuestionBankItem: !!hierarchyResult.questionBankHierarchyItem,
        hasPreviousPapersItem: !!hierarchyResult.previousPapersHierarchyItem,
        foundItem: hierarchyItem
      });
      
      if (!hierarchyItem) {
        // Before throwing error, let's check if the ID exists in the other hierarchy system
        console.log('[MCQ SERVICE DEBUG] Item not found in expected hierarchy, checking the other system...');
        
        const alternateHierarchyType = hierarchyType === 'question-bank' ? 'previous-papers' : 'question-bank';
        let alternateQuery;
        
        if (alternateHierarchyType === 'question-bank') {
          alternateQuery = `
            query GetQuestionBankItem($id: ID!) {
              questionBankHierarchyItem(id: $id) {
                id
                name
                level
                type
                parentId
              }
            }
          `;
        } else {
          alternateQuery = `
            query GetPreviousPapersItem($id: ID!) {
              previousPapersHierarchyItem(id: $id) {
                id
                name
                level
                type
                parentId
              }
            }
          `;
        }
        
        try {
          const alternateResult = await this.graphqlRequest(alternateQuery, { id: hierarchyItemId });
          const alternateItem = alternateResult.questionBankHierarchyItem || alternateResult.previousPapersHierarchyItem;
          
          if (alternateItem) {
            console.log('[MCQ SERVICE DEBUG] Found item in alternate hierarchy system:', {
              alternateHierarchyType,
              item: alternateItem,
              note: 'Using item from alternate hierarchy system for mapping'
            });
            // Use the item from the alternate system for mapping
            return await this.mapToLegacyHierarchyId(hierarchyItemId, alternateHierarchyType);
          }
        } catch (alternateError) {
          console.log('[MCQ SERVICE DEBUG] Alternate hierarchy check also failed:', alternateError);
        }
        
        throw new Error(`Hierarchy item with ID ${hierarchyItemId} not found in any hierarchy system (checked ${hierarchyType} and alternate system). Please verify the hierarchy item exists.`);
      }
      
      console.log('[MCQ SERVICE DEBUG] Found new hierarchy item:', hierarchyItem);
      
      // For now, create a mapping by finding a suitable legacy hierarchy item
      // This is a temporary workaround until the backend is updated
      const legacyMappingQuery = `
        query FindLegacyMapping {
          hierarchyItems {
            id
            name
            level
            type
          }
        }
      `;
      
      const legacyItemsResult = await this.graphqlRequest(legacyMappingQuery);
      const legacyItems = legacyItemsResult.hierarchyItems || [];
      
      // Find a legacy item that matches the same level and similar naming pattern
      let mappedLegacyId;
      
      if (hierarchyType === 'question-bank') {
        // For question bank, prefer items without [PREVIOUS-PAPERS] prefix
        mappedLegacyId = legacyItems.find((item: any) => 
          item.level === hierarchyItem.level && 
          item.type === hierarchyItem.type && 
          !item.name.includes('[PREVIOUS-PAPERS]')
        )?.id;
      } else {
        // For previous papers, prefer items with [PREVIOUS-PAPERS] prefix
        mappedLegacyId = legacyItems.find((item: any) => 
          item.level === hierarchyItem.level && 
          item.type === hierarchyItem.type && 
          item.name.includes('[PREVIOUS-PAPERS]')
        )?.id;
      }
      
      // Fallback: use any legacy item of the same level and type
      if (!mappedLegacyId) {
        mappedLegacyId = legacyItems.find((item: any) => 
          item.level === hierarchyItem.level && 
          item.type === hierarchyItem.type
        )?.id;
      }
      
      // Final fallback: use the first available legacy item
      if (!mappedLegacyId && legacyItems.length > 0) {
        mappedLegacyId = legacyItems[0].id;
        console.warn('[MCQ SERVICE DEBUG] Using fallback legacy hierarchy ID:', mappedLegacyId);
      }
      
      if (!mappedLegacyId) {
        throw new Error('No suitable legacy hierarchy item found for mapping');
      }
      
      console.log('[MCQ SERVICE DEBUG] Mapped to legacy hierarchy ID:', {
        original: hierarchyItemId,
        mapped: mappedLegacyId,
        hierarchyType
      });
      
      return mappedLegacyId;
      
    } catch (error: any) {
      console.error('[MCQ SERVICE DEBUG] Error mapping hierarchy ID:', error);
      throw new Error(`Failed to map hierarchy ID: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Helper method to generate structured MCQ IDs: {QB|PP}-{5-digit-level-code}-{7-digit-mcq-number}
  private async generateStructuredMCQId(hierarchyItemId: string, hierarchyType: 'question-bank' | 'previous-papers'): Promise<string> {
    console.log('[MCQ SERVICE DEBUG] Generating structured MCQ ID:', { hierarchyItemId, hierarchyType });
    
    try {
      // Get hierarchy chain to build level codes
      const hierarchyChain = await this.getHierarchyChain(hierarchyItemId, hierarchyType);
      
      // Generate prefix based on hierarchy type
      const prefix = hierarchyType === 'question-bank' ? 'QB' : 'PP';
      
      // Generate 5-digit level code based on hierarchy levels
      const levelCode = this.generateLevelCode(hierarchyChain);
      
      // Get next MCQ sequence number (7 digits)
      const mcqNumber = await this.getNextMCQNumber();
      
      const structuredId = `${prefix}-${levelCode}-${mcqNumber}`;
      
      console.log('[MCQ SERVICE DEBUG] Generated structured ID:', {
        hierarchyItemId,
        hierarchyType,
        prefix,
        levelCode,
        mcqNumber,
        finalId: structuredId,
        hierarchyChain: hierarchyChain.map(item => ({ level: item.level, name: item.name, type: item.type }))
      });
      
      return structuredId;
      
    } catch (error: any) {
      console.error('[MCQ SERVICE DEBUG] Error generating structured ID:', error);
      // Fallback to a simple format if hierarchy chain retrieval fails
      const prefix = hierarchyType === 'question-bank' ? 'QB' : 'PP';
      const mcqNumber = await this.getNextMCQNumber();
      const fallbackId = `${prefix}-00000-${mcqNumber}`;
      
      console.log('[MCQ SERVICE DEBUG] Using fallback ID:', fallbackId);
      return fallbackId;
    }
  }

  // Helper method to get hierarchy chain for ID generation
  private async getHierarchyChain(hierarchyItemId: string, hierarchyType: 'question-bank' | 'previous-papers'): Promise<any[]> {
    try {
      // Query to get the hierarchy item and build chain
      let query;
      if (hierarchyType === 'question-bank') {
        query = `
          query GetHierarchyChain($id: ID!) {
            questionBankHierarchyItem(id: $id) {
              id
              name
              level
              type
              order
              parentId
            }
          }
        `;
      } else {
        query = `
          query GetHierarchyChain($id: ID!) {
            previousPapersHierarchyItem(id: $id) {
              id
              name
              level
              type
              order
              parentId
            }
          }
        `;
      }
      
      const result = await this.graphqlRequest(query, { id: hierarchyItemId });
      const item = result.questionBankHierarchyItem || result.previousPapersHierarchyItem;
      
      if (!item) {
        throw new Error(`Hierarchy item not found: ${hierarchyItemId}`);
      }
      
      // Build full hierarchy chain by traversing up through parentId relationships
      const hierarchyChain = [item];
      let currentItem = item;
      
      // Traverse up to build complete chain
      while (currentItem.parentId) {
        const parentQuery = hierarchyType === 'question-bank' ? `
          query GetParentItem($id: ID!) {
            questionBankHierarchyItem(id: $id) {
              id
              name
              level
              type
              order
              parentId
            }
          }
        ` : `
          query GetParentItem($id: ID!) {
            previousPapersHierarchyItem(id: $id) {
              id
              name
              level
              type
              order
              parentId
            }
          }
        `;
        
        try {
          const parentResult = await this.graphqlRequest(parentQuery, { id: currentItem.parentId });
          const parentItem = parentResult.questionBankHierarchyItem || parentResult.previousPapersHierarchyItem;
          
          if (parentItem) {
            hierarchyChain.unshift(parentItem); // Add to beginning (root to deepest)
            currentItem = parentItem;
          } else {
            break;
          }
        } catch (error) {
          console.error('[MCQ SERVICE DEBUG] Error getting parent item:', error);
          break; // Stop traversal on error
        }
      }
      
      console.log('[MCQ SERVICE DEBUG] Built hierarchy chain:', {
        hierarchyItemId,
        chainLength: hierarchyChain.length,
        chain: hierarchyChain.map(item => ({ level: item.level, name: item.name, order: item.order }))
      });
      
      return hierarchyChain;
      
    } catch (error) {
      console.error('[MCQ SERVICE DEBUG] Error getting hierarchy chain:', error);
      throw error;
    }
  }

  // Helper method to generate level code from hierarchy chain
  private generateLevelCode(hierarchyChain: any[]): string {
    try {
      // Initialize level digits array with 5 positions (all 0 initially)
      const levelDigits = [0, 0, 0, 0, 0];
      
      if (hierarchyChain.length === 0) {
        return '00000';
      }
      
      // Process ALL items in the hierarchy chain, not just the deepest
      // hierarchyChain should be ordered from root to deepest level
      hierarchyChain.forEach((item, index) => {
        const level = item.level || 1;
        const order = item.order || 1;
        
        console.log(`[MCQ SERVICE DEBUG] Processing hierarchy item ${index}:`, {
          name: item.name,
          level,
          order,
          hasOrderField: 'order' in item,
          item
        });
        
        // Set digit for each level in the path
        if (level >= 1 && level <= 5) {
          // Handle order = 0 case by using level as fallback, or use order if > 0
          let digit;
          if (order === 0 || order === undefined || order === null) {
            // If order is 0/undefined/null, use the level itself as the digit
            digit = level % 10;
          } else {
            // Use first digit of order if order > 9, otherwise use order itself
            digit = order > 9 ? Math.floor(order / 10) % 10 : order % 10;
          }
          levelDigits[level - 1] = digit;
          
          console.log(`[MCQ SERVICE DEBUG] Set level ${level} digit to ${digit} (from order ${order}, used fallback: ${order === 0 || order === undefined || order === null})`);
        }
      });
      
      // Convert to string
      const levelCode = levelDigits.join('');
      
      console.log('[MCQ SERVICE DEBUG] Generated level code with full hierarchy:', {
        hierarchyChain: hierarchyChain.map(item => ({
          name: item.name,
          level: item.level,
          order: item.order
        })),
        levelDigits,
        levelCode
      });
      
      return levelCode;
      
    } catch (error) {
      console.error('[MCQ SERVICE DEBUG] Error generating level code:', error);
      return '00000';
    }
  }

  // Helper method to generate simple hash for level codes
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000; // Keep it within 3 digits
  }

  // Helper method to get next MCQ sequence number
  private async getNextMCQNumber(): Promise<string> {
    try {
      // Use timestamp-based unique number since count query is not available
      // This ensures uniqueness across multiple simultaneous MCQ creations
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000); // Add some randomness
      const uniqueNumber = (timestamp + randomSuffix) % 10000000; // Keep within 7 digits
      
      const mcqNumber = uniqueNumber.toString().padStart(7, '0');
      
      console.log('[MCQ SERVICE DEBUG] Generated MCQ sequence number:', {
        timestamp,
        randomSuffix,
        uniqueNumber,
        mcqNumber
      });
      
      return mcqNumber;
      
    } catch (error) {
      console.error('[MCQ SERVICE DEBUG] Error generating MCQ number:', error);
      // Ultimate fallback: use simple timestamp, padded to 7 digits
      const fallbackNumber = (Date.now() % 10000000).toString().padStart(7, '0');
      return fallbackNumber;
    }
  }

  // Tags API methods
  async getTagsByCategory(category: 'SOURCES' | 'EXAMS'): Promise<any[]> {
    const query = `
      query GetTagsByCategory($category: TagCategory!) {
        getTagsByCategory(category: $category) {
          id
          name
          category
          usageCount
          createdBy
          isPreset
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlRequest(query, { category });
    return result.getTagsByCategory;
  }

  async getAllTags(): Promise<any[]> {
    const query = `
      query GetAllTags {
        getAllTags {
          id
          name
          category
          usageCount
          createdBy
          isPreset
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlRequest(query);
    return result.getAllTags;
  }

  async createOrUpdateTag(name: string, category: 'SOURCES' | 'EXAMS', createdBy?: string): Promise<any> {
    const mutation = `
      mutation CreateOrUpdateTag($input: CreateTagInputGQL!) {
        createOrUpdateTag(input: $input) {
          id
          name
          category
          usageCount
          createdBy
          isPreset
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlRequest(mutation, { 
      input: { name, category, createdBy } 
    });
    return result.createOrUpdateTag;
  }

  async initializePresetTags(): Promise<boolean> {
    const mutation = `
      mutation InitializePresetTags {
        initializePresetTags
      }
    `;

    const result = await this.graphqlRequest(mutation);
    return result.initializePresetTags;
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    console.log('[MCQ SERVICE DEBUG] createQuestion called with data:', {
      type: data.type,
      question: data.question.substring(0, 100) + '...',
      explanation: data.explanation?.substring(0, 100) + '...',
      references: data.references?.substring(0, 100) + '...',
      difficulty: data.difficulty,
      points: data.points,
      timeLimit: data.timeLimit,
      tags: data.tags,
      sourceTags: data.sourceTags,
      examTags: data.examTags,
      hierarchyItemId: data.hierarchyItemId,
      optionsCount: data.options?.length,
      hasAssertion: !!data.assertion,
      hasReasoning: !!data.reasoning
    });
    
    // Test connection first
    const connectionTest = await this.testConnection();
    if (!connectionTest.connected) {
      throw new Error(`Cannot connect to GraphQL API: ${connectionTest.error}. Please ensure the API server is running at ${GRAPHQL_ENDPOINT}`);
    }

    const mutation = `
      mutation CreateQuestion($input: CreateQuestionInputGQL!) {
        createQuestion(input: $input) {
          id
          humanId
          type
          question
          explanation
          references
          difficulty
          points
          timeLimit
          tags
          sourceTags
          examTags
          options {
            id
            text
            isCorrect
            order
            explanation
            references
            questionId
            createdAt
            updatedAt
          }
          assertion
          reasoning
          isActive
          hierarchyItemId
          createdBy
          createdAt
          updatedAt
        }
      }
    `;

    // Extract hierarchyType and map hierarchyItemId to legacy system for backend compatibility
    const { hierarchyType, hierarchyItemId, ...cleanedData } = data;
    
    console.log('[MCQ SERVICE DEBUG] Processing hierarchy data:', { 
      hierarchyType, 
      originalHierarchyItemId: hierarchyItemId,
      fullDataKeys: Object.keys(data),
      dataWithHierarchyFields: {
        hierarchyType: data.hierarchyType,
        hierarchyItemId: data.hierarchyItemId
      }
    });

    // Map to legacy hierarchy ID for backend compatibility
    const mappedHierarchyItemId = await this.mapToLegacyHierarchyId(
      hierarchyItemId, 
      hierarchyType || 'question-bank'
    );

    const finalData = {
      ...cleanedData,
      hierarchyItemId: mappedHierarchyItemId,
      // Pass original hierarchy metadata for structured ID generation
      originalHierarchyItemId: hierarchyItemId,
      hierarchyType: hierarchyType || 'question-bank'
    };

    // Note: We'll handle the structured ID after the question is created
    // since the backend generates its own humanId
    
    console.log('[MCQ SERVICE DEBUG] Making GraphQL request...');
    console.log('[MCQ SERVICE DEBUG] GraphQL Variables:', { input: finalData });
    console.log('[MCQ SERVICE DEBUG] Hierarchy mapping:', {
      original: hierarchyItemId,
      mapped: mappedHierarchyItemId,
      type: hierarchyType
    });

    try {
      const result = await this.graphqlRequest(mutation, { input: finalData });
      
      console.log('[MCQ SERVICE DEBUG] GraphQL response:', {
        success: !!result.createQuestion,
        questionId: result.createQuestion?.id,
        humanId: result.createQuestion?.humanId,
        type: result.createQuestion?.type
      });

      // Generate and log the structured ID for reference
      if (result.createQuestion?.id) {
        try {
          const structuredId = await this.generateStructuredMCQId(hierarchyItemId, hierarchyType || 'question-bank');
          
          console.log('[MCQ SERVICE DEBUG] Generated structured ID for reference:', {
            questionId: result.createQuestion.id,
            backendHumanId: result.createQuestion.humanId,
            proposedStructuredId: structuredId,
            note: 'Backend humanId is read-only, but structured ID generated for future use'
          });
          
          // For now, we'll use the backend-generated humanId
          // In the future, the backend could be modified to accept custom humanIds
          
        } catch (idError) {
          console.error('[MCQ SERVICE DEBUG] Failed to generate structured ID:', idError);
        }
      }
      
      return result.createQuestion;
    } catch (error) {
      console.error('[MCQ SERVICE DEBUG] GraphQL request failed:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        inputData: data
      });
      throw error;
    }
  }

  async updateQuestion(id: string, data: UpdateQuestionData): Promise<Question> {
    const mutation = `
      mutation UpdateQuestion($id: String!, $input: UpdateQuestionInputGQL!) {
        updateQuestion(id: $id, input: $input) {
          id
          humanId
          type
          question
          explanation
          references
          difficulty
          points
          timeLimit
          tags
          sourceTags
          examTags
          options {
            id
            text
            isCorrect
            order
            explanation
            references
            questionId
            createdAt
            updatedAt
          }
          assertion
          reasoning
          isActive
          hierarchyItemId
          createdBy
          createdAt
          updatedAt
        }
      }
    `;

    // Extract hierarchyType for logging but keep cleanedData without it for now
    const { hierarchyType, ...cleanedData } = data;
    
    console.log('[MCQ SERVICE DEBUG] UpdateQuestion - Processing with hierarchyType:', hierarchyType);
    
    // Note: For updates, we don't change the hierarchy mapping as it should remain consistent
    // The hierarchyType is mainly used for create operations
    
    const result = await this.graphqlRequest(mutation, { id, input: cleanedData });
    return result.updateQuestion;
  }

  async getQuestion(id: string): Promise<Question> {
    const query = `
      query GetQuestion($id: String!) {
        getQuestion(id: $id) {
          id
          humanId
          type
          question
          explanation
          references
          difficulty
          points
          timeLimit
          tags
          sourceTags
          examTags
          options {
            id
            text
            isCorrect
            order
            explanation
            references
            questionId
            createdAt
            updatedAt
          }
          assertion
          reasoning
          isActive
          hierarchyItemId
          createdBy
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlRequest(query, { id });
    return result.getQuestion;
  }

  async getQuestionByHumanId(humanId: string): Promise<Question> {
    const query = `
      query GetQuestionByHumanId($humanId: String!) {
        getQuestionByHumanId(humanId: $humanId) {
          id
          humanId
          type
          question
          explanation
          references
          difficulty
          points
          timeLimit
          tags
          sourceTags
          examTags
          options {
            id
            text
            isCorrect
            order
            explanation
            references
            questionId
            createdAt
            updatedAt
          }
          assertion
          reasoning
          isActive
          hierarchyItemId
          createdBy
          createdAt
          updatedAt
        }
      }
    `;

    const result = await this.graphqlRequest(query, { humanId });
    return result.getQuestionByHumanId;
  }

  async getQuestionsByHierarchy(
    hierarchyItemId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<PaginatedQuestions> {
    const query = `
      query GetQuestionsByHierarchy($hierarchyItemId: String!, $page: Int!, $limit: Int!) {
        getQuestionsByHierarchy(hierarchyItemId: $hierarchyItemId, page: $page, limit: $limit) {
          questions {
            id
            humanId
            type
            question
            explanation
            references
            difficulty
            points
            timeLimit
            tags
            sourceTags
            examTags
            options {
              id
              text
              isCorrect
              order
              explanation
              references
              questionId
              createdAt
              updatedAt
            }
            assertion
            reasoning
            isActive
            hierarchyItemId
            createdBy
            createdAt
            updatedAt
          }
          total
          page
          pages
        }
      }
    `;

    const result = await this.graphqlRequest(query, { hierarchyItemId, page, limit });
    return result.getQuestionsByHierarchy;
  }

  async getAllQuestions(page: number = 1, limit: number = 20): Promise<PaginatedQuestions> {
    const query = `
      query GetAllQuestions($page: Int!, $limit: Int!) {
        getAllQuestions(page: $page, limit: $limit) {
          questions {
            id
            humanId
            type
            question
            explanation
            references
            difficulty
            points
            timeLimit
            tags
            sourceTags
            examTags
            options {
              id
              text
              isCorrect
              order
              explanation
              references
              questionId
              createdAt
              updatedAt
            }
            assertion
            reasoning
            isActive
            hierarchyItemId
            createdBy
            createdAt
            updatedAt
          }
          total
          page
          pages
        }
      }
    `;

    const result = await this.graphqlRequest(query, { page, limit });
    return result.getAllQuestions;
  }

  async deleteQuestion(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteQuestion($id: String!) {
        deleteQuestion(id: $id)
      }
    `;

    const result = await this.graphqlRequest(mutation, { id });
    return result.deleteQuestion;
  }

  // Validation helpers
  validateQuestionData(data: CreateQuestionData | UpdateQuestionData): string[] {
    const errors: string[] = [];

    if ('question' in data && (!data.question || data.question.trim() === '')) {
      errors.push('Question text is required');
    }

    if ('options' in data && data.options) {
      if (data.options.length === 0 && data.type !== 'ASSERTION_REASONING') {
        errors.push('At least one option is required for this question type');
      }

      const correctOptions = data.options.filter(opt => opt.isCorrect);

      switch (data.type) {
        case 'SINGLE_CHOICE':
          if (correctOptions.length !== 1) {
            errors.push('Single choice questions must have exactly one correct answer');
          }
          if (data.options.length < 2) {
            errors.push('Single choice questions must have at least 2 options');
          }
          break;

        case 'MULTIPLE_CHOICE':
          if (correctOptions.length < 2) {
            errors.push('Multiple choice questions must have at least 2 correct answers');
          }
          if (data.options.length < 2) {
            errors.push('Multiple choice questions must have at least 2 options');
          }
          break;

        case 'TRUE_FALSE':
          if (data.options.length !== 2) {
            errors.push('True/False questions must have exactly 2 options');
          }
          if (correctOptions.length !== 1) {
            errors.push('True/False questions must have exactly one correct answer');
          }
          break;

        case 'ASSERTION_REASONING':
          if (!data.assertion || !data.reasoning) {
            errors.push('Assertion and Reasoning are required for assertion-reasoning questions');
          }
          if (data.options.length !== 4) {
            errors.push('Assertion-Reasoning questions must have exactly 4 options');
          }
          break;
      }
    }

    return errors;
  }

  // Helper to create default options for different question types
  createDefaultOptions(type: string): QuestionOption[] {
    switch (type) {
      case 'SINGLE_CHOICE':
      case 'MULTIPLE_CHOICE':
        return [
          { text: 'Option A', isCorrect: false, order: 0 },
          { text: 'Option B', isCorrect: false, order: 1 },
          { text: 'Option C', isCorrect: false, order: 2 },
          { text: 'Option D', isCorrect: false, order: 3 },
        ];

      case 'TRUE_FALSE':
        return [
          { text: 'True', isCorrect: false, order: 0 },
          { text: 'False', isCorrect: false, order: 1 },
        ];

      case 'ASSERTION_REASONING':
        return [
          { text: 'Both assertion and reasoning are correct, and reasoning is the correct explanation for assertion', isCorrect: false, order: 0 },
          { text: 'Both assertion and reasoning are correct, but reasoning is not the correct explanation for assertion', isCorrect: false, order: 1 },
          { text: 'Assertion is correct but reasoning is incorrect', isCorrect: false, order: 2 },
          { text: 'Both assertion and reasoning are incorrect', isCorrect: false, order: 3 },
        ];

      default:
        return [];
    }
  }
}

export const mcqService = new McqService();