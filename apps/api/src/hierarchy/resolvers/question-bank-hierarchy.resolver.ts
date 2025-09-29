import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { QuestionBankHierarchyItem } from '../types';
import { QuestionBankHierarchyService } from '../services';
import { CreateHierarchyItemInput, UpdateHierarchyItemInput, ReorderHierarchyItemInput } from '../dto';
import { HierarchyStats } from '../types';

@Resolver(() => QuestionBankHierarchyItem)
export class QuestionBankHierarchyResolver {
  constructor(private readonly questionBankHierarchyService: QuestionBankHierarchyService) {}

  @Query(() => [QuestionBankHierarchyItem], { 
    name: 'questionBankHierarchyItems',
    description: 'Get all main bank hierarchy items with nested children' 
  })
  async getAllQuestionBankHierarchyItems(): Promise<QuestionBankHierarchyItem[]> {
    return this.questionBankHierarchyService.findAll();
  }

  @Query(() => QuestionBankHierarchyItem, { 
    name: 'questionBankHierarchyItem',
    nullable: true,
    description: 'Get a specific main bank hierarchy item by ID' 
  })
  async getQuestionBankHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.findOne(id);
  }

  @Query(() => [QuestionBankHierarchyItem], { 
    name: 'questionBankHierarchyItemsByLevel',
    description: 'Get all main bank hierarchy items at a specific level' 
  })
  async getQuestionBankHierarchyItemsByLevel(
    @Args('level', { type: () => Number }) level: number
  ): Promise<QuestionBankHierarchyItem[]> {
    return this.questionBankHierarchyService.findByLevel(level);
  }

  @Query(() => [QuestionBankHierarchyItem], { 
    name: 'questionBankHierarchyItemsByParent',
    description: 'Get all direct children of a parent main bank hierarchy item' 
  })
  async getQuestionBankHierarchyItemsByParent(
    @Args('parentId', { type: () => ID }) parentId: string
  ): Promise<QuestionBankHierarchyItem[]> {
    return this.questionBankHierarchyService.findByParent(parentId);
  }

  @Query(() => [HierarchyStats], { 
    name: 'questionBankHierarchyStats',
    description: 'Get statistics about the main bank hierarchy structure' 
  })
  async getQuestionBankHierarchyStats(): Promise<HierarchyStats[]> {
    return this.questionBankHierarchyService.getHierarchyStats();
  }

  @Query(() => [QuestionBankHierarchyItem], { 
    name: 'publishedQuestionBankHierarchyItems',
    description: 'Get all published main bank hierarchy items for sidebar display' 
  })
  async getPublishedQuestionBankHierarchyItems(): Promise<QuestionBankHierarchyItem[]> {
    return this.questionBankHierarchyService.findPublished();
  }

  @Mutation(() => QuestionBankHierarchyItem, { 
    name: 'createQuestionBankHierarchyItem',
    description: 'Create a new main bank hierarchy item' 
  })
  async createQuestionBankHierarchyItem(
    @Args('input') input: CreateHierarchyItemInput
  ): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.create(input);
  }

  @Mutation(() => QuestionBankHierarchyItem, { 
    name: 'updateQuestionBankHierarchyItem',
    description: 'Update an existing main bank hierarchy item' 
  })
  async updateQuestionBankHierarchyItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateHierarchyItemInput
  ): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.update(id, input);
  }

  @Mutation(() => Boolean, { 
    name: 'deleteQuestionBankHierarchyItem',
    description: 'Delete a main bank hierarchy item (only if it has no children)' 
  })
  async deleteQuestionBankHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.questionBankHierarchyService.delete(id);
  }

  @Mutation(() => [QuestionBankHierarchyItem], { 
    name: 'reorderQuestionBankHierarchyItems',
    description: 'Reorder multiple main bank hierarchy items' 
  })
  async reorderQuestionBankHierarchyItems(
    @Args('items', { type: () => [ReorderHierarchyItemInput] }) items: ReorderHierarchyItemInput[]
  ): Promise<QuestionBankHierarchyItem[]> {
    return this.questionBankHierarchyService.reorder(items);
  }

  @Mutation(() => QuestionBankHierarchyItem, { 
    name: 'updateQuestionBankQuestionCount',
    description: 'Update the question count for a question bank chapter (level 5 only)' 
  })
  async updateQuestionBankQuestionCount(
    @Args('id', { type: () => ID }) id: string,
    @Args('count', { type: () => Number }) count: number
  ): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.updateQuestionCount(id, count);
  }

  @Mutation(() => QuestionBankHierarchyItem, { 
    name: 'publishQuestionBankHierarchyItem',
    description: 'Publish a main bank hierarchy item to make it visible in the sidebar' 
  })
  async publishQuestionBankHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.publish(id);
  }

  @Mutation(() => QuestionBankHierarchyItem, { 
    name: 'unpublishQuestionBankHierarchyItem',
    description: 'Unpublish a main bank hierarchy item to hide it from the sidebar' 
  })
  async unpublishQuestionBankHierarchyItem(@Args('id', { type: () => ID }) id: string): Promise<QuestionBankHierarchyItem> {
    return this.questionBankHierarchyService.unpublish(id);
  }
}