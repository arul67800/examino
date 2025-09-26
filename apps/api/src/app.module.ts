import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UserResolver } from './user.resolver';
import { PostResolver } from './post.resolver';
import { HierarchyModule } from './hierarchy';
import { McqModule } from './mcq/mcq.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    HierarchyModule,
    McqModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserResolver, PostResolver],
})
export class AppModule {}
