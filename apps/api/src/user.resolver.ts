import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PrismaService } from './prisma.service';
import { User } from './models';

@Resolver(() => User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.prisma.user.findMany();
  }

  @Query(() => User, { name: 'user', nullable: true })
  findOne(@Args('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }

  @Mutation(() => User)
  createUser(
    @Args('email') email: string,
    @Args('name', { nullable: true }) name?: string
  ) {
    return this.prisma.user.create({
      data: { email, name }
    });
  }
}