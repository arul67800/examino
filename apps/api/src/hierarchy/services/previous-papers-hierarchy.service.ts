import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { PreviousPapersHierarchyItem } from '../types';

@Injectable()
export class PreviousPapersHierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<PreviousPapersHierarchyItem[]> {
    const items = await this.prisma.previousPapersHierarchy.findMany({
      include: this.getNestedInclude(5), // Get all 5 levels
      where: { level: 1 }, // Only return root items (Exams)
      orderBy: { order: 'asc' }
    });
    return items as unknown as PreviousPapersHierarchyItem[];
  }

  async findOne(id: string): Promise<PreviousPapersHierarchyItem> {
    const item = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id },
      include: this.getNestedInclude(5)
    });

    if (!item) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    return item as unknown as PreviousPapersHierarchyItem;
  }

  async findByLevel(level: number): Promise<PreviousPapersHierarchyItem[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Level must be between 1 and 5');
    }

    const items = await this.prisma.previousPapersHierarchy.findMany({
      where: { level },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as PreviousPapersHierarchyItem[];
  }

  async findByParent(parentId: string): Promise<PreviousPapersHierarchyItem[]> {
    const items = await this.prisma.previousPapersHierarchy.findMany({
      where: { parentId },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as PreviousPapersHierarchyItem[];
  }

  async create(input: CreateHierarchyItemInput): Promise<PreviousPapersHierarchyItem> {
    // Validate parent exists if parentId is provided
    if (input.parentId) {
      const parent = await this.prisma.previousPapersHierarchy.findUnique({
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
      throw new BadRequestException('Only level 1 items (Exams) can have no parent');
    }

    // Get the highest order for items at the same level and parent
    const maxOrder = await this.prisma.previousPapersHierarchy.aggregate({
      where: {
        level: input.level,
        parentId: input.parentId || null
      },
      _max: { order: true }
    });

    const item = await this.prisma.previousPapersHierarchy.create({
      data: {
        ...input,
        order: (maxOrder._max.order || 0) + 1,
        type: this.getPreviousPapersTypeByLevel(input.level)
      },
      include: {
        children: true,
        parent: true
      }
    });

    return item as unknown as PreviousPapersHierarchyItem;
  }

  async update(id: string, input: UpdateHierarchyItemInput): Promise<PreviousPapersHierarchyItem> {
    const existingItem = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id }
    });

    if (!existingItem) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    const updatedItem = await this.prisma.previousPapersHierarchy.update({
      where: { id },
      data: input,
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as PreviousPapersHierarchyItem;
  }

  async delete(id: string): Promise<boolean> {
    const existingItem = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!existingItem) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    if (existingItem.children.length > 0) {
      throw new BadRequestException('Cannot delete item with children');
    }

    await this.prisma.previousPapersHierarchy.delete({
      where: { id }
    });

    return true;
  }

  async reorder(items: ReorderHierarchyItemInput[]): Promise<PreviousPapersHierarchyItem[]> {
    const updatedItems: PreviousPapersHierarchyItem[] = [];

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.previousPapersHierarchy.update({
          where: { id: item.id },
          data: { order: item.order },
          include: {
            children: true,
            parent: true
          }
        });
        updatedItems.push(updated as PreviousPapersHierarchyItem);
      }
    });

    return updatedItems;
  }

  async updateQuestionCount(id: string, count: number): Promise<PreviousPapersHierarchyItem> {
    const item = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id }
    });

    if (!item) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    if (item.level !== 5) {
      throw new BadRequestException('Only chapters (level 5) can have question counts');
    }

    const updatedItem = await this.prisma.previousPapersHierarchy.update({
      where: { id },
      data: { questionCount: count },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as PreviousPapersHierarchyItem;
  }

  async getHierarchyStats() {
    const stats = await this.prisma.previousPapersHierarchy.groupBy({
      by: ['level'],
      _count: { id: true },
      _sum: { questionCount: true }
    });

    return stats.map(stat => ({
      level: stat.level,
      type: this.getPreviousPapersTypeByLevel(stat.level),
      count: stat._count.id,
      totalQuestions: stat._sum.questionCount || 0
    }));
  }

  async publish(id: string): Promise<PreviousPapersHierarchyItem> {
    const item = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id },
      include: { parent: true }
    });

    if (!item) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    // Check if parent is published (unless it's an Exam - level 1)
    if (item.level > 1 && item.parent && !item.parent.isPublished) {
      throw new BadRequestException('Please publish the parent first to proceed');
    }

    const updatedItem = await this.prisma.previousPapersHierarchy.update({
      where: { id },
      data: { isPublished: true },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as PreviousPapersHierarchyItem;
  }

  async unpublish(id: string): Promise<PreviousPapersHierarchyItem> {
    const item = await this.prisma.previousPapersHierarchy.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!item) {
      throw new NotFoundException(`Previous Papers hierarchy item with ID ${id} not found`);
    }

    // Unpublish all children first
    if (item.children.length > 0) {
      await this.prisma.previousPapersHierarchy.updateMany({
        where: { parentId: id },
        data: { isPublished: false }
      });
    }

    const updatedItem = await this.prisma.previousPapersHierarchy.update({
      where: { id },
      data: { isPublished: false },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as PreviousPapersHierarchyItem;
  }

  async findPublished(): Promise<PreviousPapersHierarchyItem[]> {
    const items = await this.prisma.previousPapersHierarchy.findMany({
      where: { 
        isPublished: true,
        OR: [
          { level: 1 }, // Exams
          { level: 2 }  // Years
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

    return items as unknown as PreviousPapersHierarchyItem[];
  }

  private getPreviousPapersTypeByLevel(level: number): string {
    switch (level) {
      case 1: return 'Exam';
      case 2: return 'Year';
      case 3: return 'Subject';
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