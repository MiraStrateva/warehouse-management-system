import { IsEmail, Length, MinLength } from "class-validator";
import { Field, InputType } from '@nestjs/graphql';
import { IsNotExistingUser } from "../validators/is-not-existing-user.validator";
import { IsRepeated } from "../validators/is-repeated.validator";

@InputType('')
export class UserInput {
    @MinLength(5)
    @IsNotExistingUser()
    @Field()
    username: string;

    @MinLength(8)
    @Field()
    password: string;

    @MinLength(8)
    @IsRepeated('password')
    @Field()
    retypedPassword: string;

    @MinLength(2)
    @Field()
    firstName: string;

    @MinLength(2)
    @Field()
    lastName: string;

    @IsEmail()
    @IsNotExistingUser()
    @Field()
    email: string;
}