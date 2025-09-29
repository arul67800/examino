import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { HierarchyItem } from '../types';
import { HierarchyService } from '../services';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { HierarchyStats } from '../types';

@Resolver(() => HierarchyItem)
export class HierarchyResolver {
  constructor(private readonly hierarchyService: HierarchyService) {}

  @Query(() => [HierarchyItem], { 
    name: 'hierarchyItems',
    description: 'Get all hierarchy items with nested children' 
  })
  async getAllHierarchyItems(): Promise<HierarchyItem[]> {
    return this.hierarchyService.findAll();
  }

  @Query(() => HierarchyItem, { 
    name: 'hierarchyItem',
    nullable: true,
    description: 'Get a specific hierarchy item by ID' 
  })
  async getHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<HierarchyItem> {
    return this.hierarchyService.findOne(id);
  }

  @Query(() => [HierarchyItem], { 
    name: 'hierarchyItemsByLevel',
    description: 'Get all hierarchy items at a specific level' 
  })
  async getHierarchyItemsByLevel(
    @Args('level', { type: () => Number }) level: number
  ): Promise<HierarchyItem[]> {
    return this.hierarchyService.findByLevel(level);
  }

  @Query(() => [HierarchyItem], { 
    name: 'hierarchyItemsByParent',
    description: 'Get all direct children of a parent hierarchy item' 
  })
  async getHierarchyItemsByParent(
    @Args('parentId', { type: () => ID }) parentId: string
  ): Promise<HierarchyItem[]> {
    return this.hierarchyService.findByParent(parentId);
  }

  @Query(() => [HierarchyStats], { 
    name: 'hierarchyStats',
    description: 'Get statistics about the hierarchy structure' 
  })
  async getHierarchyStats(): Promise<HierarchyStats[]> {
    return this.hierarchyService.getHierarchyStats();
  }

  @Mutation(() => HierarchyItem, {
    description: 'Create a new hierarchy item'
  })
  async createHierarchyItem(
    @Args('input') input: CreateHierarchyItemInput
  ): Promise<HierarchyItem> {
    return this.hierarchyService.create(input);
  }

  @Mutation(() => HierarchyItem, {
    description: 'Update an existing hierarchy item'
  })
  async updateHierarchyItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateHierarchyItemInput
  ): Promise<HierarchyItem> {
    return this.hierarchyService.update(id, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a hierarchy item (only if it has no children)'
  })
  async deleteHierarchyItem(
    @Args('id', { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.hierarchyService.delete(id);
  }

  @Mutation(() => [HierarchyItem], {
    description: 'Reorder multiple hierarchy items'
  })
  async reorderHierarchyItems(
    @Args('items', { type: () => [ReorderHierarchyItemInput] }) 
    items: ReorderHierarchyItemInput[]
  ): Promise<HierarchyItem[]> {
    return this.hierarchyService.reorder(items);
  }

  @Mutation(() => HierarchyItem, {
    description: 'Update the question count for a chapter (level 5 only)'
  })
  async updateQuestionCount(
    @Args('id', { type: () => ID }) id: string,
    @Args('count', { type: () => Number }) count: number
  ): Promise<HierarchyItem> {
    return this.hierarchyService.updateQuestionCount(id, count);
  }

  @Mutation(() => HierarchyItem, {
    description: 'Publish a hierarchy item to make it visible in the sidebar'
  })
  async publishHierarchyItem(
    @Args('id', { type: () => ID }) id: string
  ): Promise<HierarchyItem> {
    return this.hierarchyService.publish(id);
  }

  @Mutation(() => HierarchyItem, {
    description: 'Unpublish a hierarchy item to hide it from the sidebar'
  })
  async unpublishHierarchyItem(
    @Args('id', { type: () => ID }) id: string
  ): Promise<HierarchyItem> {
    return this.hierarchyService.unpublish(id);
  }

  @Query(() => [HierarchyItem], { 
    name: 'publishedHierarchyItems',
    description: 'Get all published hierarchy items for sidebar display' 
  })
  async getPublishedHierarchyItems(): Promise<HierarchyItem[]> {
    return this.hierarchyService.findPublished();
  }
}