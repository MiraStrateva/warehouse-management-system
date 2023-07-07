import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { Inventory, InventoryMovements, InventoryMovementsHistory, InventoryStock, ProductAvailability } from "./models/inventory-movements.types";
import { Logger } from "@nestjs/common";
import { InventoryMovementService } from './inventory-movement.service';
import { ImportInput } from './models/import.input';

@Resolver(() => InventoryMovements)
export class InvnentoryMovementResolver{

    private readonly logger = new Logger(InvnentoryMovementResolver.name);

    constructor (
        private readonly inventoryMovementService: InventoryMovementService
    ) {}

    @Query(() => [InventoryMovements])    
    public async inventoryMovements(): Promise<InventoryMovements[]>{
        return await this.inventoryMovementService.findAll();
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

        this.logger.debug(`dateFrom: ${dateFromParsed}, dateTo: ${dateToParsed}, warehouseId: ${warehouseId}`);

        return await this.inventoryMovementService.getHistoryReport(dateFromParsed, dateToParsed, warehouseId);
    }

    @Mutation(() => InventoryMovements, { name: 'import' })
    public async import(
        @Args('input', {type: () => ImportInput}
        ) input: ImportInput
        ): Promise<InventoryMovements>{
        
        return await this.inventoryMovementService.import(input);
    }

    // TODO: This is not working, use logic when importing products
    @Query(() => Inventory)
    public async inventory(
        @Args('date', { type: () => Date, nullable: true })
        date: Date,
        @Args('warehouseId', { type: () => Number })
        warehouseId: number
    ): Promise<Inventory[]>{
        const dateParsed = date ? new Date(date) : new Date();

        const inventoryStock = await this.inventoryMovementService.getWarehouseInventory(
            dateParsed, warehouseId);

        this.logger.debug(inventoryStock);

        if (inventoryStock.length === 0){
            return [];
        }

        let currentWarehouseStock = 0;
        inventoryStock.forEach(product => {
            currentWarehouseStock += product.currentStock;
        });

        this.logger.debug(currentWarehouseStock);

        let inventory = new Inventory();
        inventory.capacity = inventoryStock[0].capacity;
        inventory.currentStock = currentWarehouseStock;
        inventory.remainingCapacity = inventory.capacity - inventory.currentStock;

        this.logger.debug([inventory]);

        return [inventory];
    }

    // TODO: To be used when importing products
    @Query(() => Boolean)
    public async importPossibility(
        @Args('hazardous', { type: () => Boolean })
        hazardous: boolean,
        @Args('warehouseId', { type: () => Number })
        warehouseId: number): Promise<boolean>{
        return await this.inventoryMovementService.checkForImportPossibility(hazardous, warehouseId);
    }

    // TODO: To be used when exporting products
    @Query(() => Number)
    public async productAvailability(
        @Args('date', { type: () => Date, nullable: true })
        date: Date,
        @Args('productId', { type: () => Number })
        productId: number,
        @Args('warehouseId', { type: () => Number })
        warehouseId: number
        ): Promise<number>{
        
        const dateParsed = date ? new Date(date) : new Date();
        const productAvailability = await this.inventoryMovementService.getProductAvailability(
            dateParsed, productId, warehouseId);
        
        let sum = 0;
        productAvailability.forEach(number => {
            sum += number.availability;
        });
        return sum;
    }

}