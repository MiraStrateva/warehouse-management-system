import { Logger } from "@nestjs/common";
import { Args, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { WarehouseService } from "./warehouse.service";
import { PaginatedWarehouses, Warehouse, WarehouseInventory } from "./models/warehouse.types";
import { WarehouseCreateInput, WarehouseEditInput } from "./models/warehouse.inputs";
import { PaginateOptionsInput } from '../pagination/models/paginate-options.input';
import { EntityWithId } from '../app.types';

@Resolver(() => Warehouse)
export class WarehouseResolver{

    private readonly logger = new Logger(WarehouseResolver.name);

    constructor (
        private readonly warehouseService: WarehouseService
    ) {}

    @Query(() => PaginatedWarehouses, { name: 'warehousesList', nullable: true })    
    public async warehousesPaginated(
        @Args('input', { type: () => PaginateOptionsInput })
        input: PaginateOptionsInput
    ): Promise<PaginatedWarehouses>{
        return await this.warehouseService.findAll(input);
    }

    @Query(() => Warehouse, { name: 'warehouseInfo', nullable: true })       
    public async warehouse(
        @Args('id', {type: () => Int})
        id: number
    ): Promise<Warehouse>{
        return await this.warehouseService.findOne(id);
    }

    @Query(() => [WarehouseInventory], { name: 'warehouseInventoryReport', nullable: true })
    public async warehouseInventory(
        @Args('date', { type: () => Date, nullable: true })
        date: Date,
        @Args('warehouseId', { type: () => Number, nullable: true })
        warehouseId?: number
    ): Promise<WarehouseInventory[]>{
        const dateParsed = date ? new Date(date) : new Date();
        this.logger.log(`Getting warehouse inventory report for ${dateParsed.toISOString()} and warehouse ${warehouseId}`);
        
        return await this.warehouseService.getInventoryReport(dateParsed, warehouseId);
    }
 
    @Mutation(() => Warehouse, { name: 'createWarehouse' })
    public async create(
        @Args('input', {type: () => WarehouseCreateInput}) 
        input: WarehouseCreateInput
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
        return await this.warehouseService .update(id, input);
    }

    @Mutation(() => EntityWithId, { name: 'deleteWarehouse' })
    public async delete(
        @Args('id', {type: () => Int})
        id: number
    ): Promise<EntityWithId>{
        await this.warehouseService.delete(id);
        return new EntityWithId(id);
    }
}