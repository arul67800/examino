import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { QuestionIdGenerator } from './question-id-generator.service';
import { TagsService } from './tags.service';
import { HierarchyService } from '../../hierarchy/services/hierarchy.service';

export interface CreateQuestionInput {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question: string;
  explanation?: string;
  references?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[]; // Legacy field
  sourceTags?: string[];
  examTags?: string[];
  hierarchyItemId: string;
  // New fields for structured ID generation
  originalHierarchyItemId?: string;
  hierarchyType?: 'question-bank' | 'previous-papers';
  options?: {
    text: string;
    isCorrect: boolean;
    order?: number;
    explanation?: string;
    references?: string;
  }[];
  assertion?: string;
  reasoning?: string;
  createdBy?: string;
}

export interface UpdateQuestionInput {
  type?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question?: string;
  explanation?: string;
  references?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[]; // Legacy field
  sourceTags?: string[];
  examTags?: string[];
  options?: {
    id?: string;
    text: string;
    isCorrect: boolean;
    order?: number;
    explanation?: string;
    references?: string;
  }[];
  assertion?: string;
  reasoning?: string;
}

@Injectable()
export class McqService {
  constructor(
    private prisma: PrismaService,
    private questionIdGenerator: QuestionIdGenerator,
    private tagsService: TagsService,
    private hierarchyService: HierarchyService
  ) {}

  async create(input: CreateQuestionInput) {
    // Check if we have original hierarchy metadata for structured ID generation
    let hierarchyValidation;
    if (input.originalHierarchyItemId && input.hierarchyType) {
      console.log('[BACKEND MCQ DEBUG] Using original hierarchy metadata:', {
        originalId: input.originalHierarchyItemId,
        hierarchyType: input.hierarchyType,
        mappedLegacyId: input.hierarchyItemId
      });
      
      // Use original hierarchy data for structured ID generation
      hierarchyValidation = await this.validateAndGetHierarchy(input.originalHierarchyItemId);
    } else {
      // Fallback to legacy validation
      hierarchyValidation = await this.validateAndGetHierarchy(input.hierarchyItemId);
    }

    // Validate question type and options
    this.validateQuestionData(input);

    // Generate structured human-readable ID
    const humanId = await this.generateStructuredHumanId(hierarchyValidation);

    // Process tags for database persistence
    const tagResults = await this.tagsService.processQuestionTags(
      input.sourceTags || [],
      input.examTags || [],
      input.createdBy
    );

    // Prepare question data based on hierarchy type
    const questionData: any = {
      humanId,
      type: input.type,
      question: input.question,
      explanation: input.explanation,
      references: input.references,
      difficulty: input.difficulty || 'MEDIUM',
      points: input.points || 1,
      timeLimit: input.timeLimit,
      tags: input.tags ? JSON.stringify(input.tags) : null, // Legacy field
      sourceTags: input.sourceTags ? JSON.stringify(input.sourceTags) : null,
      examTags: input.examTags ? JSON.stringify(input.examTags) : null,
      assertion: input.assertion,
      reasoning: input.reasoning,
      createdBy: input.createdBy,
      options: {
        create: input.options?.map((option, index) => ({
          text: option.text,
          isCorrect: option.isCorrect,
          order: option.order || index,
          explanation: option.explanation,
          references: option.references
        })) || []
      }
    };

    // Set hierarchy relationship - always use legacy for database compatibility
    // The structured ID generation uses the original hierarchy data, but the DB relationship uses legacy
    questionData.hierarchyItemId = input.hierarchyItemId; // This is the mapped legacy ID

    console.log('[BACKEND MCQ DEBUG] Question data prepared:', {
      humanId,
      hierarchyValidationType: hierarchyValidation.hierarchyType,
      originalHierarchyId: input.originalHierarchyItemId,
      legacyHierarchyId: input.hierarchyItemId,
      databaseRelationship: 'hierarchyItemId (legacy)'
    });

    // Create the question
    const question = await this.prisma.question.create({
      data: questionData,
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        hierarchyItem: true
        // Note: Include statements for new hierarchy tables would be added here
        // once the Prisma client is fully updated
      }
    });

    console.log('[BACKEND MCQ DEBUG] Question created successfully:', {
      questionId: question.id,
      humanId: question.humanId,
      hierarchyItemId: question.hierarchyItemId,
      legacyHierarchyFound: !!question.hierarchyItem,
      legacyHierarchyName: question.hierarchyItem?.name,
      isActive: question.isActive,
      type: question.type
    });

    // Update question count in the appropriate hierarchy
    await this.updateQuestionCountForHierarchy(hierarchyValidation);

    return await this.formatQuestion(question);
  }

  async update(id: string, input: UpdateQuestionInput) {
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
      include: { options: true }
    });

    if (!existingQuestion) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Validate if provided
    if (input.type || input.options) {
      this.validateQuestionData(input as CreateQuestionInput);
    }

    // Process tags for database persistence if provided
    if (input.sourceTags !== undefined || input.examTags !== undefined) {
      await this.tagsService.processQuestionTags(
        input.sourceTags || [],
        input.examTags || [],
        existingQuestion.createdBy || undefined
      );
    }

    // Handle options update
    if (input.options) {
      // Delete existing options
      await this.prisma.questionOption.deleteMany({
        where: { questionId: id }
      });

      // Create new options
      await this.prisma.questionOption.createMany({
        data: input.options.map((option, index) => ({
          questionId: id,
          text: option.text,
          isCorrect: option.isCorrect,
          order: option.order || index,
          explanation: option.explanation,
          references: option.references
        }))
      });
    }

    // Update question
    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: {
        ...(input.type && { type: input.type }),
        ...(input.question && { question: input.question }),
        ...(input.explanation !== undefined && { explanation: input.explanation }),
        ...(input.references !== undefined && { references: input.references }),
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.points !== undefined && { points: input.points }),
        ...(input.timeLimit !== undefined && { timeLimit: input.timeLimit }),
        ...(input.tags !== undefined && { tags: input.tags ? JSON.stringify(input.tags) : null }),
        ...(input.sourceTags !== undefined && { sourceTags: input.sourceTags ? JSON.stringify(input.sourceTags) : null }),
        ...(input.examTags !== undefined && { examTags: input.examTags ? JSON.stringify(input.examTags) : null }),
        ...(input.assertion !== undefined && { assertion: input.assertion }),
        ...(input.reasoning !== undefined && { reasoning: input.reasoning }),
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        hierarchyItem: true
      }
    });

    return await this.formatQuestion(updatedQuestion);
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        hierarchyItem: true
      }
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return await this.formatQuestion(question);
  }

  async findByHumanId(humanId: string) {
    const question = await this.prisma.question.findUnique({
      where: { humanId },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        hierarchyItem: true
      }
    });

    if (!question) {
      throw new NotFoundException(`Question with human ID ${humanId} not found`);
    }

    return await this.formatQuestion(question);
  }

  async search(searchTerm?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { 
          isActive: true
        },
        include: {
          options: {
            orderBy: { order: 'asc' }
          },
          hierarchyItem: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.question.count({
        where: { 
          isActive: true
        }
      })
    ]);

    return {
      questions: await Promise.all(questions.map(q => this.formatQuestion(q))),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    console.log('[BACKEND MCQ DEBUG] findAll called:', { page, limit, skip });

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { 
          isActive: true
        },
        include: {
          options: {
            orderBy: { order: 'asc' }
          },
          hierarchyItem: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.question.count({
        where: { 
          isActive: true
        }
      })
    ]);

    console.log('[BACKEND MCQ DEBUG] findAll results:', { 
      questionsCount: questions.length, 
      total,
      firstQuestionId: questions[0]?.id,
      firstQuestionHumanId: questions[0]?.humanId,
      firstQuestionHierarchyId: questions[0]?.hierarchyItemId,
      hasLegacyHierarchy: !!questions[0]?.hierarchyItem,
      legacyHierarchyName: questions[0]?.hierarchyItem?.name
    });

    return {
      questions: await Promise.all(questions.map(q => this.formatQuestion(q))),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async findByHierarchy(hierarchyItemId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [questions, total] = await Promise.all([
      this.prisma.question.findMany({
        where: { 
          hierarchyItemId,
          isActive: true
        },
        include: {
          options: {
            orderBy: { order: 'asc' }
          },
          hierarchyItem: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.question.count({
        where: { 
          hierarchyItemId,
          isActive: true
        }
      })
    ]);

    return {
      questions: await Promise.all(questions.map(q => this.formatQuestion(q))),
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async delete(id: string): Promise<boolean> {
    const question = await this.prisma.question.findUnique({
      where: { id }
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    // Soft delete by setting isActive to false
    await this.prisma.question.update({
      where: { id },
      data: { isActive: false }
    });

    // Update question count
    if (question.hierarchyItemId) {
      await this.updateQuestionCount(question.hierarchyItemId);
    }

    return true;
  }

  private validateQuestionData(input: CreateQuestionInput | UpdateQuestionInput) {
    if (!input.options || input.options.length === 0) {
      if (input.type !== 'ASSERTION_REASONING') {
        throw new BadRequestException('Options are required for this question type');
      }
      return;
    }

    const correctOptions = input.options.filter(opt => opt.isCorrect);

    switch (input.type) {
      case 'SINGLE_CHOICE':
        if (correctOptions.length !== 1) {
          throw new BadRequestException('Single choice questions must have exactly one correct answer');
        }
        if (input.options.length < 2) {
          throw new BadRequestException('Single choice questions must have at least 2 options');
        }
        break;

      case 'MULTIPLE_CHOICE':
        if (correctOptions.length < 2) {
          throw new BadRequestException('Multiple choice questions must have at least 2 correct answers');
        }
        if (input.options.length < 2) {
          throw new BadRequestException('Multiple choice questions must have at least 2 options');
        }
        break;

      case 'TRUE_FALSE':
        if (input.options.length !== 2) {
          throw new BadRequestException('True/False questions must have exactly 2 options');
        }
        if (correctOptions.length !== 1) {
          throw new BadRequestException('True/False questions must have exactly one correct answer');
        }
        break;

      case 'ASSERTION_REASONING':
        if (!input.assertion || !input.reasoning) {
          throw new BadRequestException('Assertion and Reasoning are required for assertion-reasoning questions');
        }
        // Assertion-reasoning typically has 4 standard options
        if (input.options.length !== 4) {
          throw new BadRequestException('Assertion-Reasoning questions must have exactly 4 options');
        }
        break;
    }
  }

  private async updateQuestionCount(hierarchyItemId: string) {
    const count = await this.prisma.question.count({
      where: { 
        hierarchyItemId,
        isActive: true
      }
    });

    await this.prisma.hierarchyItem.update({
      where: { id: hierarchyItemId },
      data: { questionCount: count }
    });
  }

  private async updateQuestionCountForHierarchy(hierarchyValidation: {
    item: any;
    hierarchyType: 'question-bank' | 'previous-papers' | 'legacy';
    actualHierarchyId: string;
  }) {
    try {
      if (hierarchyValidation.hierarchyType === 'question-bank') {
        // Count questions for question bank hierarchy using raw SQL
        const countResult = await this.prisma.$queryRaw<Array<{count: number}>>`
          SELECT COUNT(*) as count 
          FROM questions 
          WHERE questionBankHierarchyId = ${hierarchyValidation.actualHierarchyId} 
          AND isActive = 1
        `;
        const count = countResult[0]?.count || 0;

        // Update count in question bank hierarchy table using raw SQL
        await this.prisma.$executeRaw`
          UPDATE question_bank_hierarchy 
          SET questionCount = ${count} 
          WHERE id = ${hierarchyValidation.actualHierarchyId}
        `;
        
      } else if (hierarchyValidation.hierarchyType === 'previous-papers') {
        // Count questions for previous papers hierarchy using raw SQL
        const countResult = await this.prisma.$queryRaw<Array<{count: number}>>`
          SELECT COUNT(*) as count 
          FROM questions 
          WHERE previousPapersHierarchyId = ${hierarchyValidation.actualHierarchyId} 
          AND isActive = 1
        `;
        const count = countResult[0]?.count || 0;

        // Update count in previous papers hierarchy table using raw SQL
        await this.prisma.$executeRaw`
          UPDATE previous_papers_hierarchy 
          SET questionCount = ${count} 
          WHERE id = ${hierarchyValidation.actualHierarchyId}
        `;
        
      } else {
        // Legacy hierarchy - use existing method
        await this.updateQuestionCount(hierarchyValidation.actualHierarchyId);
      }
      
      console.log('Updated question count for hierarchy:', {
        hierarchyType: hierarchyValidation.hierarchyType,
        hierarchyId: hierarchyValidation.actualHierarchyId
      });
      
    } catch (error) {
      console.error('Error updating question count:', error);
      // Don't throw error to prevent question creation failure
    }
  }

  private async formatQuestion(question: any) {
    // Build hierarchy path
    const hierarchyPath = await this.buildHierarchyPath(question.hierarchyItemId);
    
    return {
      ...question,
      tags: question.tags ? JSON.parse(question.tags) : [],
      sourceTags: question.sourceTags ? JSON.parse(question.sourceTags) : [],
      examTags: question.examTags ? JSON.parse(question.examTags) : [],
      options: question.options || [],
      hierarchyPath
    };
  }

  private async buildHierarchyPath(hierarchyItemId: string): Promise<any> {
    try {
      // Get the hierarchy item and build the complete path
      const hierarchyItem = await this.prisma.hierarchyItem.findUnique({
        where: { id: hierarchyItemId }
      });

      if (!hierarchyItem) {
        return null;
      }

      // Build the hierarchy chain by traversing up the parent tree
      type HierarchyItem = {
        id: string;
        name: string;
        level: number;
        parentId: string | null;
      };
      
      const hierarchyChain: HierarchyItem[] = [];
      let currentItem: HierarchyItem | null = {
        id: hierarchyItem.id,
        name: hierarchyItem.name,
        level: hierarchyItem.level,
        parentId: hierarchyItem.parentId
      };

      // Get the complete hierarchy chain
      while (currentItem) {
        hierarchyChain.unshift(currentItem);
        
        if (currentItem.parentId) {
          const parentItem = await this.prisma.hierarchyItem.findUnique({
            where: { id: currentItem.parentId }
          });
          
          if (parentItem) {
            currentItem = {
              id: parentItem.id,
              name: parentItem.name,
              level: parentItem.level,
              parentId: parentItem.parentId
            };
          } else {
            currentItem = null;
          }
        } else {
          currentItem = null;
        }
      }

      // Build the structured hierarchy path
      const hierarchyPath: any = {
        year: null,
        subject: null,
        part: null,
        section: null,
        chapter: null
      };
      
      hierarchyChain.forEach(item => {
        switch (item.level) {
          case 1:
            hierarchyPath.year = item.name;
            break;
          case 2:
            hierarchyPath.subject = item.name;
            break;
          case 3:
            hierarchyPath.part = item.name;
            break;
          case 4:
            hierarchyPath.section = item.name;
            break;
          case 5:
            hierarchyPath.chapter = item.name;
            break;
        }
      });

      return hierarchyPath;
    } catch (error) {
      console.error('Error building hierarchy path:', error);
      return null;
    }
  }

  // Helper method to validate hierarchy item and determine its type
  private async validateAndGetHierarchy(hierarchyItemId: string): Promise<{
    item: any;
    hierarchyType: 'question-bank' | 'previous-papers' | 'legacy';
    actualHierarchyId: string;
  }> {
    // First try to find in Question Bank hierarchy (using raw query since Prisma client may not be updated)
    try {
      const qbResult = await this.prisma.$queryRaw`
        SELECT * FROM question_bank_hierarchy WHERE id = ${hierarchyItemId}
      `;
      
      if (Array.isArray(qbResult) && qbResult.length > 0) {
        return {
          item: qbResult[0],
          hierarchyType: 'question-bank',
          actualHierarchyId: hierarchyItemId
        };
      }
    } catch (error) {
      // Continue to next check
    }

    // Try to find in Previous Papers hierarchy (using raw query)
    try {
      const ppResult = await this.prisma.$queryRaw`
        SELECT * FROM previous_papers_hierarchy WHERE id = ${hierarchyItemId}
      `;
      
      if (Array.isArray(ppResult) && ppResult.length > 0) {
        return {
          item: ppResult[0],
          hierarchyType: 'previous-papers',
          actualHierarchyId: hierarchyItemId
        };
      }
    } catch (error) {
      // Continue to next check
    }

    // Finally check legacy hierarchy
    const hierarchyItem = await this.prisma.hierarchyItem.findUnique({
      where: { id: hierarchyItemId }
    });

    if (!hierarchyItem) {
      throw new NotFoundException(`Hierarchy item with ID ${hierarchyItemId} not found`);
    }

    return {
      item: hierarchyItem,
      hierarchyType: 'legacy',
      actualHierarchyId: hierarchyItemId
    };
  }

  // Helper method to generate structured human ID: {QB|PP}-{5-digit-level-code}-{7-digit-mcq-number}
  private async generateStructuredHumanId(hierarchyValidation: {
    item: any;
    hierarchyType: 'question-bank' | 'previous-papers' | 'legacy';
    actualHierarchyId: string;
  }): Promise<string> {
    try {
      // Generate prefix based on hierarchy type
      let prefix: string;
      if (hierarchyValidation.hierarchyType === 'question-bank') {
        prefix = 'QB';
      } else if (hierarchyValidation.hierarchyType === 'previous-papers') {
        prefix = 'PP';
      } else {
        // For legacy, determine type from item name or default to QB
        const itemName = hierarchyValidation.item.name?.toLowerCase() || '';
        prefix = itemName.includes('previous') || itemName.includes('neet') || itemName.includes('aiims') ? 'PP' : 'QB';
      }

      // Generate 5-digit level code
      const levelCode = await this.generateLevelCode(hierarchyValidation);

      // Get next MCQ sequence number (7 digits)
      const mcqNumber = await this.getNextMCQSequenceNumber();

      const structuredId = `${prefix}-${levelCode}-${mcqNumber}`;

      console.log('Generated structured MCQ ID:', {
        hierarchyType: hierarchyValidation.hierarchyType,
        hierarchyItem: {
          id: hierarchyValidation.item.id,
          name: hierarchyValidation.item.name,
          level: hierarchyValidation.item.level,
          type: hierarchyValidation.item.type
        },
        prefix,
        levelCode,
        mcqNumber,
        finalId: structuredId
      });

      return structuredId;

    } catch (error) {
      console.error('Error generating structured ID:', error);
      
      // Fallback to timestamp-based ID
      const timestamp = Date.now();
      const fallbackNumber = (timestamp % 10000).toString().padStart(4, '0');
      return `QB-00000-${fallbackNumber}`;
    }
  }

  // Helper method to generate 5-digit level code from hierarchy item
  private async generateLevelCode(hierarchyValidation: {
    item: any;
    hierarchyType: 'question-bank' | 'previous-papers' | 'legacy';
    actualHierarchyId: string;
  }): Promise<string> {
    try {
      // Initialize level digits array with 5 positions (all 0 initially)
      const levelDigits = [0, 0, 0, 0, 0];
      
      // Build complete hierarchy path by traversing up from current item
      const hierarchyPath: { level: number; order: number; name: string }[] = [];
      let currentItem = hierarchyValidation.item;
      
      // Add current item to path
      hierarchyPath.push({
        level: currentItem.level || 1,
        order: currentItem.order || 1,
        name: currentItem.name || 'Unknown'
      });
      
      // Traverse up the hierarchy to build complete path
      while (currentItem && currentItem.parentId) {
        let parentQuery: string;
        
        if (hierarchyValidation.hierarchyType === 'question-bank') {
          parentQuery = `SELECT * FROM question_bank_hierarchy WHERE id = '${currentItem.parentId}'`;
        } else if (hierarchyValidation.hierarchyType === 'previous-papers') {
          parentQuery = `SELECT * FROM previous_papers_hierarchy WHERE id = '${currentItem.parentId}'`;
        } else {
          parentQuery = `SELECT * FROM hierarchy_items WHERE id = '${currentItem.parentId}'`;
        }
        
        const parentResult = await this.prisma.$queryRawUnsafe(parentQuery) as any[];
        if (parentResult.length > 0) {
          const parent = parentResult[0];
          hierarchyPath.unshift({
            level: parent.level || 1,
            order: parent.order || 1,
            name: parent.name || 'Unknown'
          });
          currentItem = parent;
        } else {
          break;
        }
      }
      
            // Now populate level digits based on complete hierarchy path
      hierarchyPath.forEach((pathItem, index) => {
        const level = pathItem.level;
        const order = pathItem.order;
        
        console.log(`[BACKEND MCQ DEBUG] Processing hierarchy item ${index}:`, {
          name: pathItem.name,
          level,
          order
        });
        
        if (level >= 1 && level <= 5) {
          // Handle order = 0 case by using level as fallback, or use order if > 0
          let digit;
          if (order === 0) {
            // If order is 0, use the level itself as the digit
            digit = level % 10;
          } else {
            // Use first digit of order if order > 9, otherwise use order itself
            digit = order > 9 ? Math.floor(order / 10) % 10 : order % 10;
          }
          levelDigits[level - 1] = digit;
          
          console.log(`[BACKEND MCQ DEBUG] Set level ${level} digit to ${digit} (from order ${order}, used fallback: ${order === 0})`);
        }
      });
      
      // Convert to string
      const levelCode = levelDigits.join('');
      
      console.log('Generated level code with full hierarchy:', {
        hierarchyPath,
        levelDigits,
        levelCode,
        hierarchyType: hierarchyValidation.hierarchyType
      });
      
      return levelCode;
      
    } catch (error) {
      console.error('Error generating level code:', error);
      return '00000';
    }
  }

  // Helper method to generate simple hash from string
  private simpleStringHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000; // Keep within 3 digits
  }

  // Helper method to get next MCQ sequence number
  private async getNextMCQSequenceNumber(): Promise<string> {
    try {
      // Get total count of all questions (simplified approach)
      const totalQuestions = await this.prisma.question.count({ 
        where: { isActive: true } 
      });

      // Use total count + 1 as the sequence number, padded to 7 digits
      const nextSequence = (totalQuestions + 1).toString().padStart(7, '0');

      console.log('Generated MCQ sequence number:', {
        totalQuestions,
        nextSequence
      });

      return nextSequence;

    } catch (error) {
      console.error('Error getting MCQ sequence number:', error);
      
      // Fallback: use timestamp + random number, padded to 7 digits
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const fallbackNumber = ((timestamp + random) % 10000000).toString().padStart(7, '0');
      
      return fallbackNumber;
    }
  }
}