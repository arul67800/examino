import { 
  Resolver, 
  Mutation, 
  Query, 
  Args, 
  ID, 
  ObjectType, 
  Field, 
  Int,
  InputType,
  registerEnumType 
} from '@nestjs/graphql';
import { McqService, CreateQuestionInput, UpdateQuestionInput } from '../services/mcq.service';

// Register enums
export enum QuestionType {
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  ASSERTION_REASONING = 'ASSERTION_REASONING'
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

registerEnumType(QuestionType, { name: 'QuestionType' });
registerEnumType(QuestionDifficulty, { name: 'QuestionDifficulty' });

// Input types for GraphQL
@InputType()
export class QuestionOptionInput {
  @Field({ nullable: true })
  id?: string;

  @Field()
  text: string;

  @Field()
  isCorrect: boolean;

  @Field({ nullable: true })
  order?: number;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  references?: string;
}

@InputType()
export class CreateQuestionInputGQL {
  @Field(() => QuestionType)
  type: QuestionType;

  @Field()
  question: string;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  references?: string;

  @Field(() => QuestionDifficulty, { nullable: true, defaultValue: 'MEDIUM' })
  difficulty?: QuestionDifficulty;

  @Field({ nullable: true, defaultValue: 1 })
  points?: number;

  @Field({ nullable: true })
  timeLimit?: number;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  sourceTags?: string[];

  @Field(() => [String], { nullable: true })
  examTags?: string[];

  @Field()
  hierarchyItemId: string;

  @Field({ nullable: true })
  originalHierarchyItemId?: string;

  @Field({ nullable: true })
  hierarchyType?: string;

  @Field(() => [QuestionOptionInput], { nullable: true })
  options?: QuestionOptionInput[];

  @Field({ nullable: true })
  assertion?: string;

  @Field({ nullable: true })
  reasoning?: string;

  @Field({ nullable: true })
  createdBy?: string;
}

@InputType()
export class UpdateQuestionInputGQL {
  @Field(() => QuestionType, { nullable: true })
  type?: QuestionType;

  @Field({ nullable: true })
  question?: string;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  references?: string;

  @Field(() => QuestionDifficulty, { nullable: true })
  difficulty?: QuestionDifficulty;

  @Field({ nullable: true })
  points?: number;

  @Field({ nullable: true })
  timeLimit?: number;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => [String], { nullable: true })
  sourceTags?: string[];

  @Field(() => [String], { nullable: true })
  examTags?: string[];

  @Field(() => [QuestionOptionInput], { nullable: true })
  options?: QuestionOptionInput[];

  @Field({ nullable: true })
  assertion?: string;

  @Field({ nullable: true })
  reasoning?: string;
}

@ObjectType()
export class QuestionOption {
  @Field(() => ID)
  id: string;

  @Field()
  text: string;

  @Field()
  isCorrect: boolean;

  @Field()
  order: number;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  references?: string;

  @Field(() => ID)
  questionId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class HierarchyPath {
  @Field({ nullable: true })
  year?: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  part?: string;

  @Field({ nullable: true })
  section?: string;

  @Field({ nullable: true })
  chapter?: string;
}

@ObjectType()
export class QuestionResponse {
  @Field(() => ID)
  id: string;

  @Field()
  humanId: string;

  @Field(() => QuestionType)
  type: string;

  @Field()
  question: string;

  @Field({ nullable: true })
  explanation?: string;

  @Field({ nullable: true })
  references?: string;

  @Field()
  difficulty: string;

  @Field()
  points: number;

  @Field({ nullable: true })
  timeLimit?: number;

  @Field(() => [String])
  tags: string[];

  @Field(() => [String], { nullable: true })
  sourceTags?: string[];

  @Field(() => [String], { nullable: true })
  examTags?: string[];

  @Field(() => [QuestionOption])
  options: QuestionOption[];

  @Field({ nullable: true })
  assertion?: string;

  @Field({ nullable: true })
  reasoning?: string;

  @Field()
  isActive: boolean;

  @Field(() => ID)
  hierarchyItemId: string;

  @Field(() => HierarchyPath, { nullable: true })
  hierarchyPath?: HierarchyPath;

  @Field({ nullable: true })
  createdBy?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedQuestionsResponse {
  @Field(() => [QuestionResponse])
  questions: QuestionResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pages: number;
}

@Resolver()
export class McqResolver {
  constructor(private readonly mcqService: McqService) {}

  @Mutation(() => QuestionResponse)
  async createQuestion(
    @Args('input') input: CreateQuestionInputGQL
  ): Promise<QuestionResponse> {
    // Convert GraphQL input to service input
    const serviceInput: CreateQuestionInput = {
      type: input.type as any,
      question: input.question,
      explanation: input.explanation,
      references: input.references,
      difficulty: input.difficulty as any,
      points: input.points,
      timeLimit: input.timeLimit,
      tags: input.tags,
      sourceTags: input.sourceTags,
      examTags: input.examTags,
      hierarchyItemId: input.hierarchyItemId,
      originalHierarchyItemId: input.originalHierarchyItemId,
      hierarchyType: input.hierarchyType as any,
      options: input.options,
      assertion: input.assertion,
      reasoning: input.reasoning,
      createdBy: input.createdBy
    };

    return await this.mcqService.create(serviceInput);
  }

  @Mutation(() => QuestionResponse)
  async updateQuestion(
    @Args('id') id: string,
    @Args('input') input: UpdateQuestionInputGQL
  ): Promise<QuestionResponse> {
    // Convert GraphQL input to service input
    const serviceInput: UpdateQuestionInput = {
      type: input.type as any,
      question: input.question,
      explanation: input.explanation,
      references: input.references,
      difficulty: input.difficulty as any,
      points: input.points,
      timeLimit: input.timeLimit,
      tags: input.tags,
      sourceTags: input.sourceTags,
      examTags: input.examTags,
      options: input.options,
      assertion: input.assertion,
      reasoning: input.reasoning
    };

    return await this.mcqService.update(id, serviceInput);
  }

  @Query(() => QuestionResponse)
  async getQuestion(@Args('id') id: string): Promise<QuestionResponse> {
    return await this.mcqService.findOne(id);
  }

  @Query(() => QuestionResponse)
  async getQuestionByHumanId(@Args('humanId') humanId: string): Promise<QuestionResponse> {
    return await this.mcqService.findByHumanId(humanId);
  }

  @Query(() => PaginatedQuestionsResponse)
  async getQuestionsByHierarchy(
    @Args('hierarchyItemId') hierarchyItemId: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20
  ): Promise<PaginatedQuestionsResponse> {
    return await this.mcqService.findByHierarchy(hierarchyItemId, page, limit);
  }

  @Query(() => PaginatedQuestionsResponse)
  async getAllQuestions(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number = 1,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number = 20
  ): Promise<PaginatedQuestionsResponse> {
    return await this.mcqService.findAll(page, limit);
  }

  @Mutation(() => Boolean)
  async deleteQuestion(@Args('id') id: string): Promise<boolean> {
    return await this.mcqService.delete(id);
  }
}