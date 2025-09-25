import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';
import { Post } from './models';

@Resolver(() => Post)
export class PostResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Post], { name: 'posts' })
  findAll() {
    return this.prisma.post.findMany();
  }

  @Query(() => Post, { name: 'post', nullable: true })
  findOne(@Args('id') id: string) {
    return this.prisma.post.findUnique({
      where: { id }
    });
  }

  @Mutation(() => Post)
  createPost(
    @Args('title') title: string,
    @Args('content', { nullable: true }) content: string,
    @Args('authorId') authorId: string
  ) {
    return this.prisma.post.create({
      data: { title, content, authorId }
    });
  }
}