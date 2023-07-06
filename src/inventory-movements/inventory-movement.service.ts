import { InjectRepository } from "@nestjs/typeorm";
import { InventoryMovementsEntity } from "./inventory-movement.entity";
import { MoreThanOrEqual, Repository, getConnection } from "typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { InventoryMovements, InventoryMovementsHistory, InventoryStock, ProductAvailability } from "./models/inventory-movements.types";

@Injectable()
export class InventoryMovementService {
    private readonly logger = new Logger(InventoryMovementService.name);

    constructor(
        @InjectRepository(InventoryMovementsEntity)
        private readonly inventoryMovementsRepository: Repository<InventoryMovementsEntity>
    ){}

    async findAll(): Promise<InventoryMovements[]> {
        return await this.inventoryMovementsRepository
            .find({ relations: ['product', 'warehouse']});
    }

    async getHistoryReport(
        date: Date, 
        warehouseId?: Number
        ): Promise<InventoryMovementsHistory[]> {
        
        
        const history = await this.inventoryMovementsRepository
            .find({ 
                select: ["date", "direction", "product", "amount", "warehouse"],
                relations: ['product', 'warehouse'],
                where: [{ date: MoreThanOrEqual(date) }],
                order: { date: "ASC" }});

        this.logger.debug(history);

        return history.map((movement) => {
            return {
                date: movement.date,
                direction: movement.direction,
                productName: movement.product.name,
                amount: movement.amount,
                size: movement.product.size,
                warehouseName: movement.warehouse.name,
                total: movement.direction === 'import' ?
                     movement.amount*movement.product.size :
                     -movement.amount*movement.product.size}});
    }

    async checkForImportPossibility(
        hazardous: boolean, warehouseId: number
        ): Promise<boolean> {

        this.logger.debug(`Checking for hazardous in warehouse: {warehouseId}, hazardous: {hazardous}`);
        
        const lastWarehouseInventory = await this.inventoryMovementsRepository.findOne({
            select: ["product"],
            relations: ['product'],
            where: [{ warehouseId: warehouseId}],
            order: { date: "DESC" }});

        return (lastWarehouseInventory == null ||
            lastWarehouseInventory.product.hazardous === hazardous);
    }

    async getWarehouseInventory(
        warehouseId: number
        ): Promise<InventoryStock[]> {

        this.logger.debug(`Checking for inventory stock in warehouse: {warehouseId}, date: {date}`);
        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["warehouse", "product", "amount", "direction"],
            relations: ['warehouse', 'product'],
            where: [{ warehouseId: warehouseId}]
        });      
        
        this.logger.debug(warehouseInventory);

        return warehouseInventory.map((movement) => {
            return {
            capacity: movement.warehouse.capacity,
            currentStock: movement.direction === 'import' 
                        ? movement.amount*movement.product.size 
                        : -movement.amount*movement.product.size}});
    }

    async getProductAvailability(
        productId: number, warehouseId: number
        ): Promise<ProductAvailability[]> {

        const warehouseInventory = await this.inventoryMovementsRepository.find({
            select: ["product", "amount", "direction"],
            relations: ['product'],	
            where: [{ warehouseId: warehouseId, productId: productId}]});
        this.logger.debug(warehouseInventory);          
        
        return warehouseInventory.map((movement) => {
            return {
            availability: movement.direction === 'import' 
                        ? movement.amount*movement.product.size 
                        : -movement.amount*movement.product.size}});        
    }
}