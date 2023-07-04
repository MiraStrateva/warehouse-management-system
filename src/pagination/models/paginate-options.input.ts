import { Field, InputType, Int } from "@nestjs/graphql";
import { PaginateOptions } from "../paginator";

@InputType()
export class PaginateOptionsInput implements PaginateOptions {
    @Field(() => Int, { defaultValue: 10 })
    limit: number;

    @Field(() => Int, { defaultValue: 1 })    
    currentPage: number;

    @Field(() => Boolean, { defaultValue: true })
    total?: boolean;
}