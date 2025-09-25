import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';
import { User } from './generated/graphql/user/user.model';
import { CreateOneUserArgs } from './generated/graphql/user/create-one-user.args';
import { FindUniqueUserArgs } from './generated/graphql/user/find-unique-user.args';
import { UpdateOneUserArgs } from './generated/graphql/user/update-one-user.args';
import { DeleteOneUserArgs } from './generated/graphql/user/delete-one-user.args';

@Resolver(() => User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.prisma.user.findMany({
      include: {
        posts: true,
      },
    });
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args() args: FindUniqueUserArgs) {
    return this.prisma.user.findUnique({
      where: args.where,
      include: {
        posts: true,
      },
    });
  }

  @Mutation(() => User)
  createUser(@Args() args: CreateOneUserArgs) {
    return this.prisma.user.create({
      data: args.data,
      include: {
        posts: true,
      },
    });
  }

  @Mutation(() => User, { nullable: true })
  updateUser(@Args() args: UpdateOneUserArgs) {
    return this.prisma.user.update({
      where: args.where,
      data: args.data,
      include: {
        posts: true,
      },
    });
  }

  @Mutation(() => User, { nullable: true })
  deleteUser(@Args() args: DeleteOneUserArgs) {
    return this.prisma.user.delete({
      where: args.where,
      include: {
        posts: true,
      },
    });
  }
}