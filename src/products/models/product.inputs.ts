import { Field, Int, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, Length, Max, MaxLength, MinLength } from 'class-validator';
import { IsProduct } from '../validators/is-product.validator';

@InputType()
export class ProductCreateInput {
    @Field(() => String, {
        nullable: false,
        description: "User's name to the product",
    })
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @Field(() => String, {
        nullable: true,
        description: "User's description to the product",
    })
    description?: string;

    @Field(() => Int, {
        nullable: false,
        description: "User's size to the product",
    })
    size: number;

    @Field(() => Boolean, {
        nullable: false,
        description: "User's hazardous to the product",
    })
    hazardous: boolean;
}

@InputType()
export class ProductEditInput extends PartialType( 
    OmitType(ProductCreateInput, ['name'])
) {
    @Field(() => Int, {
        nullable: false,
        description: "Product's id to edit",
    })
    @IsProduct()
    id: number;
}

