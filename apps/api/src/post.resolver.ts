import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';
import { Post } from './generated/graphql/post/post.model';
import { CreateOnePostArgs } from './generated/graphql/post/create-one-post.args';
import { FindUniquePostArgs } from './generated/graphql/post/find-unique-post.args';
import { UpdateOnePostArgs } from './generated/graphql/post/update-one-post.args';
import { DeleteOnePostArgs } from './generated/graphql/post/delete-one-post.args';

@Resolver(() => Post)
export class PostResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Post], { name: 'posts' })
  findAll() {
    return this.prisma.post.findMany({
      include: {
        author: true,
      },
    });
  }

  @Query(() => Post, { name: 'post', nullable: true })
  findOne(@Args() args: FindUniquePostArgs) {
    return this.prisma.post.findUnique({
      where: args.where,
      include: {
        author: true,
      },
    });
  }

  @Mutation(() => Post)
  createPost(@Args() args: CreateOnePostArgs) {
    return this.prisma.post.create({
      data: args.data,
      include: {
        author: true,
      },
    });
  }

  @Mutation(() => Post, { nullable: true })
  updatePost(@Args() args: UpdateOnePostArgs) {
    return this.prisma.post.update({
      where: args.where,
      data: args.data,
      include: {
        author: true,
      },
    });
  }

  @Mutation(() => Post, { nullable: true })
  deletePost(@Args() args: DeleteOnePostArgs) {
    return this.prisma.post.delete({
      where: args.where,
      include: {
        author: true,
      },
    });
  }
}