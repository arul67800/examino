import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber, Min } from 'class-validator';

@InputType()
export class ReorderHierarchyItemInput {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsNumber()
  @Min(0)
  order: number;
}