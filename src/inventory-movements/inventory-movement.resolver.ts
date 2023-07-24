import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { 
    Inventory, 
    InventoryMovements, 
    PaginatedInventoryMovements,
    InventoryMovementsHistoryReport} from "./models/inventory-movements.types";
import { Logger, UseGuards } from "@nestjs/common";
import { InventoryMovementService } from './inventory-movement.service';
import { ImportExportInput } from './models/import-export.input';
import { AuthGuardJwtGql } from '../auth/auth-guard-jwt.gql';
import { CurrentUser } from '../users/current-user.decorator';
import { UserEntity } from '../users/user.entity';
import { PaginateOptionsInput } from '../pagination/models/paginate-options.input';

@Resolver(() => InventoryMovements)
export class InvnentoryMovementResolver{

    private readonly logger = new Logger(InvnentoryMovementResolver.name);

    constructor (
        private readonly inventoryMovementService: InventoryMovementService
    ) {}

    @Query(() => PaginatedInventoryMovements, { name: 'inventoryMovementsList' })    
    public async inventoryMovements(
        @Args('input', { type: () => PaginateOptionsInput })
        input: PaginateOptionsInput
    ): Promise<PaginatedInventoryMovements>{
        return await this.inventoryMovementService.findAll(input);
    }

    @Query(() => [InventoryMovementsHistoryReport])    
    public async inventoryMovementsHistoryReport(
        @Args('dateFrom', { type: () => Date, nullable: true })
        dateFrom: Date,
        @Args('dateTo', { type: () => Date, nullable: true })
        dateTo: Date,
        @Args('warehouseId', { type: () => Number, nullable: true })
        warehouseId?: number
    ): Promise<InventoryMovementsHistoryReport[]>{
        const dateFromParsed = dateFrom ? new Date(dateFrom) : new Date(0);
        const dateToParsed = dateTo ? new Date(dateTo) : new Date();

        this.logger.log(
            `Requiring Inventory Movements History from date: ${dateFromParsed} to date: ${dateToParsed} for warehouse: ${warehouseId}`);

        return await this.inventoryMovementService
            .getHistoryReport(dateFromParsed, dateToParsed, warehouseId);
    }

    @Mutation(() => InventoryMovements, { name: 'import' })
    @UseGuards(AuthGuardJwtGql)
    public async import(
        @Args('input', {type: () => ImportExportInput}) 
        input: ImportExportInput,
        @CurrentUser() user: UserEntity
        ): Promise<InventoryMovements>{
        
        this.logger.log(`Importing ${input.amount} products with id: ${input.productId} to warehouse: ${input.warehouseId}`);

        return await this.inventoryMovementService.import(input, user);
    }

    @Mutation(() => InventoryMovements, { name: 'export' })
    @UseGuards(AuthGuardJwtGql)
    public async export(
        @Args('input', {type: () => ImportExportInput}) 
        input: ImportExportInput,
        @CurrentUser() user: UserEntity
    ): Promise<InventoryMovements>{
        
        this.logger.log(`Exporting ${input.amount} products with id: ${input.productId} from warehouse: ${input.warehouseId}`);
        
        return await this.inventoryMovementService.export(input, user);
    }

    @Query(() => [Inventory], { name: 'warehouseInventoryReport' })
    public async warehouseInventory(
        @Args('date', { type: () => Date, nullable: true })
        date: Date,
        @Args('warehouseId', { type: () => Number, nullable: false })
        warehouseId: number
    ): Promise<Inventory[]>{
        const dateParsed = date ? new Date(date) : new Date();

        this.logger.log(`Calculating inventory for date: ${dateParsed}, warehouseId: ${warehouseId}`);

        return await this.inventoryMovementService.getWarehouseInventoryReport(dateParsed, warehouseId);
    }
}