import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { QuestionIdGenerator } from './question-id-generator.service';

export interface CreateQuestionInput {
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  hierarchyItemId: string;
  options?: {
    text: string;
    isCorrect: boolean;
    order?: number;
  }[];
  assertion?: string;
  reasoning?: string;
  createdBy?: string;
}

export interface UpdateQuestionInput {
  type?: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ASSERTION_REASONING';
  question?: string;
  explanation?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  points?: number;
  timeLimit?: number;
  tags?: string[];
  options?: {
    id?: string;
    text: string;
    isCorrect: boolean;
    order?: number;
  }[];
  assertion?: string;
  reasoning?: string;
}

@Injectable()
export class McqService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionIdGenerator: QuestionIdGenerator
  ) {}

  async create(input: CreateQuestionInput) {
    // Validate hierarchy item exists
    const hierarchyItem = await this.prisma.hierarchyItem.findUnique({
      where: { id: input.hierarchyItemId }
    });

    if (!hierarchyItem) {
      throw new NotFoundException(`Hierarchy item with ID ${input.hierarchyItemId} not found`);
    }

    // Validate question type and options
    this.validateQuestionData(input);

    // Generate human-readable ID
    const humanId = await this.questionIdGenerator.generateUniqueHumanId(input.hierarchyItemId);

    // Create the question
    const question = await this.prisma.question.create({
      data: {
        humanId,
        type: input.type,
        question: input.question,
        explanation: input.explanation,
        difficulty: input.difficulty || 'MEDIUM',
        points: input.points || 1,
        timeLimit: input.timeLimit,
        tags: input.tags ? JSON.stringify(input.tags) : null,
        hierarchyItemId: input.hierarchyItemId,
        assertion: input.assertion,
        reasoning: input.reasoning,
        createdBy: input.createdBy,
        options: {
          create: input.options?.map((option, index) => ({
            text: option.text,
            isCorrect: option.isCorrect,
            order: option.order || index
          })) || []
        }
      },
      include: {
        options: {
          orderBy: { order: 'asc' }
        },
        hierarchyItem: true
      }
    });

    // Update question count in hierarchy
    await this.updateQuestionCount(input.hierarchyItemId);

    return this.formatQuestion(question);
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
          order: option.order || index
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
        ...(input.difficulty && { difficulty: input.difficulty }),
        ...(input.points !== undefined && { points: input.points }),
        ...(input.timeLimit !== undefined && { timeLimit: input.timeLimit }),
        ...(input.tags !== undefined && { tags: input.tags ? JSON.stringify(input.tags) : null }),
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

    return this.formatQuestion(updatedQuestion);
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

    return this.formatQuestion(question);
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

    return this.formatQuestion(question);
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
      questions: questions.map(q => this.formatQuestion(q)),
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
    await this.updateQuestionCount(question.hierarchyItemId);

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

  private formatQuestion(question: any) {
    return {
      ...question,
      tags: question.tags ? JSON.parse(question.tags) : [],
      options: question.options || []
    };
  }
}