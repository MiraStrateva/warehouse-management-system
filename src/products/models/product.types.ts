import { Field, Float, Int, ObjectType } from "@nestjs/graphql";
import { Paginated } from  "../../pagination/paginator"

@ObjectType()
export class Product {    
    @Field(() => Int)
    id: number;

    @Field(() => String, {
        nullable: false,
        description: "Product's name",
    })
    name: string;

    @Field(() => String, {
        nullable: true,
        description: "Product's description",
    })
    description?: string;

    @Field(() => Float, {
        nullable: false,
        description: "Product's size per unit amount",
    })
    size: number;

    @Field()
    hazardous: boolean;
}

@ObjectType()
export class PaginatedProducts extends Paginated<Product>(Product) {}