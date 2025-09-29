import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class QuestionBankHierarchyItem {
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

  @Field(() => [QuestionBankHierarchyItem], { defaultValue: [] })
  children: QuestionBankHierarchyItem[];

  @Field(() => QuestionBankHierarchyItem, { nullable: true })
  parent?: QuestionBankHierarchyItem | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class PreviousPapersHierarchyItem {
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

  @Field(() => [PreviousPapersHierarchyItem], { defaultValue: [] })
  children: PreviousPapersHierarchyItem[];

  @Field(() => PreviousPapersHierarchyItem, { nullable: true })
  parent?: PreviousPapersHierarchyItem | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}