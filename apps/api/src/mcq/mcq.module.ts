import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionIdGenerator } from './services/question-id-generator.service';
import { McqService } from './services/mcq.service';
import { TagsService } from './services/tags.service';
import { McqResolver } from './resolvers/mcq.resolver';
import { TagsResolver } from './resolvers/tags.resolver';
import { HierarchyModule } from '../hierarchy/hierarchy.module';

@Module({
  imports: [HierarchyModule],
  providers: [
    PrismaService,
    QuestionIdGenerator,
    McqService,
    TagsService,
    McqResolver,
    TagsResolver
  ],
  exports: [
    QuestionIdGenerator,
    McqService,
    TagsService
  ]
})
export class McqModule {}