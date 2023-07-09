import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { 
    Inventory, 
    InventoryMovements, 
    InventoryMovementsHistory, 
    PaginatedInventoryMovements} from "./models/inventory-movements.types";
import { BadRequestException, Logger, UseGuards } from "@nestjs/common";
import { InventoryMovementService } from './inventory-movement.service';
import { ImportExportInput } from './models/import-export.input';
import { ProductService } from '../products/product.service';
import { WarehouseService } from '../warehouses/warehouse.service';
import { AuthGuardJwtGql } from '../auth/auth-guard-jwt.gql';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserEntity } from 'src/auth/user.entity';
import { CalculatorService } from './calculator.service';
import { PaginateOptionsInput } from 'src/pagination/models/paginate-options.input';

@Resolver(() => InventoryMovements)
export class InvnentoryMovementResolver{

    private readonly logger = new Logger(InvnentoryMovementResolver.name);

    constructor (
        private readonly inventoryMovementService: InventoryMovementService,
        private readonly productService: ProductService,
        private readonly warehouseService: WarehouseService, 
        private readonly calculatorService: CalculatorService
    ) {}

    @Query(() => PaginatedInventoryMovements)    
    public async inventoryMovements(
        @Args('input', { type: () => PaginateOptionsInput })
        input: PaginateOptionsInput
    ): Promise<PaginatedInventoryMovements>{
        return await this.inventoryMovementService.findAll(input);
    }

    @Query(() => [InventoryMovementsHistory])    
    public async inventoryMovementsHistory(
        @Args('dateFrom', { type: () => Date, nullable: true })
        dateFrom: Date,
        @Args('dateTo', { type: () => Date, nullable: true })
        dateTo: Date,
        @Args('warehouseId', { type: () => Number, nullable: true })
        warehouseId?: number
    ): Promise<InventoryMovementsHistory[]>{
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

        // Check if import is possible
        // 1. hazardous products are not kept in the same warehouse as non-hazardous products
        var product = await this.productService.findOne(input.productId);
        if (!await this.inventoryMovementService
                .checkForImportPossibility(product.hazardous, input.warehouseId)){
            throw new Error(
                "Hazardous products are not kept in the same warehouse as non-hazardous products");
        }

        // 2. warehouse capacity is not exceeded
        var warehouseInventory = await this.inventoryMovementService
            .getWarehouseInventory(input.date, input.warehouseId);

        this.logger.debug(warehouseInventory);

        if (warehouseInventory.length > 0){
            let currentWarehouseStock = 0;
            warehouseInventory.forEach(product => {
                currentWarehouseStock += product.currentStock;
            });

            this.logger.debug(currentWarehouseStock);

            if (input.amount > (warehouseInventory[0].capacity - currentWarehouseStock)){
                throw new Error(
                    "There is not enough space in the warehouse to import this amount of products");
            }
        }

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
        
        // Check if export is possible
        // 1. warehouse has enough stock
        var productAvailability = await this.inventoryMovementService
            .getProductAvailability(input.date, input.productId, input.warehouseId);

        let sum = 0;
        productAvailability.forEach(number => {
            sum += number.availability;
        });
       
        if (input.amount > sum){
            throw new Error(
                "There is not enough stock in the warehouse to export this amount of products");
        }

        return await this.inventoryMovementService.export(input, user);
    }

    @Query(() => [Inventory])
    public async inventory(
        @Args('date', { type: () => Date, nullable: true })
        date: Date,
        @Args('warehouseId', { type: () => Number })
        warehouseId: number
    ): Promise<Inventory[]>{
        const dateParsed = date ? new Date(date) : new Date();

        this.logger.log(`Calculating inventory for date: ${dateParsed}, warehouseId: ${warehouseId}`);

        const inventoryStock = await this.inventoryMovementService.getWarehouseInventory(
            dateParsed, warehouseId);

        if (inventoryStock.length === 0){
            var warehouse = await this.warehouseService.findOne(warehouseId);
            return [new Inventory({
                capacity: warehouse.capacity, 
                currentStock: 0, 
                remainingCapacity: warehouse.capacity})];
        }

        let currentWarehouseStock = 0;
        inventoryStock.forEach(product => {
            currentWarehouseStock += product.currentStock;
        });

        const remainingCapacity = await this.calculatorService.calculate(
            `${inventoryStock[0].capacity}-${currentWarehouseStock}`);

        return [new Inventory({
                capacity: inventoryStock[0].capacity,
                currentStock: currentWarehouseStock,
                remainingCapacity: remainingCapacity})];
    }
}