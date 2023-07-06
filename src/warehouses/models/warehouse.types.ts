import { Field, Float, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Paginated } from  "../../pagination/paginator"

@ObjectType()
export class Warehouse {    
    @Field(() => Int)
    id: number;

    @Field(() => String, {
        nullable: false,
        description: "Warehouse's name",
    })
    name: string;

    @Field(() => String, {
        nullable: true,
        description: "Warehouse's description",
    })
    description?: string;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's capacity",
    })
    capacity: number;
}

@ObjectType()
export class WarehouseInventory {    
    @Field(() => Int)
    id: number;

    @Field(() => String, {
        nullable: false,
        description: "Warehouse's name",
    })
    name: string;

    @Field(() => String, {
        nullable: true,
        description: "Warehouse's description",
    })
    description?: string;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's capacity",
    })
    capacity: number;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's imported amount",
    })
    importedAmount: number;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's exported amount",
    })
    exportedAmount: number;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's current stock amount",
    })
    currentStock: number;

    @Field(() => Float, {
        nullable: false,
        description: "Warehouse's remaining capacity",
    })
    remainingCapacity: number;
}

@ObjectType()
export class PaginatedWarehouses extends Paginated<Warehouse>(Warehouse) {}