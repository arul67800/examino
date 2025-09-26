import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QuestionIdGenerator } from './services/question-id-generator.service';
import { McqService } from './services/mcq.service';
import { McqResolver } from './resolvers/mcq.resolver';

@Module({
  providers: [
    PrismaService,
    QuestionIdGenerator,
    McqService,
    McqResolver
  ],
  exports: [
    QuestionIdGenerator,
    McqService
  ]
})
export class McqModule {}