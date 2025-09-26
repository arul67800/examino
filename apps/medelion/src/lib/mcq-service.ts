"use client";

export interface QuestionOption {
  id?: string;
  text: string;
  isCorrect: boolean;
  order?: number;
}

export interface CreateQuestionData {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  hierarchyItemId: string;
  options?: QuestionOption[];
  assertion?: string;
  reasoning?: string;
  createdBy?: string;
}

export interface UpdateQuestionData {
  type?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question?: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
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
  difficulty: string;
  points: number;
  timeLimit?: number;
  tags: string[];
  options: QuestionOption[];
  assertion?: string;
  reasoning?: string;
  isActive: boolean;
  hierarchyItemId: string;
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

class McqService {
  private async graphqlRequest(query: string, variables?: any): Promise<any> {
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
      throw new Error(result.errors[0]?.message || 'GraphQL error occurred');
    }

    return result.data;
  }

  async createQuestion(data: CreateQuestionData): Promise<Question> {
    const mutation = `
      mutation CreateQuestion($input: CreateQuestionInputGQL!) {
        createQuestion(input: $input) {
          id
          humanId
          type
          question
          explanation
          difficulty
          points
          timeLimit
          tags
          options {
            id
            text
            isCorrect
            order
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

    const result = await this.graphqlRequest(mutation, { input: data });
    return result.createQuestion;
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
          difficulty
          points
          timeLimit
          tags
          options {
            id
            text
            isCorrect
            order
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

    const result = await this.graphqlRequest(mutation, { id, input: data });
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
          difficulty
          points
          timeLimit
          tags
          options {
            id
            text
            isCorrect
            order
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
          difficulty
          points
          timeLimit
          tags
          options {
            id
            text
            isCorrect
            order
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
            difficulty
            points
            timeLimit
            tags
            options {
              id
              text
              isCorrect
              order
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