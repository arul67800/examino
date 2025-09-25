import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { HierarchyItem } from '../types';

@Injectable()
export class HierarchyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<HierarchyItem[]> {
    const items = await this.prisma.hierarchyItem.findMany({
      include: this.getNestedInclude(5), // Get all 5 levels
      where: { level: 1 }, // Only return root items (Years)
      orderBy: { order: 'asc' }
    });
    return items as unknown as HierarchyItem[];
  }

  async findOne(id: string): Promise<HierarchyItem> {
    const item = await this.prisma.hierarchyItem.findUnique({
      where: { id },
      include: this.getNestedInclude(5)
    });

    if (!item) {
      throw new NotFoundException(`Hierarchy item with ID ${id} not found`);
    }

    return item as unknown as HierarchyItem;
  }

  async findByLevel(level: number): Promise<HierarchyItem[]> {
    if (level < 1 || level > 5) {
      throw new BadRequestException('Level must be between 1 and 5');
    }

    const items = await this.prisma.hierarchyItem.findMany({
      where: { level },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as HierarchyItem[];
  }

  async findByParent(parentId: string): Promise<HierarchyItem[]> {
    const items = await this.prisma.hierarchyItem.findMany({
      where: { parentId },
      include: {
        children: true,
        parent: true
      },
      orderBy: { order: 'asc' }
    });
    return items as unknown as HierarchyItem[];
  }

  async create(input: CreateHierarchyItemInput): Promise<HierarchyItem> {
    // Validate parent exists if parentId is provided
    if (input.parentId) {
      const parent = await this.prisma.hierarchyItem.findUnique({
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
    const maxOrder = await this.prisma.hierarchyItem.aggregate({
      where: {
        level: input.level,
        parentId: input.parentId || null
      },
      _max: { order: true }
    });

    const item = await this.prisma.hierarchyItem.create({
      data: {
        ...input,
        order: (maxOrder._max.order || 0) + 1,
        type: this.getTypeByLevel(input.level)
      },
      include: {
        children: true,
        parent: true
      }
    });

    return item as unknown as HierarchyItem;
  }

  async update(id: string, input: UpdateHierarchyItemInput): Promise<HierarchyItem> {
    const existingItem = await this.prisma.hierarchyItem.findUnique({
      where: { id }
    });

    if (!existingItem) {
      throw new NotFoundException(`Hierarchy item with ID ${id} not found`);
    }

    const updatedItem = await this.prisma.hierarchyItem.update({
      where: { id },
      data: input,
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as HierarchyItem;
  }

  async delete(id: string): Promise<boolean> {
    const existingItem = await this.prisma.hierarchyItem.findUnique({
      where: { id },
      include: { children: true }
    });

    if (!existingItem) {
      throw new NotFoundException(`Hierarchy item with ID ${id} not found`);
    }

    if (existingItem.children.length > 0) {
      throw new BadRequestException('Cannot delete item with children');
    }

    await this.prisma.hierarchyItem.delete({
      where: { id }
    });

    return true;
  }

  async reorder(items: ReorderHierarchyItemInput[]): Promise<HierarchyItem[]> {
    const updatedItems: HierarchyItem[] = [];

    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.hierarchyItem.update({
          where: { id: item.id },
          data: { order: item.order },
          include: {
            children: true,
            parent: true
          }
        });
        updatedItems.push(updated as HierarchyItem);
      }
    });

    return updatedItems;
  }

  async updateQuestionCount(id: string, count: number): Promise<HierarchyItem> {
    const item = await this.prisma.hierarchyItem.findUnique({
      where: { id }
    });

    if (!item) {
      throw new NotFoundException(`Hierarchy item with ID ${id} not found`);
    }

    if (item.level !== 5) {
      throw new BadRequestException('Only chapters (level 5) can have question counts');
    }

    const updatedItem = await this.prisma.hierarchyItem.update({
      where: { id },
      data: { questionCount: count },
      include: {
        children: true,
        parent: true
      }
    });

    return updatedItem as unknown as HierarchyItem;
  }

  async getHierarchyStats() {
    const stats = await this.prisma.hierarchyItem.groupBy({
      by: ['level'],
      _count: { id: true },
      _sum: { questionCount: true }
    });

    return stats.map(stat => ({
      level: stat.level,
      type: this.getTypeByLevel(stat.level),
      count: stat._count.id,
      totalQuestions: stat._sum.questionCount || 0
    }));
  }

  private getTypeByLevel(level: number): string {
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