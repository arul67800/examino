import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { PreviousPapersHierarchyItem } from '../types';
import { PreviousPapersHierarchyService } from '../services';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { HierarchyStats } from '../types';

@Resolver(() => PreviousPapersHierarchyItem)
export class PreviousPapersHierarchyResolver {
  constructor(private readonly previousPapersHierarchyService: PreviousPapersHierarchyService) {}

  @Query(() => [PreviousPapersHierarchyItem], { 
    name: 'previousPapersHierarchyItems',
    description: 'Get all previous papers hierarchy items with nested children' 
  })
  async getAllPreviousPapersHierarchyItems(): Promise<PreviousPapersHierarchyItem[]> {
    return this.previousPapersHierarchyService.findAll();
  }

  @Query(() => PreviousPapersHierarchyItem, { 
    name: 'previousPapersHierarchyItem',
    nullable: true,
    description: 'Get a specific previous papers hierarchy item by ID' 
  })
  async getPreviousPapersHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.findOne(id);
  }

  @Query(() => [PreviousPapersHierarchyItem], { 
    name: 'previousPapersHierarchyItemsByLevel',
    description: 'Get all previous papers hierarchy items at a specific level' 
  })
  async getPreviousPapersHierarchyItemsByLevel(
    @Args('level', { type: () => Number }) level: number
  ): Promise<PreviousPapersHierarchyItem[]> {
    return this.previousPapersHierarchyService.findByLevel(level);
  }

  @Query(() => [PreviousPapersHierarchyItem], { 
    name: 'previousPapersHierarchyItemsByParent',
    description: 'Get all direct children of a parent previous papers hierarchy item' 
  })
  async getPreviousPapersHierarchyItemsByParent(
    @Args('parentId', { type: () => ID }) parentId: string
  ): Promise<PreviousPapersHierarchyItem[]> {
    return this.previousPapersHierarchyService.findByParent(parentId);
  }

  @Query(() => [HierarchyStats], { 
    name: 'previousPapersHierarchyStats',
    description: 'Get statistics about the previous papers hierarchy structure' 
  })
  async getPreviousPapersHierarchyStats(): Promise<HierarchyStats[]> {
    return this.previousPapersHierarchyService.getHierarchyStats();
  }

  @Query(() => [PreviousPapersHierarchyItem], { 
    name: 'publishedPreviousPapersHierarchyItems',
    description: 'Get all published previous papers hierarchy items for sidebar display' 
  })
  async getPublishedPreviousPapersHierarchyItems(): Promise<PreviousPapersHierarchyItem[]> {
    return this.previousPapersHierarchyService.findPublished();
  }

  @Mutation(() => PreviousPapersHierarchyItem, { 
    name: 'createPreviousPapersHierarchyItem',
    description: 'Create a new previous papers hierarchy item' 
  })
  async createPreviousPapersHierarchyItem(
    @Args('input') input: CreateHierarchyItemInput
  ): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.create(input);
  }

  @Mutation(() => PreviousPapersHierarchyItem, { 
    name: 'updatePreviousPapersHierarchyItem',
    description: 'Update an existing previous papers hierarchy item' 
  })
  async updatePreviousPapersHierarchyItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateHierarchyItemInput
  ): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.update(id, input);
  }

  @Mutation(() => Boolean, { 
    name: 'deletePreviousPapersHierarchyItem',
    description: 'Delete a previous papers hierarchy item (only if it has no children)' 
  })
  async deletePreviousPapersHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.previousPapersHierarchyService.delete(id);
  }

  @Mutation(() => [PreviousPapersHierarchyItem], { 
    name: 'reorderPreviousPapersHierarchyItems',
    description: 'Reorder multiple previous papers hierarchy items' 
  })
  async reorderPreviousPapersHierarchyItems(
    @Args('items', { type: () => [ReorderHierarchyItemInput] }) items: ReorderHierarchyItemInput[]
  ): Promise<PreviousPapersHierarchyItem[]> {
    return this.previousPapersHierarchyService.reorder(items);
  }

  @Mutation(() => PreviousPapersHierarchyItem, { 
    name: 'updatePreviousPapersQuestionCount',
    description: 'Update the question count for a previous papers chapter (level 5 only)' 
  })
  async updatePreviousPapersQuestionCount(
    @Args('id', { type: () => ID }) id: string,
    @Args('count', { type: () => Number }) count: number
  ): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.updateQuestionCount(id, count);
  }

  @Mutation(() => PreviousPapersHierarchyItem, { 
    name: 'publishPreviousPapersHierarchyItem',
    description: 'Publish a previous papers hierarchy item to make it visible in the sidebar' 
  })
  async publishPreviousPapersHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.publish(id);
  }

  @Mutation(() => PreviousPapersHierarchyItem, { 
    name: 'unpublishPreviousPapersHierarchyItem',
    description: 'Unpublish a previous papers hierarchy item to hide it from the sidebar' 
  })
  async unpublishPreviousPapersHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<PreviousPapersHierarchyItem> {
    return this.previousPapersHierarchyService.unpublish(id);
  }
}