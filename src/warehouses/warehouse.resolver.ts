import { Logger } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { WarehouseService } from "./warehouse.service";
import { PaginatedWarehouses, Warehouse } from "./models/warehouse.types";
import { WarehouseCreateInput, WarehouseEditInput } from "./models/warehouse.inputs";
import { PaginateOptionsInput } from '../pagination/models/paginate-options.input';

@Resolver(() => Warehouse)
export class WarehouseResolver{

    private readonly logger = new Logger(WarehouseResolver.name);

    constructor (
        private readonly warehouseService: WarehouseService
    ) {}

    @Query(() => PaginatedWarehouses)    
    public async warehousesPaginated(
        @Args('input', { type: () => PaginateOptionsInput })
        input: PaginateOptionsInput
    ): Promise<PaginatedWarehouses>{
        return await this.warehouseService.findAll(input);
    }

    @Query(() => Warehouse)       
    public async warehouse(
        @Args('id', {type: () => Int})
        id: number
    ): Promise<Warehouse>{
        return await this.warehouseService.findOne(id);
    }
 
    @Mutation(() => Warehouse, { name: 'createWarehouse' })
    public async create(
        @Args('input', {type: () => WarehouseCreateInput}
        ) input: WarehouseCreateInput
    ): Promise<Warehouse>{
        return await this.warehouseService.create(input);
    }

    @Mutation(() => Warehouse, { name: 'editWarehouse' })
    public async edit(
        @Args('id', {type: () => Int})
        id: number,
        @Args('input', { type: () => WarehouseEditInput })
        input: WarehouseEditInput        
    ): Promise<Warehouse>{
        const product = await this.warehouseService.findOne(id);
        return await this.warehouseService .update(id, Object.assign(product, input));
    }
}