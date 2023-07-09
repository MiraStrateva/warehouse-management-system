import { Field, Float, InputType } from "@nestjs/graphql";
import { IsProduct } from '../../products/validators/is-product.validator';
import { IsNotEmpty } from "class-validator";
import { IsWarehouse } from "src/warehouses/validators/is-warehouse.validator";

@InputType()
export class ImportExportInput {
    @Field(() => Number, {
        nullable: false,
        description: "Warehouse you want to import/export",
    })
    @IsNotEmpty()
    @IsWarehouse()
    warehouseId: number;

    @Field(() => Number, {
        nullable: false,
        description: "Imported/Exported product",
    })
    @IsNotEmpty()
    @IsProduct()
    productId: number;

    @Field(() => Date, {
        nullable: false,
        defaultValue: new Date(),
        description: "Date of Import/Export",
    })
    date: Date;

    @Field(() => Float, {
        nullable: false,
        description: "Imported/Exported amount",
    })
    @IsNotEmpty()
    amount: number;
}