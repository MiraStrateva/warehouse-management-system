import { Field, InputType, Int } from "@nestjs/graphql";

export interface PaginateOptions {
    limit: number;
    currentPage: number;
    total?: boolean;
}

@InputType()
export class PaginateOptionsInput implements PaginateOptions {
    @Field(() => Int, { defaultValue: 10 })
    limit: number;

    @Field(() => Int, { defaultValue: 1 })    
    currentPage: number;

    @Field(() => Boolean, { defaultValue: true })
    total?: boolean;
}