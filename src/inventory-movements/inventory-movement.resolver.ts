import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inventory, InventoryMovements, InventoryMovementsHistory, InventoryStock, ProductAvailability } from "./models/inventory-movements.types";
import { Logger } from "@nestjs/common";
import { InventoryMovementService } from './inventory-movement.service';

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
        @Args('date', { type: () => Date })
        date: Date,
        @Args('warehouseId', { type: () => Number, nullable: true })
        warehouseId?: Number
    ): Promise<InventoryMovementsHistory[]>{
        return await this.inventoryMovementService.getHistoryReport(date, warehouseId);
    }

    // TODO: This is not working, use logic when importing products
    @Query(() => Inventory)
    public async inventory(
        @Args('warehouseId', { type: () => Number })
        warehouseId: number
    ): Promise<InventoryStock[]>{
        const inventoryStock = await this.inventoryMovementService.getWarehouseInventory(
            warehouseId);

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
        @Args('productId', { type: () => Number })
        productId: number,
        @Args('warehouseId', { type: () => Number })
        warehouseId: number)
        : Promise<number>{
        
        const productAvailability = await this.inventoryMovementService.getProductAvailability(
            productId, warehouseId);
        
        let sum = 0;
        productAvailability.forEach(number => {
            sum += number.availability;
        });
        return sum;
    }

}