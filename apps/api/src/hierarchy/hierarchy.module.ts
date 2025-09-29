import { Module } from '@nestjs/common';
import { 
  HierarchyResolver,
  QuestionBankHierarchyResolver,
  PreviousPapersHierarchyResolver
} from './resolvers';
import { 
  HierarchyService,
  QuestionBankHierarchyService,
  PreviousPapersHierarchyService
} from './services';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    HierarchyResolver,
    QuestionBankHierarchyResolver,
    PreviousPapersHierarchyResolver,
    HierarchyService,
    QuestionBankHierarchyService,
    PreviousPapersHierarchyService,
    PrismaService
  ],
  exports: [
    HierarchyService,
    QuestionBankHierarchyService,
    PreviousPapersHierarchyService
  ]
})
export class HierarchyModule {}