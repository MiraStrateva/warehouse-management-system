import { IsEmail, Length } from "class-validator";
import { Field, InputType } from '@nestjs/graphql';
import { IsNotExistingUser } from "../validators/is-not-existing-user.validator";
import { IsRepeated } from "../validators/is-repeated.validator";

@InputType('')
export class UserInput {
    @Length(5)
    @IsNotExistingUser()
    @Field()
    username: string;

    @Length(8)
    @Field()
    password: string;

    @Length(8)
    @IsRepeated('password')
    @Field()
    retypedPassword: string;

    @Length(2)
    @Field()
    firstName: string;

    @Length(2)
    @Field()
    lastName: string;

    @IsEmail()
    @IsNotExistingUser()
    @Field()
    email: string;
}