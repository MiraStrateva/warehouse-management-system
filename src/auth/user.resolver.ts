import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from './current-user.decorator';
import { UserService } from './user.service';
import { UserInput } from './models/user.input';
import { User } from './models/user.types';
import { AuthGuardJwtGql } from './auth-guard-jwt.gql';
import { UseGuards } from '@nestjs/common';
import { UserEntity } from './user.entity';

@Resolver(() => User)
export class UserResolver {
    constructor(
        private readonly userService: UserService
    ) {}
    
    @Query(() => User)
    @UseGuards(AuthGuardJwtGql)
    public async me(@CurrentUser() user: UserEntity): Promise<User> {
        return new User(user);
    }

    @Mutation(() => User, {name: 'register'})
    public async register(
        @Args('input') input: UserInput
    ) : Promise<User> {
        return this.userService.create(input);
    }
}
