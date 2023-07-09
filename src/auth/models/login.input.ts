import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class LoginInput {
    @Field()
    @IsNotEmpty()
    public username: string;

    @Field()
    @IsNotEmpty()
    public password: string;
}