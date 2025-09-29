/**
 * Question Bank Service
 * Handles all API interactions for the question bank system
 */

import { 
  Question, 
  QuestionFilters, 
  SearchQuery, 
  PaginatedResponse, 
  QuestionBankStats,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  BulkOperation,
  ExportConfig,
  ImportConfig,
  ImportResult,
  QualityMetrics
} from '../types';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:8001/graphql';

export class QuestionBankService {
  private async graphqlRequest(query: string, variables?: any): Promise<any> {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data;
    } catch (error) {
      console.error('[Question Bank Service] GraphQL request failed:', error);
      throw error;
    }
  }

  /**
   * Get all questions with pagination and filtering
   */
  async getQuestions(searchQuery: SearchQuery): Promise<PaginatedResponse<Question>> {
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
            hierarchyItemId
            hierarchyPath {
              year
              subject
              part
              section
              chapter
            }
            options {
              id
              text
              isCorrect
              order
              explanation
              references
            }
            assertion
            reasoning
            createdBy
            createdAt
            updatedAt
            isActive
          }
          page
          pages
          total
        }
      }
    `;

    const variables = {
      page: searchQuery.page,
      limit: searchQuery.limit,
    };

    const result = await this.graphqlRequest(query, variables);
    
    return {
      data: result.getAllQuestions.questions,
      pagination: {
        page: result.getAllQuestions.page,
        pages: result.getAllQuestions.pages,
        total: result.getAllQuestions.total,
        limit: searchQuery.limit,
        hasNext: result.getAllQuestions.page < result.getAllQuestions.pages,
        hasPrev: result.getAllQuestions.page > 1,
      },
    };
  }

  /**
   * Get questions by hierarchy item ID
   */
  async getQuestionsByHierarchy(hierarchyItemId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Question>> {
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
            hierarchyItemId
            hierarchyPath {
              year
              subject
              part
              section
              chapter
            }
            options {
              id
              text
              isCorrect
              order
              explanation
              references
            }
            assertion
            reasoning
            createdBy
            createdAt
            updatedAt
            isActive
          }
          page
          pages
          total
        }
      }
    `;

    const result = await this.graphqlRequest(query, {
      hierarchyItemId,
      page,
      limit,
    });

    return {
      data: result.getQuestionsByHierarchy.questions,
      pagination: {
        page: result.getQuestionsByHierarchy.page,
        pages: result.getQuestionsByHierarchy.pages,
        total: result.getQuestionsByHierarchy.total,
        limit,
        hasNext: result.getQuestionsByHierarchy.page < result.getQuestionsByHierarchy.pages,
        hasPrev: result.getQuestionsByHierarchy.page > 1,
      },
    };
  }

  /**
   * Get a single question by ID
   */
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
          hierarchyItemId
          hierarchyPath {
            year
            subject
            part
            section
            chapter
          }
          options {
            id
            text
            isCorrect
            order
            explanation
            references
          }
          assertion
          reasoning
          createdBy
          createdAt
          updatedAt
          isActive
        }
      }
    `;

    const result = await this.graphqlRequest(query, { id });
    return result.getQuestion;
  }

  /**
   * Create a new question
   */
  async createQuestion(question: CreateQuestionRequest): Promise<Question> {
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
          hierarchyItemId
          hierarchyPath {
            year
            subject
            part
            section
            chapter
          }
          options {
            id
            text
            isCorrect
            order
            explanation
            references
          }
          assertion
          reasoning
          createdBy
          createdAt
          updatedAt
          isActive
        }
      }
    `;

    const input = {
      type: question.type,
      question: question.question,
      explanation: question.explanation,
      references: question.references,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      tags: question.tags,
      sourceTags: question.sourceTags || [],
      examTags: question.examTags || [],
      hierarchyItemId: question.hierarchyItemId,
      options: question.options.map((option, index) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order ?? index,
        explanation: option.explanation,
        references: option.references,
      })),
      assertion: question.assertion,
      reasoning: question.reasoning,
    };

    const result = await this.graphqlRequest(mutation, { input });
    return result.createQuestion;
  }

  /**
   * Update an existing question
   */
  async updateQuestion(question: UpdateQuestionRequest): Promise<Question> {
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
          hierarchyItemId
          hierarchyPath {
            year
            subject
            part
            section
            chapter
          }
          options {
            id
            text
            isCorrect
            order
            explanation
            references
          }
          assertion
          reasoning
          createdBy
          createdAt
          updatedAt
          isActive
        }
      }
    `;

    const input: any = {
      type: question.type,
      question: question.question,
      explanation: question.explanation,
      references: question.references,
      difficulty: question.difficulty,
      points: question.points,
      timeLimit: question.timeLimit,
      tags: question.tags,
      sourceTags: question.sourceTags,
      examTags: question.examTags,
      options: question.options?.map((option, index) => ({
        text: option.text,
        isCorrect: option.isCorrect,
        order: option.order ?? index,
        explanation: option.explanation,
        references: option.references,
      })),
      assertion: question.assertion,
      reasoning: question.reasoning,
    };

    const result = await this.graphqlRequest(mutation, { 
      id: question.id, 
      input 
    });
    return result.updateQuestion;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(id: string): Promise<boolean> {
    const mutation = `
      mutation DeleteQuestion($id: String!) {
        deleteQuestion(id: $id)
      }
    `;

    const result = await this.graphqlRequest(mutation, { id });
    return result.deleteQuestion;
  }

  /**
   * Get question bank statistics
   */
  async getStats(): Promise<QuestionBankStats> {
    // This would be implemented when the backend supports statistics
    // For now, return mock data
    const allQuestionsResult = await this.getQuestions({
      query: '',
      filters: {},
      sortBy: 'createdAt' as any,
      sortOrder: 'desc',
      page: 1,
      limit: 1000, // Get a large number to calculate stats
    });

    const questions = allQuestionsResult.data;
    
    return {
      totalQuestions: allQuestionsResult.pagination.total,
      activeQuestions: questions.filter(q => q.isActive).length,
      inactiveQuestions: questions.filter(q => !q.isActive).length,
      byDifficulty: {
        EASY: questions.filter(q => q.difficulty === 'EASY').length,
        MEDIUM: questions.filter(q => q.difficulty === 'MEDIUM').length,
        HARD: questions.filter(q => q.difficulty === 'HARD').length,
      },
      byType: {
        SINGLE_CHOICE: questions.filter(q => q.type === 'SINGLE_CHOICE').length,
        MULTIPLE_CHOICE: questions.filter(q => q.type === 'MULTIPLE_CHOICE').length,
        TRUE_FALSE: questions.filter(q => q.type === 'TRUE_FALSE').length,
        ASSERTION_REASONING: questions.filter(q => q.type === 'ASSERTION_REASONING').length,
      },
      byHierarchy: [],
      recentActivity: [],
      popularTags: this.calculatePopularTags(questions),
      averagePoints: questions.reduce((sum, q) => sum + q.points, 0) / questions.length,
      averageTimeLimit: questions
        .filter(q => q.timeLimit)
        .reduce((sum, q) => sum + (q.timeLimit || 0), 0) / questions.filter(q => q.timeLimit).length,
    };
  }

  /**
   * Perform bulk operations on questions
   */
  async bulkOperation(operation: BulkOperation): Promise<any> {
    switch (operation.type) {
      case 'delete':
        return this.bulkDelete(operation.questionIds);
      case 'updateTags':
        return this.bulkUpdateTags(operation.questionIds, operation.payload.tags);
      case 'updateDifficulty':
        return this.bulkUpdateDifficulty(operation.questionIds, operation.payload.difficulty);
      default:
        throw new Error(`Unsupported bulk operation: ${operation.type}`);
    }
  }

  /**
   * Export questions based on configuration
   */
  async exportQuestions(config: ExportConfig): Promise<Blob> {
    const questions = await this.getQuestions({
      query: '',
      filters: config.filters || {},
      sortBy: 'createdAt' as any,
      sortOrder: 'desc',
      page: 1,
      limit: 10000, // Get all matching questions
    });

    return this.generateExport(questions.data, config);
  }

  /**
   * Import questions from file
   */
  async importQuestions(file: File, config: ImportConfig): Promise<ImportResult> {
    const content = await this.readFileContent(file, config.format);
    const questions = await this.parseImportData(content, config);
    
    let imported = 0;
    let skipped = 0;
    const errors: any[] = [];
    
    for (const question of questions) {
      try {
        await this.createQuestion(question);
        imported++;
      } catch (error) {
        errors.push({
          row: questions.indexOf(question) + 1,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: question,
        });
        skipped++;
      }
    }

    return {
      success: errors.length === 0,
      imported,
      skipped,
      errors,
      warnings: [],
    };
  }

  /**
   * Analyze question quality
   */
  async analyzeQuality(questionId: string): Promise<QualityMetrics> {
    const question = await this.getQuestion(questionId);
    return this.performQualityAnalysis(question);
  }

  // Private helper methods
  private async bulkDelete(questionIds: string[]): Promise<boolean[]> {
    const promises = questionIds.map(id => this.deleteQuestion(id));
    return Promise.all(promises);
  }

  private async bulkUpdateTags(questionIds: string[], tags: string[]): Promise<Question[]> {
    const promises = questionIds.map(id => 
      this.updateQuestion({ id, tags })
    );
    return Promise.all(promises);
  }

  private async bulkUpdateDifficulty(questionIds: string[], difficulty: string): Promise<Question[]> {
    const promises = questionIds.map(id => 
      this.updateQuestion({ id, difficulty: difficulty as any })
    );
    return Promise.all(promises);
  }

  private calculatePopularTags(questions: Question[]): any[] {
    const tagCounts: Record<string, number> = {};
    
    questions.forEach(question => {
      question.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      question.sourceTags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      question.examTags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count, category: 'tags' as const }));
  }

  private async generateExport(questions: Question[], config: ExportConfig): Promise<Blob> {
    switch (config.format) {
      case 'json':
        return new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
      case 'csv':
        return this.generateCSVExport(questions, config);
      default:
        throw new Error(`Unsupported export format: ${config.format}`);
    }
  }

  private generateCSVExport(questions: Question[], config: ExportConfig): Blob {
    const headers = ['ID', 'Human ID', 'Type', 'Question', 'Difficulty', 'Points'];
    if (config.includeExplanations) headers.push('Explanation');
    if (config.includeReferences) headers.push('References');
    
    const rows = [headers];
    
    questions.forEach(question => {
      const row = [
        question.id,
        question.humanId,
        question.type,
        question.question,
        question.difficulty,
        question.points.toString(),
      ];
      
      if (config.includeExplanations) {
        row.push(question.explanation || '');
      }
      if (config.includeReferences) {
        row.push(question.references || '');
      }
      
      rows.push(row);
    });

    const csvContent = rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return new Blob([csvContent], { type: 'text/csv' });
  }

  private async readFileContent(file: File, format: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private async parseImportData(content: string, config: ImportConfig): Promise<CreateQuestionRequest[]> {
    switch (config.format) {
      case 'json':
        return JSON.parse(content);
      case 'csv':
        return this.parseCSVContent(content, config);
      default:
        throw new Error(`Unsupported import format: ${config.format}`);
    }
  }

  private parseCSVContent(content: string, config: ImportConfig): CreateQuestionRequest[] {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const questions: CreateQuestionRequest[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length < headers.length) continue;

      const question: any = {};
      headers.forEach((header, index) => {
        const mappedField = config.mapping[header] || header.toLowerCase();
        question[mappedField] = values[index];
      });

      // Apply defaults and transformations
      question.difficulty = question.difficulty || config.options.defaultDifficulty;
      question.points = parseInt(question.points) || config.options.defaultPoints;
      question.hierarchyItemId = question.hierarchyItemId || config.options.hierarchyItemId;
      question.tags = question.tags ? question.tags.split(';') : [];
      question.options = this.parseOptions(question.options || '');

      questions.push(question);
    }

    return questions;
  }

  private parseOptions(optionsStr: string): any[] {
    if (!optionsStr) return [];
    
    try {
      return JSON.parse(optionsStr);
    } catch {
      // Simple format: "Option 1 (correct); Option 2; Option 3"
      return optionsStr.split(';').map((opt, index) => {
        const isCorrect = opt.includes('(correct)');
        const text = opt.replace('(correct)', '').trim();
        return {
          text,
          isCorrect,
          order: index,
        };
      });
    }
  }

  private performQualityAnalysis(question: Question): QualityMetrics {
    const issues: any[] = [];
    let score = 100;

    // Check for missing explanation
    if (!question.explanation) {
      issues.push({
        type: 'missing_explanation',
        severity: 'medium',
        message: 'Question lacks explanation',
        suggestion: 'Add detailed explanation to help learners understand the correct answer',
      });
      score -= 15;
    }

    // Check for missing references
    if (!question.references) {
      issues.push({
        type: 'missing_references',
        severity: 'low',
        message: 'No references provided',
        suggestion: 'Add references to authoritative sources',
      });
      score -= 5;
    }

    // Check question length
    if (question.question.length < 20) {
      issues.push({
        type: 'short_question',
        severity: 'medium',
        message: 'Question text is very short',
        suggestion: 'Consider adding more context or detail',
      });
      score -= 10;
    }

    // Check for correct answers
    const correctAnswers = question.options.filter(opt => opt.isCorrect);
    if (correctAnswers.length === 0) {
      issues.push({
        type: 'no_correct_answer',
        severity: 'critical',
        message: 'No correct answer marked',
        suggestion: 'Mark at least one option as correct',
      });
      score -= 30;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions: [],
      completeness: this.calculateCompleteness(question),
      accuracy: this.calculateAccuracy(question),
      consistency: this.calculateConsistency(question),
    };
  }

  private calculateCompleteness(question: Question): number {
    let score = 0;
    const maxScore = 100;

    if (question.question) score += 25;
    if (question.explanation) score += 25;
    if (question.references) score += 20;
    if (question.tags?.length > 0) score += 15;
    if (question.options.length >= 2) score += 15;

    return Math.min(score, maxScore);
  }

  private calculateAccuracy(question: Question): number {
    // This would involve more sophisticated analysis
    // For now, return a basic score based on structure
    let score = 80;

    const correctAnswers = question.options.filter(opt => opt.isCorrect);
    if (question.type === 'SINGLE_CHOICE' && correctAnswers.length !== 1) {
      score -= 20;
    }
    if (question.type === 'MULTIPLE_CHOICE' && correctAnswers.length === 0) {
      score -= 30;
    }

    return Math.max(0, score);
  }

  private calculateConsistency(question: Question): number {
    // Basic consistency checks
    let score = 90;

    // Check if difficulty matches question complexity
    const complexity = this.estimateComplexity(question);
    if (
      (question.difficulty === 'EASY' && complexity > 7) ||
      (question.difficulty === 'HARD' && complexity < 4)
    ) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  private estimateComplexity(question: Question): number {
    // Simple complexity estimation based on various factors
    let complexity = 5; // Base complexity

    if (question.question.length > 200) complexity += 1;
    if (question.options.length > 4) complexity += 1;
    if (question.type === 'ASSERTION_REASONING') complexity += 2;
    if (question.assertion) complexity += 1;

    return Math.min(complexity, 10);
  }
}

// Singleton instance
export const questionBankService = new QuestionBankService();