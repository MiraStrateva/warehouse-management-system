import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class WarehouseCreateInput {
    @Field(() => String, {
        nullable: false,
        description: "User's name to the warehouse",
    })
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @Field(() => String, {
        nullable: true,
        description: "User's description to the warehouse",
    })
    description?: string;

    @Field(() => Int, {
        nullable: false,
        description: "User's capacity to the warehouse",
    })
    capacity: number;
}

@InputType()
export class WarehouseEditInput extends PartialType( 
    OmitType(WarehouseCreateInput, ['name'])
) {}

