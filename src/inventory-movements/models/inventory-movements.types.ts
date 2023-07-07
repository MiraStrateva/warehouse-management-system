import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Product } from "../../products/models/product.types";
import { Warehouse } from "../../warehouses/models/warehouse.types";
import { number } from "yargs";

export enum Direction {
    Import = 'import',
    Export = 'export'
}

@ObjectType()
export class InventoryMovements{
    @Field()
    id: number;

    @Field(() => Direction)
    direction: Direction;

    @Field()
    date: Date;

    @Field()
    amount: number;

    @Field(() => Warehouse, { nullable: false })
    warehouse: Warehouse;

    @Field(() => Product, { nullable: false })
    product: Product;
}

@ObjectType()
export class InventoryMovementsHistory{
    @Field()
    date: Date;

    @Field(() => Direction)
    direction: Direction;

    @Field()
    productName: string;

    @Field()
    amount: number;   

    @Field()
    size: number;

    @Field()
    warehouseName: string;

    @Field()
    total: number;
}

@ObjectType()
export class InventoryStock{
    @Field()
    capacity: number;

    @Field()
    currentStock: number;   
}

@ObjectType()
export class Inventory{
    @Field()
    capacity: number;

    @Field()
    currentStock: number;  
    
    @Field()
    remainingCapacity: number;
}

@ObjectType()
export class ProductAvailability{
    @Field()
    availability: number;
}

registerEnumType(Direction, {name: 'Direction' });