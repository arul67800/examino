import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { QuestionBankHierarchyItem } from '../types';

@Injectable()
export class QuestionBankHierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<QuestionBankHierarchyItem[]> {
    const items = await this.prisma.questionBankHierarchy.findMany({
      include: this.getNestedInclude(5), // Get all 5 levels
      where: { level: 1 }, // Only return root items (Years)
      orderBy: { order: 'asc' }
    });
    return items as unknown as QuestionBankHierarchyItem[];
  }

  async findOne(id: string): Promise<QuestionBankHierarchyItem> {
    const item = await this.prisma.questionBankHierarchy.findUnique({
      where: { id },
      include: this.getNestedInclude(5)
    });

    if (!item) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    return item as unknown as QuestionBankHierarchyItem;
  }

  async findByLevel(level: number): Promise<QuestionBankHierarchyItem[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Level must be between 1 and 5');
    }

    const items = await this.prisma.questionBankHierarchy.findMany({
      where: { level },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as QuestionBankHierarchyItem[];
  }

  async findByParent(parentId: string): Promise<QuestionBankHierarchyItem[]> {
    const items = await this.prisma.questionBankHierarchy.findMany({
      where: { parentId },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as QuestionBankHierarchyItem[];
  }

  async create(input: CreateHierarchyItemInput): Promise<QuestionBankHierarchyItem> {
    // Validate parent exists if parentId is provided
    if (input.parentId) {
      const parent = await this.prisma.questionBankHierarchy.findUnique({
        where: { id: input.parentId }
      });

      if (!parent) {
        throw new NotFoundException(`Parent with ID ${input.parentId} not found`);
      }

      // Validate level hierarchy
      if (parent.level !== input.level - 1) {
        throw new BadRequestException(
          `Invalid level hierarchy. Parent level is ${parent.level}, child level should be ${parent.level + 1}`
        );
      }
    } else if (input.level !== 1) {
      throw new BadRequestException('Only level 1 items (Years) can have no parent');
    }

    // Get the highest order for items at the same level and parent
    const maxOrder = await this.prisma.questionBankHierarchy.aggregate({
      where: {
        level: input.level,
        parentId: input.parentId || null
      },
      _max: { order: true }
    });

    const item = await this.prisma.questionBankHierarchy.create({
      data: {
        ...input,
        order: (maxOrder._max.order || 0) + 1,
        type: this.getQuestionBankTypeByLevel(input.level)
      },
      include: {
        children: true,
        parent: true
      }
    });

    return item as unknown as QuestionBankHierarchyItem;
  }

  async update(id: string, input: UpdateHierarchyItemInput): Promise<QuestionBankHierarchyItem> {
    const existingItem = await this.prisma.questionBankHierarchy.findUnique({
      where: { id }
    });

    if (!existingItem) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    const updatedItem = await this.prisma.questionBankHierarchy.update({
      where: { id },
      data: input,
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as QuestionBankHierarchyItem;
  }

  async delete(id: string): Promise<boolean> {
    const existingItem = await this.prisma.questionBankHierarchy.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!existingItem) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    if (existingItem.children.length > 0) {
      throw new BadRequestException('Cannot delete item with children');
    }

    await this.prisma.questionBankHierarchy.delete({
      where: { id }
    });

    return true;
  }

  async reorder(items: ReorderHierarchyItemInput[]): Promise<QuestionBankHierarchyItem[]> {
    const updatedItems: QuestionBankHierarchyItem[] = [];

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.questionBankHierarchy.update({
          where: { id: item.id },
          data: { order: item.order },
          include: {
            children: true,
            parent: true
          }
        });
        updatedItems.push(updated as QuestionBankHierarchyItem);
      }
    });

    return updatedItems;
  }

  async updateQuestionCount(id: string, count: number): Promise<QuestionBankHierarchyItem> {
    const item = await this.prisma.questionBankHierarchy.findUnique({
      where: { id }
    });

    if (!item) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    if (item.level !== 5) {
      throw new BadRequestException('Only chapters (level 5) can have question counts');
    }

    const updatedItem = await this.prisma.questionBankHierarchy.update({
      where: { id },
      data: { questionCount: count },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as QuestionBankHierarchyItem;
  }

  async getHierarchyStats() {
    const stats = await this.prisma.questionBankHierarchy.groupBy({
      by: ['level'],
      _count: { id: true },
      _sum: { questionCount: true }
    });

    return stats.map(stat => ({
      level: stat.level,
      type: this.getQuestionBankTypeByLevel(stat.level),
      count: stat._count.id,
      totalQuestions: stat._sum.questionCount || 0
    }));
  }

  async publish(id: string): Promise<QuestionBankHierarchyItem> {
    const item = await this.prisma.questionBankHierarchy.findUnique({
      where: { id },
      include: { parent: true }
    });

    if (!item) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    // Check if parent is published (unless it's a Year - level 1)
    if (item.level > 1 && item.parent && !item.parent.isPublished) {
      throw new BadRequestException('Please publish the parent first to proceed');
    }

    const updatedItem = await this.prisma.questionBankHierarchy.update({
      where: { id },
      data: { isPublished: true },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as QuestionBankHierarchyItem;
  }

  async unpublish(id: string): Promise<QuestionBankHierarchyItem> {
    const item = await this.prisma.questionBankHierarchy.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!item) {
      throw new NotFoundException(`Main Bank hierarchy item with ID ${id} not found`);
    }

    // Unpublish all children first
    if (item.children.length > 0) {
      await this.prisma.questionBankHierarchy.updateMany({
        where: { parentId: id },
        data: { isPublished: false }
      });
    }

    const updatedItem = await this.prisma.questionBankHierarchy.update({
      where: { id },
      data: { isPublished: false },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as QuestionBankHierarchyItem;
  }

  async findPublished(): Promise<QuestionBankHierarchyItem[]> {
    const items = await this.prisma.questionBankHierarchy.findMany({
      where: { 
        isPublished: true,
        OR: [
          { level: 1 }, // Years
          { level: 2 }  // Subjects
        ]
      },
      include: {
        children: {
          where: { isPublished: true },
          orderBy: { order: 'asc' }
        },
        parent: true
      },
      orderBy: { order: 'asc' }
    });

    return items as unknown as QuestionBankHierarchyItem[];
  }

  private getQuestionBankTypeByLevel(level: number): string {
    switch (level) {
      case 1: return 'Year';
      case 2: return 'Subject';
      case 3: return 'Part';
      case 4: return 'Section';
      case 5: return 'Chapter';
      default: return 'Item';
    }
  }

  private getNestedInclude(depth: number): any {
    if (depth <= 0) return true;
    
    return {
      children: {
        include: this.getNestedInclude(depth - 1)
      },
      parent: true
    };
  }
}