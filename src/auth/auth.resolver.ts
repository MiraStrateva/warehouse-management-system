import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from "./auth.service";
import { TokenOutput } from './models/auth.types';
import { LoginInput } from './models/login.input';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => TokenOutput, { name: 'login' }) 
    public async login(
        @Args('input', { type: () => LoginInput })
        input: LoginInput
    ): Promise<TokenOutput> {
        return new TokenOutput({
            token: this.authService.getTokenForUser(
                await this.authService.validateUser(input.username, input.password)
            )
        });
    }
} 