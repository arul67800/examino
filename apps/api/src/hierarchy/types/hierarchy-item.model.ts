import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class HierarchyItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  level: number;

  @Field()
  type: string;

  @Field(() => String, { nullable: true })
  color?: string | null;

  @Field(() => Int)
  order: number;

  @Field(() => ID, { nullable: true })
  parentId?: string | null;

  @Field(() => Int)
  questionCount: number;

  @Field(() => Boolean, { defaultValue: false })
  isPublished: boolean;

  @Field(() => [HierarchyItem], { defaultValue: [] })
  children: HierarchyItem[];

  @Field(() => HierarchyItem, { nullable: true })
  parent?: HierarchyItem | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}