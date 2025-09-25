import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class CreateHierarchyItemInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsNumber()
  @Min(1)
  @Max(5)
  level: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  color?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  parentId?: string;

  @Field({ defaultValue: 0 })
  @IsNumber()
  @Min(0)
  questionCount: number;
}