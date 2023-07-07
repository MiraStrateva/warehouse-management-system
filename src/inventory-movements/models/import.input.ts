import { Field, Float, InputType } from "@nestjs/graphql";
import { IsProduct } from '../../products/validators/is-product.validator';

@InputType()
export class ImportInput {
    @Field(() => Number, {
        nullable: false,
        description: "Warehouse you want to import",
    })
    //TODO: Custom validator to check if warehouse exists and !deleted
    warehouseId: number;

    @Field(() => Number, {
        nullable: false,
        description: "Imported product",
    })
    @IsProduct()
    productId: number;

    @Field(() => Float, {
        nullable: false,
        description: "Imported amount",
    })
    amount: number;

    @Field(() => Date, {
        nullable: false,
        defaultValue: new Date(),
        description: "Imported date",
    })
    date: Date;
}