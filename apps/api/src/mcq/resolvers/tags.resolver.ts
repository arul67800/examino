import { 
  Resolver, 
  Mutation, 
  Query, 
  Args, 
  ObjectType, 
  Field, 
  Int,
  InputType,
  registerEnumType 
} from '@nestjs/graphql';
import { TagsService, TagCategory, CreateTagInput, UpdateTagInput } from '../services/tags.service';

// Register enums
registerEnumType(TagCategory, { name: 'TagCategory' });

// GraphQL Object Types
@ObjectType()
export class Tag {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field(() => TagCategory)
  category: TagCategory;

  @Field(() => Int)
  usageCount: number;

  @Field({ nullable: true })
  createdBy?: string;

  @Field()
  isPreset: boolean;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}

// GraphQL Input Types
@InputType()
export class CreateTagInputGQL {
  @Field()
  name: string;

  @Field(() => TagCategory)
  category: TagCategory;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  isPreset?: boolean;
}

@InputType()
export class UpdateTagInputGQL {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  usageCount?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private tagsService: TagsService) {}

  @Query(() => [Tag])
  async getTagsByCategory(@Args('category', { type: () => TagCategory }) category: TagCategory) {
    return this.tagsService.getTagsByCategory(category);
  }

  @Query(() => [Tag])
  async getAllTags() {
    return this.tagsService.getAllTags();
  }

  @Query(() => Tag, { nullable: true })
  async getTagByNameAndCategory(
    @Args('name') name: string,
    @Args('category', { type: () => TagCategory }) category: TagCategory
  ) {
    return this.tagsService.getTagByNameAndCategory(name, category);
  }

  @Mutation(() => Tag)
  async createOrUpdateTag(@Args('input') input: CreateTagInputGQL) {
    return this.tagsService.createOrUpdateTag({
      name: input.name,
      category: input.category,
      createdBy: input.createdBy,
      isPreset: input.isPreset
    });
  }

  @Mutation(() => Tag)
  async updateTag(
    @Args('id') id: string,
    @Args('input') input: UpdateTagInputGQL
  ) {
    return this.tagsService.updateTag(id, {
      name: input.name,
      usageCount: input.usageCount,
      isActive: input.isActive
    });
  }

  @Mutation(() => Tag)
  async deactivateTag(@Args('id') id: string) {
    return this.tagsService.deactivateTag(id);
  }

  @Mutation(() => Boolean)
  async deleteTag(@Args('id') id: string) {
    try {
      await this.tagsService.deleteTag(id);
      return true;
    } catch {
      return false;
    }
  }

  @Mutation(() => Boolean)
  async initializePresetTags() {
    try {
      await this.tagsService.initializePresetTags();
      return true;
    } catch {
      return false;
    }
  }
}