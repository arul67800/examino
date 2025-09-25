import { Module } from '@nestjs/common';
import { HierarchyResolver } from './resolvers';
import { HierarchyService } from './services';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    HierarchyResolver,
    HierarchyService,
    PrismaService
  ],
  exports: [HierarchyService]
})
export class HierarchyModule {}