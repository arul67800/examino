import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class HierarchyStats {
  @Field(() => Int)
  level: number;

  @Field()
  type: string;

  @Field(() => Int)
  count: number;

  @Field(() => Int)
  totalQuestions: number;
}

export enum HierarchyLevel {
  YEAR = 1,
  SUBJECT = 2,
  PART = 3,
  SECTION = 4,
  CHAPTER = 5
}

export interface HierarchyItemWithChildren {
  id: string;
  name: string;
  level: number;
  type: string;
  color?: string;
  order: number;
  parentId?: string;
  questionCount: number;
  children: HierarchyItemWithChildren[];
  parent?: HierarchyItemWithChildren;
  createdAt: Date;
  updatedAt: Date;
}